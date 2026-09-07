/**
 * Browser permission helpers for SURAKSHA.
 *
 * All functions are browser-only: call them from event handlers or effects,
 * never during render or module evaluation.
 */

export type PermissionKey = "camera" | "microphone" | "geolocation" | "notifications";

export type PermissionState =
  | "unsupported" // API missing in this browser
  | "insecure" // needs HTTPS / localhost
  | "unknown" // supported, not queried or query unavailable
  | "prompt" // will ask when requested
  | "granted"
  | "denied";

export type PermissionInfo = {
  key: PermissionKey;
  label: string;
  why: string;
  state: PermissionState;
  detail?: string;
};

export const PERMISSION_COPY: Record<PermissionKey, { label: string; why: string }> = {
  camera: {
    label: "Camera",
    why: "Records video evidence of an incident, with a live preview always visible to you while recording.",
  },
  microphone: {
    label: "Microphone",
    why: "Records audio evidence and powers spoken safe-word triggers. A recording indicator stays on screen.",
  },
  geolocation: {
    label: "Location",
    why: "Attaches your precise position to an SOS so responders and guardians know where to go.",
  },
  notifications: {
    label: "Notifications",
    why: "Alerts you about guardian replies and check-in reminders even when this tab is in the background.",
  },
};

export function isSecureContextOk(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext || window.location.hostname === "localhost";
}

export function isMediaSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

/** Read the current state without triggering a prompt. */
export async function readPermission(key: PermissionKey): Promise<PermissionState> {
  if (typeof window === "undefined") return "unknown";

  if (key === "notifications") {
    if (!("Notification" in window)) return "unsupported";
    const p = Notification.permission;
    return p === "default" ? "prompt" : (p as PermissionState);
  }

  if (key === "geolocation" && !navigator.geolocation) return "unsupported";
  if ((key === "camera" || key === "microphone") && !isMediaSupported()) return "unsupported";
  if (!isSecureContextOk()) return "insecure";

  try {
    const status = await navigator.permissions?.query({
      name: key as PermissionName,
    });
    if (!status) return "unknown";
    return status.state as PermissionState;
  } catch {
    // Safari and older Firefox do not expose camera/microphone here.
    return "unknown";
  }
}

export async function readAllPermissions(): Promise<Record<PermissionKey, PermissionState>> {
  const keys: PermissionKey[] = ["camera", "microphone", "geolocation", "notifications"];
  const states = await Promise.all(keys.map(readPermission));
  return Object.fromEntries(keys.map((k, i) => [k, states[i]])) as Record<
    PermissionKey,
    PermissionState
  >;
}

export type RequestResult = { state: PermissionState; message: string };

/** MUST be called from a user gesture (click / tap). */
export async function requestPermission(key: PermissionKey): Promise<RequestResult> {
  if (typeof window === "undefined") return { state: "unknown", message: "Not available." };

  if (key === "notifications") {
    if (!("Notification" in window))
      return { state: "unsupported", message: "This browser has no notification support." };
    try {
      const res = await Notification.requestPermission();
      return res === "granted"
        ? { state: "granted", message: "Notifications enabled." }
        : res === "denied"
          ? { state: "denied", message: "Notifications blocked. Re-enable them in site settings." }
          : { state: "prompt", message: "Notification request dismissed." };
    } catch {
      return { state: "unknown", message: "Notification request failed." };
    }
  }

  if (key === "geolocation") {
    if (!navigator.geolocation)
      return { state: "unsupported", message: "This browser has no location support." };
    if (!isSecureContextOk())
      return { state: "insecure", message: "Location needs a secure (HTTPS) connection." };
    return new Promise<RequestResult>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            state: "granted",
            message: `Location locked (±${Math.round(pos.coords.accuracy)} m).`,
          }),
        (err) =>
          resolve(
            err.code === err.PERMISSION_DENIED
              ? { state: "denied", message: "Location blocked. Allow it in site settings." }
              : {
                  state: "prompt",
                  message:
                    err.code === err.TIMEOUT
                      ? "Location timed out. Try again outdoors or near a window."
                      : "Location is unavailable right now.",
                },
          ),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  }

  // camera / microphone
  if (!isMediaSupported())
    return { state: "unsupported", message: "This browser cannot access media devices." };
  if (!isSecureContextOk())
    return { state: "insecure", message: "Camera and microphone need a secure (HTTPS) page." };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(
      key === "camera" ? { video: true } : { audio: true },
    );
    stream.getTracks().forEach((t) => t.stop());
    return { state: "granted", message: `${PERMISSION_COPY[key].label} access granted.` };
  } catch (e) {
    return { state: mediaErrorState(e), message: describeMediaError(e, key) };
  }
}

export function mediaErrorState(e: unknown): PermissionState {
  const name = (e as DOMException)?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "unsupported";
  return "unknown";
}

export function describeMediaError(e: unknown, key?: PermissionKey): string {
  const name = (e as DOMException)?.name;
  const label = key ? PERMISSION_COPY[key].label.toLowerCase() : "device";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return `Access to your ${label} was blocked. Open the padlock icon in the address bar and set it to Allow.`;
    case "NotFoundError":
      return `No ${label} was found on this device.`;
    case "NotReadableError":
      return `Your ${label} is already in use by another app. Close it and try again.`;
    case "OverconstrainedError":
      return `The selected ${label} is no longer available. Pick another one.`;
    case "AbortError":
      return `Starting the ${label} was interrupted. Try again.`;
    default:
      return `Could not start the ${label}. Try again.`;
  }
}

/** Short, human guidance for a non-granted state. */
export function guidanceFor(state: PermissionState): string | null {
  switch (state) {
    case "denied":
      return "Blocked. Tap the padlock (or 'aA') icon next to the web address, open site settings, and switch this to Allow — then reload.";
    case "insecure":
      return "This needs a secure HTTPS address. It works on the published site and on localhost.";
    case "unsupported":
      return "Your browser or device does not offer this. Everything else still works.";
    default:
      return null;
  }
}

export const STATE_LABEL: Record<PermissionState, string> = {
  granted: "Allowed",
  denied: "Blocked",
  prompt: "Not asked yet",
  unknown: "Ask when needed",
  insecure: "Needs HTTPS",
  unsupported: "Unavailable",
};
