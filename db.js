// ── SUPABASE CONFIG ───────────────────────────────────────────────
const SUPABASE_URL = "https://arevihldtqxawestpado.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZXZpaGxkdHF4YXdlc3RwYWRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjM2ODgsImV4cCI6MjA5MTMzOTY4OH0.HCN9EMQ0oNhEMZemdlQpgimq-r6CL-Reqft0-NFz7yE";
const TABLE = "meisner_data";

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates",
};

// ── CORE READ / WRITE ─────────────────────────────────────────────

// Read a value by key. Returns parsed JSON or a default.
async function dbGet(key, defaultValue = null) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?key=eq.${encodeURIComponent(key)}&select=value&limit=1`,
      { headers: HEADERS },
    );
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return defaultValue;
    return JSON.parse(rows[0].value);
  } catch (e) {
    console.warn("dbGet failed for", key, e);
    return defaultValue;
  }
}

// Write a value by key (upsert — insert or update).
async function dbSet(key, value) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?on_conflict=key`,
      {
        method: "POST",
        headers: {
          ...HEADERS,
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({ key, value: JSON.stringify(value) }),
      },
    );
    if (!res.ok) {
      const err = await res.text();
      console.warn("dbSet failed for", key, err);
    }
  } catch (e) {
    console.warn("dbSet error for", key, e);
  }
}

// ── NAMED HELPERS (mirrors your old localStorage keys) ────────────

// Log data: { persons, entries, rep }
async function getLogData() {
  return await dbGet("meisner-log-v2", { persons: [], entries: {}, rep: {} });
}
async function saveLogData(d) {
  await dbSet("meisner-log-v2", d);
}

// Saved collections (generator page)
async function getCollections() {
  return await dbGet("meisner-collections", []);
}
async function saveCollections(arr) {
  await dbSet("meisner-collections", arr);
}

// Custom activities
async function getCustomActivities() {
  return await dbGet("meisner-custom-activities", []);
}
async function saveCustomActivities(arr) {
  await dbSet("meisner-custom-activities", arr);
}
