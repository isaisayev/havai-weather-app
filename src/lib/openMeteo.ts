// Open-Meteo — pulsuz, API açarı lazım deyil
// Dəqiqəlik yağış nowcast + hava keyfiyyəti + polen + UV

export interface NowcastStep {
  time: number;          // timestamp (ms)
  precip: number;        // mm / 15 dəq
}

export interface NowcastResult {
  steps: NowcastStep[];
  // "starts" — yağış X dəq sonra başlayır; "stops" — X dəq sonra dayanır; "none" — 2 saat yağış yox; "ongoing" — yağır, 2 saat ərzində dayanmır
  status: "starts" | "stops" | "none" | "ongoing";
  minutes: number;       // status üçün dəqiqə (starts/stops)
}

export async function fetchNowcast(lat: number, lon: number): Promise<NowcastResult | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&minutely_15=precipitation&forecast_minutely_15=8&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const d = await res.json();

    const times: string[] = d?.minutely_15?.time ?? [];
    const precs: number[]  = d?.minutely_15?.precipitation ?? [];
    if (!times.length) return null;

    const steps: NowcastStep[] = times.map((t, i) => ({
      time:   new Date(t).getTime(),
      precip: precs[i] ?? 0,
    }));

    const rainingNow = steps[0].precip > 0.05;
    let status: NowcastResult["status"];
    let minutes = 0;

    if (rainingNow) {
      // İlk quru addımı tap
      const stopIdx = steps.findIndex(s => s.precip <= 0.05);
      if (stopIdx === -1) {
        status = "ongoing";
      } else {
        status = "stops";
        minutes = stopIdx * 15;
      }
    } else {
      const startIdx = steps.findIndex(s => s.precip > 0.05);
      if (startIdx === -1) {
        status = "none";
      } else {
        status = "starts";
        minutes = startIdx * 15;
      }
    }

    return { steps, status, minutes };
  } catch {
    return null;
  }
}

export interface HealthData {
  aqi:        number | null;   // US AQI
  pm25:       number | null;
  uv:         number | null;
  pollen:     number | null;   // ümumi polen (grain/m³, ən yüksək növ)
  pollenType: string | null;   // ən yüksək polen növü
}

export async function fetchHealth(lat: number, lon: number): Promise<HealthData | null> {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
      `&current=us_aqi,pm2_5,uv_index,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen` +
      `&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const d = await res.json();
    const c = d?.current;
    if (!c) return null;

    const pollenMap: Record<string, number> = {
      alder:   c.alder_pollen   ?? 0,
      birch:   c.birch_pollen   ?? 0,
      grass:   c.grass_pollen   ?? 0,
      mugwort: c.mugwort_pollen ?? 0,
      olive:   c.olive_pollen   ?? 0,
      ragweed: c.ragweed_pollen ?? 0,
    };
    let pollenType: string | null = null;
    let pollenMax = 0;
    for (const [k, v] of Object.entries(pollenMap)) {
      if (typeof v === "number" && v > pollenMax) { pollenMax = v; pollenType = k; }
    }

    return {
      aqi:        c.us_aqi    ?? null,
      pm25:       c.pm2_5     ?? null,
      uv:         c.uv_index  ?? null,
      pollen:     pollenType ? pollenMax : null,
      pollenType,
    };
  } catch {
    return null;
  }
}

// US AQI → kateqoriya
export function aqiCategory(aqi: number): { key: string; color: string } {
  if (aqi <= 50)  return { key: "good",      color: "#34d399" };
  if (aqi <= 100) return { key: "moderate",  color: "#fbbf24" };
  if (aqi <= 150) return { key: "sensitive", color: "#f97316" };
  if (aqi <= 200) return { key: "unhealthy", color: "#ef4444" };
  if (aqi <= 300) return { key: "veryBad",   color: "#a855f7" };
  return { key: "hazardous", color: "#7f1d1d" };
}

// UV indeksi → kateqoriya
export function uvCategory(uv: number): { key: string; color: string } {
  if (uv < 3)   return { key: "low",       color: "#34d399" };
  if (uv < 6)   return { key: "moderate",  color: "#fbbf24" };
  if (uv < 8)   return { key: "high",      color: "#f97316" };
  if (uv < 11)  return { key: "veryHigh",  color: "#ef4444" };
  return { key: "extreme", color: "#a855f7" };
}

// Polen səviyyəsi (grain/m³) → kateqoriya
export function pollenCategory(v: number): { key: string; color: string } {
  if (v < 10)  return { key: "low",      color: "#34d399" };
  if (v < 30)  return { key: "moderate", color: "#fbbf24" };
  if (v < 80)  return { key: "high",     color: "#f97316" };
  return { key: "veryHigh", color: "#ef4444" };
}
