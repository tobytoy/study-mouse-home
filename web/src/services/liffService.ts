import liff from "@line/liff";

export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  isMock?: boolean;
}

const MOCK_PROFILE: LineUserProfile = {
  userId: "U_LOCAL_DEV_USER_001",
  displayName: "本地測試考友",
  pictureUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=StudyMouse",
  isMock: true,
};

let isLiffInitialized = false;

export async function initLiff(liffId?: string): Promise<LineUserProfile> {
  // If no LIFF ID configured, or running outside LINE in dev mode
  if (!liffId || liffId.trim() === "" || liffId === "YOUR_LIFF_ID") {
    console.info("[LIFF] Running in Mock/Dev mode (No LIFF ID provided)");
    isLiffInitialized = true;
    return MOCK_PROFILE;
  }

  try {
    if (!isLiffInitialized) {
      await liff.init({ liffId });
      isLiffInitialized = true;
    }

    if (!liff.isLoggedIn()) {
      if (liff.isInClient()) {
        liff.login();
      } else {
        console.info("[LIFF] External browser not logged in, using guest/mock profile");
      }
      return MOCK_PROFILE;
    }

    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
      isMock: false,
    };
  } catch (error) {
    console.warn("[LIFF] Initialization failed, falling back to mock profile:", error);
    return MOCK_PROFILE;
  }
}

export function isInsideLineApp(): boolean {
  return typeof window !== "undefined" && liff.isInClient();
}

export async function sendLineFlexMessage(messages: Parameters<typeof liff.sendMessages>[0]) {
  if (liff.isInClient() && liff.isLoggedIn()) {
    return await liff.sendMessages(messages);
  } else {
    console.info("[LIFF] Mock sendMessages:", messages);
  }
}
