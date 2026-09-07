import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, Video, Square, Download, Trash2, Info, ShieldCheck, CircleDot } from "lucide-react";
import {
  describeMediaError,
  isMediaSupported,
  isSecureContextOk,
  mediaErrorState,
} from "@/lib/permissions";

type Props = {
  open: boolean;
  mode: "audio" | "video";
  onOpenChange: (open: boolean) => void;
};

type Clip = {
  id: string;
  url: string;
  kind: "audio" | "video";
  at: string;
  seconds: number;
  size: string;
  ext: string;
};

const BAR_COUNT = 48;

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function pickMime(kind: "audio" | "video") {
  const candidates =
    kind === "video"
      ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
      : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  if (typeof MediaRecorder === "undefined") return undefined;
  return candidates.find((c) => MediaRecorder.isTypeSupported(c));
}

export function RecordingDrawer({ open, mode, onOpenChange }: Props) {
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => 0.05),
  );
  const [clips, setClips] = useState<Clip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [camId, setCamId] = useState<string>("default");
  const [micId, setMicId] = useState<string>("default");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const startedAt = useRef(0);

  const supported = typeof window !== "undefined" && isMediaSupported();
  const secure = typeof window !== "undefined" ? isSecureContextOk() : true;
  const recorderSupported = typeof window !== "undefined" && typeof MediaRecorder !== "undefined";

  const teardown = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    void audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setLevels(Array.from({ length: BAR_COUNT }, () => 0.05));
  }, []);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    else teardown();
    setRecording(false);
  }, [teardown]);

  // Stop everything when the drawer closes or the component unmounts.
  useEffect(() => {
    if (!open) {
      stop();
      setSeconds(0);
      setError(null);
    }
  }, [open, stop]);

  useEffect(() => () => teardown(), [teardown]);

  const listDevices = useCallback(async () => {
    if (!isMediaSupported() || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCams(devices.filter((d) => d.kind === "videoinput"));
      setMics(devices.filter((d) => d.kind === "audioinput"));
    } catch {
      /* labels need permission; ignore */
    }
  }, []);

  useEffect(() => {
    if (open) void listDevices();
  }, [open, listDevices]);

  const meter = (stream: MediaStream) => {
    try {
      const Ctx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx || stream.getAudioTracks().length === 0) return;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i++)
          peak = Math.max(peak, Math.abs((data[i] ?? 128) - 128) / 128);
        setLevels((prev) => [...prev.slice(1), Math.min(1, 0.05 + peak * 2.2)]);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      /* meter is decorative */
    }
  };

  const start = async () => {
    setError(null);
    if (!supported) return setError("This browser cannot access your camera or microphone.");
    if (!secure)
      return setError("Recording needs a secure HTTPS address. It works on the published site.");
    if (!recorderSupported)
      return setError("This browser cannot record media. Try Chrome, Edge, Firefox or Safari 15+.");

    setStarting(true);
    try {
      const constraints: MediaStreamConstraints = {
        audio: micId === "default" ? true : { deviceId: { exact: micId } },
        video:
          mode === "video"
            ? camId === "default"
              ? { width: { ideal: 1280 }, height: { ideal: 720 } }
              : { deviceId: { exact: camId } }
            : false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        // Fall back to a plain request if the chosen device is gone.
        if ((e as DOMException)?.name === "OverconstrainedError") {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: mode === "video",
          });
          setCamId("default");
          setMicId("default");
        } else throw e;
      }

      streamRef.current = stream;
      void listDevices();

      if (mode === "video" && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      meter(stream);

      const mimeType = pickMime(mode);
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onerror = () => {
        setError("Recording stopped unexpectedly. Your clip up to this point was kept.");
        stop();
      };
      rec.onstop = () => {
        const type = mimeType ?? (mode === "video" ? "video/webm" : "audio/webm");
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        const elapsed = Math.round((performance.now() - startedAt.current) / 1000);
        if (blob.size > 0) {
          const ext = type.includes("mp4") ? "mp4" : type.includes("ogg") ? "ogg" : "webm";
          setClips((c) => [
            {
              id: `SRK-${Date.now().toString().slice(-6)}`,
              url: URL.createObjectURL(blob),
              kind: mode,
              at: new Date().toLocaleTimeString("en-GB"),
              seconds: elapsed,
              size: formatSize(blob.size),
              ext,
            },
            ...c,
          ]);
          toast.success("Recording saved on this device", {
            description: "Download it or delete it — nothing is uploaded automatically.",
          });
        }
        teardown();
      };

      rec.start(1000);
      startedAt.current = performance.now();
      setSeconds(0);
      tickRef.current = window.setInterval(
        () => setSeconds(Math.round((performance.now() - startedAt.current) / 1000)),
        500,
      );
      setRecording(true);
    } catch (e) {
      teardown();
      setError(describeMediaError(e, mode === "video" ? "camera" : "microphone"));
      if (mediaErrorState(e) === "denied")
        toast.error("Permission blocked", {
          description: "Allow it from the padlock icon next to the web address, then reload.",
        });
    } finally {
      setStarting(false);
    }
  };

  const removeClip = (id: string) =>
    setClips((c) => {
      const target = c.find((x) => x.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return c.filter((x) => x.id !== id);
    });

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto border-border bg-background"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 font-display">
            {mode === "audio" ? (
              <Mic className="size-5 text-crimson" aria-hidden />
            ) : (
              <Video className="size-5 text-crimson" aria-hidden />
            )}
            {mode === "audio" ? "Audio" : "Video"} evidence recorder
          </SheetTitle>
          <SheetDescription>
            Recording is always visible to you: a red indicator, a running timer and — for video — a
            live preview. Clips stay on this device until you download or delete them.
          </SheetDescription>
        </SheetHeader>

        <div className="mx-auto w-full max-w-3xl space-y-5 px-4 pb-8">
          <p className="flex items-start gap-2 rounded-xl bg-emerald/10 px-3 py-2.5 text-xs text-emerald ring-1 ring-emerald/25">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            Recording only ever starts when you press the button below. Recording other people may
            require their consent where you live — check your local law.
          </p>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-crimson/12 px-3 py-2.5 text-xs text-crimson ring-1 ring-crimson/30"
            >
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <div className="glass rounded-2xl p-4">
            {mode === "video" && (
              <div className="relative mb-4 overflow-hidden rounded-xl bg-black ring-1 ring-border">
                <video
                  ref={videoRef}
                  className="mx-auto aspect-video max-h-[45vh] w-full bg-black object-contain"
                  muted
                  playsInline
                  autoPlay
                  aria-label="Live camera preview"
                />
                {!recording && (
                  <p className="absolute inset-0 grid place-items-center px-4 text-center text-xs text-muted-foreground">
                    Your live camera preview appears here as soon as recording starts.
                  </p>
                )}
                {recording && (
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-crimson px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                    <CircleDot className="size-3 animate-pulse-dot" aria-hidden /> Rec
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <span className="flex min-w-0 items-center gap-2 text-sm">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${recording ? "animate-pulse-dot bg-crimson" : "bg-muted-foreground"}`}
                />
                <span className="truncate" aria-live="polite">
                  {recording ? "Recording now" : starting ? "Starting…" : "Idle — nothing captured"}
                </span>
              </span>
              <span className="shrink-0 font-mono text-lg tabular-nums">
                {mm}:{ss}
              </span>
            </div>

            <div className="mt-4 flex h-20 items-end gap-[3px]" aria-hidden>
              {levels.map((b, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full bg-gradient-to-t from-crimson/40 to-crimson transition-all duration-100"
                  style={{ height: `${(recording ? b : 0.06) * 100}%` }}
                />
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-muted-foreground">
                Microphone
                <Select value={micId} onValueChange={setMicId} disabled={recording}>
                  <SelectTrigger className="mt-1.5 min-h-11 w-full">
                    <SelectValue placeholder="Default microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default microphone</SelectItem>
                    {mics
                      .filter((d) => d.deviceId && d.deviceId !== "default")
                      .map((d, i) => (
                        <SelectItem key={d.deviceId} value={d.deviceId}>
                          {d.label || `Microphone ${i + 1}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </label>
              {mode === "video" && (
                <label className="text-xs text-muted-foreground">
                  Camera
                  <Select value={camId} onValueChange={setCamId} disabled={recording}>
                    <SelectTrigger className="mt-1.5 min-h-11 w-full">
                      <SelectValue placeholder="Default camera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default camera</SelectItem>
                      {cams
                        .filter((d) => d.deviceId && d.deviceId !== "default")
                        .map((d, i) => (
                          <SelectItem key={d.deviceId} value={d.deviceId}>
                            {d.label || `Camera ${i + 1}`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </label>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {recording ? (
                <Button
                  onClick={stop}
                  className="min-h-11 bg-crimson text-primary-foreground hover:bg-crimson/90"
                >
                  <Square className="size-4" aria-hidden /> Stop &amp; save
                </Button>
              ) : (
                <Button
                  onClick={start}
                  disabled={starting}
                  className="min-h-11 bg-crimson text-primary-foreground hover:bg-crimson/90"
                >
                  {mode === "audio" ? (
                    <Mic className="size-4" aria-hidden />
                  ) : (
                    <Video className="size-4" aria-hidden />
                  )}
                  {starting ? "Starting…" : `Start ${mode} recording`}
                </Button>
              )}
              {mics.length === 0 && !recording && (
                <span className="self-center text-xs text-muted-foreground">
                  Device names appear after you allow access once.
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Clips on this device
            </h3>
            {clips.length === 0 ? (
              <p className="mt-3 rounded-xl bg-surface-2/70 px-4 py-4 text-sm text-muted-foreground ring-1 ring-border">
                No clips yet. Anything you record shows up here with a download button.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {clips.map((c) => (
                  <li key={c.id} className="rounded-xl bg-surface-2/70 p-3 ring-1 ring-border">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-sm">{c.id}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {c.at} · {c.seconds}s · {c.size}
                        </span>
                      </span>
                      <span className="flex shrink-0 gap-2">
                        <a
                          href={c.url}
                          download={`suraksha-${c.id}.${c.ext}`}
                          className="flex min-h-10 items-center gap-1.5 rounded-lg bg-secondary px-3 text-xs font-semibold transition-colors hover:bg-accent"
                        >
                          <Download className="size-4" aria-hidden /> Download
                        </a>
                        <button
                          type="button"
                          onClick={() => removeClip(c.id)}
                          aria-label={`Delete clip ${c.id}`}
                          className="grid min-h-10 min-w-10 place-items-center rounded-lg bg-secondary text-crimson transition-colors hover:bg-accent"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </span>
                    </div>
                    {c.kind === "video" ? (
                      <video src={c.url} controls className="mt-3 w-full rounded-lg" />
                    ) : (
                      <audio src={c.url} controls className="mt-3 w-full" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
