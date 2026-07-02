const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR = path.join(__dirname, "..", "data");
const GRADES_FILE = path.join(DATA_DIR, "grades.json");

function emptyStore() {
  return { grades: {}, updatedAt: null };
}

function load() {
  try {
    if (!fs.existsSync(GRADES_FILE)) return emptyStore();
    const parsed = JSON.parse(fs.readFileSync(GRADES_FILE, "utf8"));
    return {
      grades: parsed && typeof parsed.grades === "object" && parsed.grades ? parsed.grades : {},
      updatedAt: parsed?.updatedAt || null,
    };
  } catch (error) {
    console.warn("[grade] unable to load grades:", error.message);
    return emptyStore();
  }
}

function save(store) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(GRADES_FILE, `${JSON.stringify(store, null, 2)}\n`);
  } catch (error) {
    console.warn("[grade] unable to persist grades:", error.message);
  }
}

function gradeFinals(picks, games) {
  const store = load();
  let changed = false;

  for (const pick of Array.isArray(picks) ? picks : []) {
    if (!pick?.gameId || store.grades[pick.id]?.status) continue;
    if (!isPending(pick.status || pick.result)) continue;

    const game = (Array.isArray(games) ? games : []).find((item) => item?.id === pick.gameId);
    if (!isFinalGame(game)) continue;

    const grade = gradePick(pick, game);
    if (!grade) continue;

    store.grades[pick.id] = {
      ...grade,
      gameId: pick.gameId,
      gradedAt: new Date().toISOString(),
    };
    changed = true;
  }

  if (changed) {
    store.updatedAt = new Date().toISOString();
    save(store);
  }

  return store;
}

function record(picks) {
  const store = load();
  const rows = (Array.isArray(picks) ? picks : []).map((pick) => {
    const grade = store.grades[pick.id] || {};
    const status = normalizeStatus(grade.status || pick.status || pick.result);
    return { ...pick, ...grade, status };
  });
  const totals = rows.reduce(
    (memo, pick) => {
      if (pick.status === "won") memo.won += 1;
      else if (pick.status === "lost") memo.lost += 1;
      else if (pick.status === "push") memo.push += 1;
      else memo.pending += 1;
      return memo;
    },
    { won: 0, lost: 0, push: 0, pending: 0 },
  );

  const decisions = totals.won + totals.lost + totals.push;
  return {
    ...totals,
    decisions,
    winPct: totals.won + totals.lost ? Math.round((totals.won / (totals.won + totals.lost)) * 1000) / 10 : null,
    updatedAt: store.updatedAt,
  };
}

function gradePick(pick, game) {
  const title = String(pick.title || pick.pick || pick.selection || "").trim();
  if (!title) return null;

  const away = game.awayTeam || game.away?.name;
  const home = game.homeTeam || game.home?.name;
  const awayScore = teamScore(game, away);
  const homeScore = teamScore(game, home);
  if (!away || !home || !Number.isFinite(awayScore) || !Number.isFinite(homeScore)) return null;

  const totalMatch = title.match(/\b(over|under)\s+(\d+(?:\.\d+)?)/i);
  if (totalMatch) {
    const side = totalMatch[1].toLowerCase();
    const line = Number(totalMatch[2]);
    const total = awayScore + homeScore;
    if (total === line) return { status: "push", market: "total", line, final: total };
    const won = side === "over" ? total > line : total < line;
    return { status: won ? "won" : "lost", market: "total", line, final: total };
  }

  const moneylineMatch = title.match(/^(.+?)\s+ML\b/i);
  if (moneylineMatch) {
    const pickedTeam = resolveTeam(moneylineMatch[1], game);
    if (!pickedTeam) return null;
    const pickedScore = pickedTeam === "away" ? awayScore : homeScore;
    const opponentScore = pickedTeam === "away" ? homeScore : awayScore;
    if (pickedScore === opponentScore) return { status: "push", market: "moneyline", final: `${awayScore}-${homeScore}` };
    return {
      status: pickedScore > opponentScore ? "won" : "lost",
      market: "moneyline",
      final: `${awayScore}-${homeScore}`,
    };
  }

  const spreadMatch = title.match(/^(.+?)\s+([+-]\d+(?:\.\d+)?)\b/);
  if (spreadMatch) {
    const pickedTeam = resolveTeam(spreadMatch[1], game);
    if (!pickedTeam) return null;
    const line = Number(spreadMatch[2]);
    const pickedScore = pickedTeam === "away" ? awayScore : homeScore;
    const opponentScore = pickedTeam === "away" ? homeScore : awayScore;
    const adjusted = pickedScore + line;
    if (adjusted === opponentScore) return { status: "push", market: "spread", line, final: `${awayScore}-${homeScore}` };
    return {
      status: adjusted > opponentScore ? "won" : "lost",
      market: "spread",
      line,
      final: `${awayScore}-${homeScore}`,
    };
  }

  return null;
}

function isFinalGame(game) {
  return Boolean(game && (game.completed || game.status === "final" || game.statusType === "final"));
}

function isPending(status) {
  return ["", "open", "pending", "queued"].includes(String(status || "").toLowerCase());
}

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();
  if (["win", "won"].includes(value)) return "won";
  if (["loss", "lost"].includes(value)) return "lost";
  if (value === "push") return "push";
  return "pending";
}

function teamScore(game, teamName) {
  const score = game.scores?.find((entry) => sameTeam(entry.name, teamName))?.score;
  if (score !== undefined && score !== null && score !== "") {
    const numeric = Number(score);
    return Number.isFinite(numeric) ? numeric : NaN;
  }

  if (sameTeam(game.away?.name, teamName)) return Number(game.away.score);
  if (sameTeam(game.home?.name, teamName)) return Number(game.home.score);
  return NaN;
}

function resolveTeam(rawTeam, game) {
  const value = String(rawTeam || "").trim();
  if (sameTeam(value, game.awayTeam || game.away?.name) || sameTeam(value, game.away?.abbr)) return "away";
  if (sameTeam(value, game.homeTeam || game.home?.name) || sameTeam(value, game.home?.abbr)) return "home";
  return null;
}

function sameTeam(a, b) {
  const left = normalizeTeam(a);
  const right = normalizeTeam(b);
  return Boolean(left && right && (left === right || left.includes(right) || right.includes(left)));
}

function normalizeTeam(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

module.exports = { gradeFinals, record, load };
