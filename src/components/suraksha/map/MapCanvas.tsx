import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, Crosshair } from "lucide-react";
import {
  ROADS,
  ROUTES,
  SERVICES,
  WORLD,
  ZONES,
  ORIGIN,
  DESTINATION,
  type Service,
} from "./mapData";

const MIN_Z = 0.8;
const MAX_Z = 4;

const ZONE_STYLE = {
  safe: { fill: "var(--emerald)", op: 0.14 },
  moderate: { fill: "var(--amber)", op: 0.16 },
  high: { fill: "var(--crimson)", op: 0.2 },
} as const;

const SERVICE_COLOR: Record<Service["type"], string> = {
  police: "var(--crimson)",
  hospital: "var(--emerald)",
  support: "var(--amber)",
  safe: "var(--emerald)",
};

type Props = {
  activeRoute: "fastest" | "safest";
  visibleTypes: Service["type"][];
  geofenceRadius: number;
  userPos: { x: number; y: number };
  breached: boolean;
  onSelectService: (s: Service) => void;
};

export function MapCanvas({
  activeRoute,
  visibleTypes,
  geofenceRadius,
  userPos,
  breached,
  onSelectService,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ z: 1, x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    setView((v) => {
      const next = Math.min(MAX_Z, Math.max(MIN_Z, v.z * factor));
      const k = next / v.z;
      return { z: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const rect = el.getBoundingClientRect();
      zoomAt(Math.exp(-dy * 0.0015), e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const centerZoom = (factor: number) => {
    const rect = wrap.current?.getBoundingClientRect();
    zoomAt(factor, (rect?.width ?? 600) / 2, (rect?.height ?? 400) / 2);
  };

  const route = ROUTES.find((r) => r.id === activeRoute)!;
  const other = ROUTES.find((r) => r.id !== activeRoute)!;

  return (
    <div
      ref={wrap}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, ox: view.x, oy: view.y };
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        setView((v) => ({ ...v, x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) }));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
      className="relative h-[26rem] cursor-grab touch-none overflow-hidden rounded-3xl bg-[oklch(0.14_0.03_264)] ring-1 ring-border active:cursor-grabbing sm:h-[34rem]"
      role="application"
      aria-label="Interactive safety map of Sector 22"
    >
      <div
        className="absolute inset-0 origin-top-left"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})` }}
      >
        <svg viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} className="size-full" aria-hidden>
          <defs>
            <pattern id="blocks" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="none" />
              <path d="M40 0 L0 0 0 40" stroke="oklch(1 0 0 / 5%)" strokeWidth="1" fill="none" />
            </pattern>
            <filter id="soft">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>

          <rect width={WORLD.w} height={WORLD.h} fill="url(#blocks)" />

          {ZONES.map((z) => {
            const s = ZONE_STYLE[z.level];
            return (
              <g key={z.id} onMouseEnter={() => setHover(z.id)} onMouseLeave={() => setHover(null)}>
                <polygon
                  points={z.points}
                  fill={s.fill}
                  fillOpacity={hover === z.id ? s.op * 2 : s.op}
                  stroke={s.fill}
                  strokeOpacity="0.55"
                  strokeWidth="1.6"
                  className="transition-all duration-300"
                />
                <text
                  x={(Number(z.points.split(" ")[0]?.split(",")[0] ?? 0) || 0) + 14}
                  y={(Number(z.points.split(" ")[0]?.split(",")[1] ?? 0) || 0) + 26}
                  fill={s.fill}
                  fontSize="13"

                  fontWeight="600"
                >
                  {z.label}
                </text>
              </g>
            );
          })}

          {ROADS.map((r, i) => (
            <path
              key={i}
              d={r.d}
              stroke={r.major ? "oklch(1 0 0 / 16%)" : "oklch(1 0 0 / 8%)"}
              strokeWidth={r.major ? 6 : 3}
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* geofence */}
          <circle
            cx={ORIGIN.x}
            cy={ORIGIN.y}
            r={geofenceRadius}
            fill={breached ? "var(--crimson)" : "var(--emerald)"}
            fillOpacity="0.08"
            stroke={breached ? "var(--crimson)" : "var(--emerald)"}
            strokeWidth="2"
            strokeDasharray="8 7"
            className="transition-all duration-500"
          />

          {/* inactive route */}
          <path
            d={other.path}
            stroke="oklch(1 0 0 / 22%)"
            strokeWidth="5"
            fill="none"
            strokeDasharray="10 9"
            strokeLinecap="round"
          />
          {/* active route */}
          <path
            d={route.path}
            stroke={activeRoute === "safest" ? "var(--emerald)" : "var(--amber)"}
            strokeWidth="12"
            strokeOpacity="0.22"
            fill="none"
            filter="url(#soft)"
            strokeLinecap="round"
          />
          <path
            d={route.path}
            stroke={activeRoute === "safest" ? "var(--emerald)" : "var(--amber)"}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />

          {SERVICES.filter((s) => visibleTypes.includes(s.type)).map((s) => (
            <g
              key={s.id}
              className="cursor-pointer"
              onClick={() => onSelectService(s)}
              onMouseEnter={() => setHover(s.id)}
              onMouseLeave={() => setHover(null)}
            >
              <circle
                cx={s.at.x}
                cy={s.at.y}
                r={hover === s.id ? 15 : 11}
                fill="oklch(0.2 0.03 264)"
                stroke={SERVICE_COLOR[s.type]}
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
              <circle cx={s.at.x} cy={s.at.y} r="4" fill={SERVICE_COLOR[s.type]} />
              {hover === s.id && (
                <text
                  x={s.at.x + 20}
                  y={s.at.y + 5}
                  fill="oklch(0.97 0 0)"
                  fontSize="13"
                  fontWeight="600"
                >
                  {s.name}
                </text>
              )}
            </g>
          ))}

          <g>
            <circle cx={DESTINATION.x} cy={DESTINATION.y} r="10" fill="var(--crimson)" />
            <circle
              cx={DESTINATION.x}
              cy={DESTINATION.y}
              r="18"
              fill="none"
              stroke="var(--crimson)"
              strokeWidth="2"
              strokeOpacity="0.5"
            />
            <text
              x={DESTINATION.x + 24}
              y={DESTINATION.y + 5}
              fill="var(--crimson)"
              fontSize="13"
              fontWeight="700"
            >
              Destination
            </text>
          </g>

          <g
            style={{ transform: `translate(${userPos.x}px, ${userPos.y}px)` }}
            className="transition-transform duration-500"
          >
            <circle r="22" fill="oklch(0.72 0.16 250)" fillOpacity="0.18" />
            <circle r="9" fill="oklch(0.72 0.16 250)" stroke="white" strokeWidth="2.5" />
          </g>
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-center gap-2">
        <span className="glass rounded-full px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
          Simulated live map · Sector 22
        </span>
        {(["safe", "moderate", "high"] as const).map((lvl) => (
          <span
            key={lvl}
            className="glass rounded-full px-3 py-1.5 text-[11px] font-medium"
            style={{ color: ZONE_STYLE[lvl].fill }}
          >
            ● {lvl === "safe" ? "Safe zone" : lvl === "moderate" ? "Moderate risk" : "High risk"}
          </span>
        ))}
      </div>

      <div className="absolute bottom-3 right-3 flex flex-col gap-2">
        {[
          { icon: Plus, label: "Zoom in", act: () => centerZoom(1.3) },
          { icon: Minus, label: "Zoom out", act: () => centerZoom(1 / 1.3) },
          { icon: Crosshair, label: "Recenter map", act: () => setView({ z: 1, x: 0, y: 0 }) },
        ].map(({ icon: Icon, label, act }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            onClick={act}
            className="glass grid size-11 place-items-center rounded-xl transition-colors hover:bg-secondary"
          >
            <Icon className="size-4" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}
