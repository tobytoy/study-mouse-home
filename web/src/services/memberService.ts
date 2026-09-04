import { supabase } from "./supabaseClient";
import { getLocalApplication } from "./accessService";

export type MemberTier = "guest" | "member" | "vip" | "admin";
export type MemberStatus = "active" | "pending" | "suspended" | "NONE";

export interface MemberProfile {
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  tier: MemberTier;
  status: MemberStatus;
  isMember: boolean;
  allUnlocked: boolean;
  allowedExams: Array<{ categoryId: string; examId: string }>;
}

const ADMIN_USER_IDS = ["Uaecf740fc05ef668b671fa90da9c832e"];
const WORKER_API_URL = import.meta.env.VITE_WORKER_API_URL || "https://line-assistant-worker.tobywang2021.workers.dev";

export async function resolveMemberProfile(userId: string, displayName: string, pictureUrl?: string): Promise<MemberProfile> {
  // 1. Admin Hardcode Check (Toby)
  if (ADMIN_USER_IDS.includes(userId)) {
    return {
      lineUserId: userId,
      displayName,
      pictureUrl,
      tier: "admin",
      status: "active",
      isMember: true,
      allUnlocked: true,
      allowedExams: [{ categoryId: "*", examId: "*" }],
    };
  }

  // 2. Supabase Check (If Connected)
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc("check_member_access", {
        p_line_user_id: userId,
      });
      if (!error && data) {
        return {
          lineUserId: userId,
          displayName,
          pictureUrl,
          tier: (data.tier as MemberTier) || "guest",
          status: (data.status as MemberStatus) || "NONE",
          isMember: Boolean(data.is_member),
          allUnlocked: Boolean(data.all_unlocked),
          allowedExams: Array.isArray(data.allowed_exams) ? data.allowed_exams : [],
        };
      }
    } catch (err) {
      console.warn("[MemberService] Supabase RPC failed:", err);
    }
  }

  // 3. Worker / KV Check
  if (WORKER_API_URL) {
    try {
      const resp = await fetch(`${WORKER_API_URL}/api/studymouse/status?userId=${encodeURIComponent(userId)}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (resp.ok) {
        const data = await resp.json() as { status?: string };
        if (data.status === "APPROVED") {
          return {
            lineUserId: userId,
            displayName,
            pictureUrl,
            tier: "member",
            status: "active",
            isMember: true,
            allUnlocked: true, // Approved members get access to all current papers
            allowedExams: [{ categoryId: "*", examId: "*" }],
          };
        } else if (data.status === "PENDING") {
          return {
            lineUserId: userId,
            displayName,
            pictureUrl,
            tier: "guest",
            status: "pending",
            isMember: false,
            allUnlocked: false,
            allowedExams: [],
          };
        }
      }
    } catch (err) {
      console.warn("[MemberService] Worker check failed:", err);
    }
  }

  // 4. Local Storage Fallback
  const local = getLocalApplication(userId);
  if (local) {
    if (local.status === "APPROVED") {
      return {
        lineUserId: userId,
        displayName,
        pictureUrl,
        tier: "member",
        status: "active",
        isMember: true,
        allUnlocked: true,
        allowedExams: [{ categoryId: "*", examId: "*" }],
      };
    }
    return {
      lineUserId: userId,
      displayName,
      pictureUrl,
      tier: "guest",
      status: local.status === "PENDING" ? "pending" : "NONE",
      isMember: false,
      allUnlocked: false,
      allowedExams: [],
    };
  }

  // 5. Default Guest Profile
  return {
    lineUserId: userId,
    displayName,
    pictureUrl,
    tier: "guest",
    status: "NONE",
    isMember: false,
    allUnlocked: false,
    allowedExams: [],
  };
}

export function canPracticeExam(profile: MemberProfile, _categoryId: string, _examId: string): boolean {
  if (profile.allUnlocked) return true;
  if (profile.tier === "admin" || profile.tier === "vip") return true;

  // Stage 1: Free for everyone!
  return true;
}
