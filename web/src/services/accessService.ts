export type AccessStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export interface AccessApplication {
  ticketId: string;
  userId: string;
  displayName: string;
  targetExam: string;
  purpose: string;
  status: AccessStatus;
  appliedAt: string;
  approvedAt?: string;
  adminNote?: string;
}

const STORAGE_KEY = "studymouse_access_app";
const WORKER_API_URL = import.meta.env.VITE_WORKER_API_URL || "https://line-assistant-worker.tobywang2021.workers.dev";
const GOOGLE_SHEET_ENDPOINT = import.meta.env.VITE_GOOGLE_SHEET_APP_URL || "";

export function getLocalApplication(userId: string): AccessApplication | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to load application from storage", e);
  }
  return null;
}

export function saveLocalApplication(app: AccessApplication): void {
  localStorage.setItem(`${STORAGE_KEY}:${app.userId}`, JSON.stringify(app));
}

export function generateTicketId(): string {
  const d = new Date();
  const dateStr = d.getFullYear().toString() + 
    String(d.getMonth() + 1).padStart(2, "0") + 
    String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SM-${dateStr}-${rand}`;
}

export async function checkUserAccessStatus(userId: string): Promise<{
  status: AccessStatus;
  application: AccessApplication | null;
}> {
  // 1. Check local storage first
  const local = getLocalApplication(userId);
  
  // 2. Check Cloudflare Worker API (5ms KV cache)
  if (WORKER_API_URL) {
    try {
      const resp = await fetch(`${WORKER_API_URL}/api/studymouse/status?userId=${encodeURIComponent(userId)}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (resp.ok) {
        const data = await resp.json() as { status?: AccessStatus; application?: AccessApplication };
        if (data.status && data.status !== "NONE") {
          const updated: AccessApplication = data.application || local || {
            ticketId: generateTicketId(),
            userId,
            displayName: "考友",
            targetExam: "全部考題",
            purpose: "自主練習",
            status: data.status,
            appliedAt: new Date().toISOString(),
          };
          updated.status = data.status;
          saveLocalApplication(updated);
          return { status: data.status, application: updated };
        }
      }
    } catch (err) {
      console.warn("[AccessService] Worker check failed, using local fallback", err);
    }
  }

  // 3. Check Google Sheet directly if configured
  if (GOOGLE_SHEET_ENDPOINT) {
    try {
      const resp = await fetch(`${GOOGLE_SHEET_ENDPOINT}?action=studymouse_check&userId=${encodeURIComponent(userId)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (resp.ok) {
        const data = await resp.json() as { status?: AccessStatus };
        if (data.status && data.status !== "NONE") {
          const updated: AccessApplication = local || {
            ticketId: generateTicketId(),
            userId,
            displayName: "考友",
            targetExam: "全部考題",
            purpose: "自主練習",
            status: data.status,
            appliedAt: new Date().toISOString(),
          };
          updated.status = data.status;
          saveLocalApplication(updated);
          return { status: data.status, application: updated };
        }
      }
    } catch (err) {
      console.warn("[AccessService] Google Sheet check failed", err);
    }
  }
  // 3. In dev mode or default without remote server, default to APPROVED for instant evaluation,
  // or return current local status
  if (!local) {
    // If no application yet
    return { status: "NONE", application: null };
  }

  return { status: local.status, application: local };
}

export async function submitAccessApplication(params: {
  userId: string;
  displayName: string;
  targetExam: string;
  purpose: string;
}): Promise<AccessApplication> {
  const ticketId = generateTicketId();
  const now = new Date().toISOString();

  const application: AccessApplication = {
    ticketId,
    userId: params.userId,
    displayName: params.displayName,
    targetExam: params.targetExam,
    purpose: params.purpose,
    status: "PENDING",
    appliedAt: now,
  };

  // 1. Save locally
  saveLocalApplication(application);

  // 2. Submit to Cloudflare Worker
  if (WORKER_API_URL) {
    try {
      await fetch(`${WORKER_API_URL}/api/studymouse/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(application),
        signal: AbortSignal.timeout(6000),
      });
    } catch (err) {
      console.warn("[AccessService] Failed to post to Worker", err);
    }
  }

  // 3. Direct Google Sheet Fallback
  if (GOOGLE_SHEET_ENDPOINT) {
    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "studymouse_apply",
          ...application,
        }),
      });
    } catch (err) {
      console.warn("[AccessService] Failed to post to Google Sheet", err);
    }
  }
  return application;
}
