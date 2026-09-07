export type Pt = { x: number; y: number };

export const WORLD = { w: 1000, h: 700 };

/** Simulated street grid (major arterials + secondary lanes). */
export const ROADS: { d: string; major?: boolean }[] = [
  { d: "M 0 180 L 1000 150", major: true },
  { d: "M 0 380 L 1000 410", major: true },
  { d: "M 0 560 L 1000 590" },
  { d: "M 180 0 L 210 700", major: true },
  { d: "M 470 0 L 500 700", major: true },
  { d: "M 760 0 L 730 700" },
  { d: "M 60 0 L 80 700" },
  { d: "M 900 0 L 920 700" },
  { d: "M 0 60 L 1000 40" },
  { d: "M 0 280 L 1000 260" },
  { d: "M 0 480 L 1000 500" },
  { d: "M 0 660 L 1000 680" },
  { d: "M 210 380 Q 380 300 500 410" },
  { d: "M 500 410 Q 640 500 730 410" },
];

export type Zone = {
  id: string;
  level: "safe" | "moderate" | "high";
  label: string;
  points: string;
  note: string;
};

export const ZONES: Zone[] = [
  {
    id: "z1",
    level: "safe",
    label: "Sector 22 Safe Zone",
    points: "70,190 300,170 330,370 90,390",
    note: "Well-lit, 24×7 patrol, 41 CCTV nodes",
  },
  {
    id: "z2",
    level: "safe",
    label: "Civic Plaza",
    points: "520,430 760,420 780,580 540,600",
    note: "Crowded till 23:00, help desk on site",
  },
  {
    id: "z3",
    level: "moderate",
    label: "Transit Corridor",
    points: "330,170 520,150 540,420 330,370",
    note: "Moderate footfall after 21:00",
  },
  {
    id: "z4",
    level: "moderate",
    label: "Riverside Lane",
    points: "90,400 330,380 320,600 100,620",
    note: "Patchy lighting near underpass",
  },
  {
    id: "z5",
    level: "high",
    label: "Old Mill Underpass",
    points: "560,150 800,140 820,400 570,410",
    note: "7 incidents in 30 days · avoid after dark",
  },
  {
    id: "z6",
    level: "high",
    label: "Depot Backlot",
    points: "830,430 970,440 960,610 820,600",
    note: "No CCTV, low footfall",
  },
];

export type Service = {
  id: string;
  type: "police" | "hospital" | "support" | "safe";
  name: string;
  dist: string;
  open: string;
  phone: string;
  at: Pt;
};

export const SERVICES: Service[] = [
  {
    id: "s1",
    type: "police",
    name: "Sector 22 Police Station",
    dist: "0.8 km",
    open: "24×7",
    phone: "100",
    at: { x: 200, y: 250 },
  },
  {
    id: "s2",
    type: "police",
    name: "Traffic Police Outpost",
    dist: "2.1 km",
    open: "24×7",
    phone: "100",
    at: { x: 690, y: 520 },
  },
  {
    id: "s3",
    type: "hospital",
    name: "Sunrise Multispeciality",
    dist: "1.4 km",
    open: "Emergency 24×7",
    phone: "108",
    at: { x: 420, y: 330 },
  },
  {
    id: "s4",
    type: "hospital",
    name: "City Care Clinic",
    dist: "3.0 km",
    open: "08:00 – 22:00",
    phone: "108",
    at: { x: 880, y: 250 },
  },
  {
    id: "s5",
    type: "support",
    name: "Sakhi Women's Support Centre",
    dist: "1.1 km",
    open: "24×7 helpline",
    phone: "1091",
    at: { x: 300, y: 500 },
  },
  {
    id: "s6",
    type: "support",
    name: "Nirbhaya Counselling Cell",
    dist: "2.6 km",
    open: "09:00 – 21:00",
    phone: "1091",
    at: { x: 610, y: 200 },
  },
  {
    id: "s7",
    type: "safe",
    name: "Metro Safe Point — Plaza",
    dist: "0.5 km",
    open: "05:00 – 00:00",
    phone: "112",
    at: { x: 640, y: 470 },
  },
  {
    id: "s8",
    type: "safe",
    name: "24×7 Fuel Stop Safe Space",
    dist: "1.9 km",
    open: "24×7",
    phone: "112",
    at: { x: 130, y: 600 },
  },
];

export type RouteOption = {
  id: "fastest" | "safest";
  name: string;
  eta: string;
  distance: string;
  score: number;
  path: string;
  badges: string[];
  warning?: string;
  steps: { text: string; meta: string; risk: "safe" | "moderate" | "high" }[];
};

export const ORIGIN: Pt = { x: 165, y: 300 };
export const DESTINATION: Pt = { x: 875, y: 545 };

export const ROUTES: RouteOption[] = [
  {
    id: "fastest",
    name: "Fastest route",
    eta: "18 min",
    distance: "4.2 km",
    score: 54,
    path: "M 165 300 L 420 250 L 640 230 L 790 380 L 875 545",
    badges: ["Shortest distance", "Light traffic"],
    warning: "Passes Old Mill Underpass — high-risk after 20:00",
    steps: [
      { text: "Head east on Sector 22 Main Rd", meta: "600 m · 4 min", risk: "safe" },
      { text: "Continue through Transit Corridor", meta: "1.1 km · 5 min", risk: "moderate" },
      { text: "Cross Old Mill Underpass", meta: "900 m · 4 min", risk: "high" },
      { text: "Right onto Depot Link Rd", meta: "1.0 km · 3 min", risk: "moderate" },
      { text: "Arrive at destination", meta: "600 m · 2 min", risk: "safe" },
    ],
  },
  {
    id: "safest",
    name: "Safest route",
    eta: "24 min",
    distance: "5.1 km",
    score: 92,
    path: "M 165 300 L 230 430 L 360 520 L 560 505 L 700 500 L 875 545",
    badges: ["Well-Lit", "CCTV Covered", "Frequent Patrol Zone", "Populated"],
    steps: [
      { text: "Head south on Riverside Lane (lit path)", meta: "700 m · 5 min", risk: "safe" },
      { text: "Pass Sakhi Support Centre", meta: "900 m · 5 min", risk: "safe" },
      { text: "Continue along Civic Plaza promenade", meta: "1.6 km · 7 min", risk: "safe" },
      { text: "Cross at Metro Safe Point", meta: "1.1 km · 4 min", risk: "safe" },
      { text: "Arrive at destination", meta: "800 m · 3 min", risk: "safe" },
    ],
  },
];

export const SERVICE_LABEL: Record<Service["type"], string> = {
  police: "Police Stations",
  hospital: "Hospitals",
  support: "Women's Support Centers",
  safe: "Safe Spaces",
};
