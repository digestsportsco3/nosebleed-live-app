const fs = require("node:fs");
const path = require("node:path");
const grade = require("../lib/grade");

const SEED_PICKS_FILE = path.join(__dirname, "..", "data", "picks.json");

function picksFile() {
  if (process.env.DATA_DIR) {
    const dataFile = path.join(process.env.DATA_DIR, "picks.json");
    if (fs.existsSync(dataFile)) return dataFile;
  }
  return SEED_PICKS_FILE;
}

function getPicks() {
  const store = grade.load();
  return readPicks().map(makePick).map((pick) => {
    const savedGrade = store.grades[pick.id];
    return savedGrade ? { ...pick, ...savedGrade, status: savedGrade.status } : pick;
  });
}

function makePick(raw, index) {
  const status = normalizeStatus(raw.status || raw.result);
  return {
    id: raw.id || `pick-${index + 1}`,
    gameId: raw.gameId || "",
    league: raw.league || "",
    expert: raw.expert || raw.analyst || "Nosebleed Quant",
    title: raw.title || raw.pick || raw.selection || "",
    pick: raw.pick || raw.title || raw.selection || "",
    market: raw.market || inferMarket(raw.title || raw.pick || raw.selection),
    price: raw.price || raw.odds || "",
    confidence: Number(raw.confidence || 0),
    rationale: raw.rationale || "",
    status,
    postedAt: raw.postedAt || null,
  };
}

function readPicks() {
  try {
    const file = picksFile();
    if (!fs.existsSync(file)) return [];
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? parsed : parsed.picks || [];
  } catch (error) {
    console.warn("[picks] unable to load picks:", error.message);
    return [];
  }
}

function normalizeStatus(value) {
  const status = String(value || "").toLowerCase();
  if (["win", "won"].includes(status)) return "won";
  if (["loss", "lost"].includes(status)) return "lost";
  if (status === "push") return "push";
  return "pending";
}

function inferMarket(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes(" over ") || text.includes(" under ")) return "total";
  if (text.includes(" ml")) return "moneyline";
  if (/[+-]\d+(\.\d+)?/.test(text)) return "spread";
  return "market";
}

module.exports = { getPicks };
