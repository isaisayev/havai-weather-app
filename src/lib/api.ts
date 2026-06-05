import { supabase } from "./supabase";
import { CONFIG } from "./config";

const BASE = CONFIG.apiBaseUrl;

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export async function fetchWeather(
  params: { city?: string; lat?: number; lon?: number },
  lang = "az"
) {
  const qs = params.city
    ? `city=${encodeURIComponent(params.city)}`
    : `lat=${params.lat}&lon=${params.lon}`;
  const res = await fetch(`${BASE}/api/weather?${qs}&lang=${lang}`);
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

export async function fetchGeocode(query: string) {
  const res = await fetch(`${BASE}/api/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSavedCities() {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/cities`, { headers });
  if (!res.ok) return [];
  return res.json();
}

export async function saveCity(city: { city_name: string; lat?: number; lon?: number; country?: string }) {
  const headers = await authHeaders();
  return fetch(`${BASE}/api/cities`, { method: "POST", headers, body: JSON.stringify(city) });
}

export async function deleteCity(city_name: string) {
  const headers = await authHeaders();
  return fetch(`${BASE}/api/cities?name=${encodeURIComponent(city_name)}`, { method: "DELETE", headers });
}

export async function fetchPremiumStatus() {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/user/premium`, { headers });
  if (!res.ok) return { isPremium: false };
  return res.json();
}

export async function fetchAIAdvice(payload: object) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/advice`, {
    method: "POST", headers, body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("AI advice failed");
  return res.json();
}

export async function fetchCityPhoto(city: string, country: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/api/city-photo?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&v=3`);
    if (!res.ok) return null;
    const d = await res.json();
    return d.url ?? null;
  } catch {
    return null;
  }
}

export async function createCheckout(billing: "monthly" | "yearly", returnUrl?: string): Promise<string | null> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/stripe/checkout`, {
    method: "POST", headers, body: JSON.stringify({ billing, returnUrl }),
  });
  if (!res.ok) return null;
  const d = await res.json();
  return d.url ?? null;
}

export async function cancelPremium(): Promise<{ isPremium: boolean }> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/api/user/cancel-premium`, { method: "POST", headers });
  if (!res.ok) throw new Error("Cancel failed");
  return res.json();
}

export async function syncUser(name: string, email: string) {
  const headers = await authHeaders();
  return fetch(`${BASE}/api/user/sync`, {
    method: "POST", headers, body: JSON.stringify({ name, email }),
  });
}
