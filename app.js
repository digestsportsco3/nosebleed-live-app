const API_CONFIG = {
  scores: "/api/scores?sport=All&daysFrom=1",
  odds: "/api/odds?sport=All",
  boxscore: "/api/boxscore",
  polymarket: "/api/polymarket",
  picks: "/api/picks",
  picksRecord: "/api/picks/record",
  news: "/api/news",
  leagues: "/api/leagues",
  logos: "/api/logos",
  linescores: "/api/linescores",
};

let leagues = ["All", "MLB", "NBA", "NFL", "NHL", "WNBA"];
let leagueConfigs = leagues.map((key, priority) => ({
  key,
  label: key === "All" ? "Top Events" : key,
  accent: key === "All" ? "#b11226" : "#b11226",
  priority,
}));

const games = [
  {
    id: "mlb-nyy-bos",
    league: "MLB",
    status: "LIVE",
    statusType: "live",
    clock: "Bot 7",
    venue: "Fenway Park",
    headline: "Rivalry game is tight late",
    visual: "baseball",
    away: {
      abbr: "NYY",
      name: "Yankees",
      record: "52-35",
      score: 5,
      color: "#132448",
      line: [0, 1, 0, 2, 0, 2, 0],
      leaders: [
        ["Judge", "2-3, HR, 3 RBI"],
        ["Cole", "6.0 IP, 7 K"],
      ],
    },
    home: {
      abbr: "BOS",
      name: "Red Sox",
      record: "44-42",
      score: 4,
      color: "#bd3039",
      line: [1, 0, 0, 0, 3, 0],
      leaders: [
        ["Devers", "2-4, 2B, RBI"],
        ["Duran", "1-3, SB"],
      ],
    },
    probability: { away: 58, home: 42 },
    meta: [
      ["On Base", "NYY: runner on 2nd"],
      ["Count", "1-2, two outs"],
      ["Weather", "78 F, wind out to RF"],
      ["Series", "NYY leads 1-0"],
    ],
    odds: {
      spread: "NYY -1.5 (+140)",
      total: "8.5 O -115",
      moneyline: "NYY -126",
      movement: "NYY ML moved 8 cents",
    },
    boxColumns: ["AB", "R", "H", "RBI", "BB", "K"],
    box: {
      away: [
        ["A. Judge RF", 3, 1, 2, 3, 1, 0],
        ["G. Stanton DH", 4, 1, 1, 1, 0, 2],
        ["A. Volpe SS", 3, 1, 1, 0, 1, 1],
        ["J. Chisholm 3B", 4, 0, 1, 0, 0, 1],
      ],
      home: [
        ["R. Devers 3B", 4, 1, 2, 1, 0, 1],
        ["J. Duran CF", 3, 1, 1, 0, 1, 0],
        ["T. Story SS", 3, 0, 0, 0, 1, 2],
        ["C. Wong C", 3, 1, 1, 2, 0, 1],
      ],
    },
    events: [
      ["Bot 7", "BOS", "Duran steals second with two outs.", "+3% BOS"],
      ["Top 7", "NYY", "Judge walks and New York leaves two stranded.", "+2% BOS"],
      ["Top 6", "NYY", "Stanton lines an RBI single to left.", "+9% NYY"],
      ["Top 6", "NYY", "Judge clears the wall in center for a two-run homer.", "+18% NYY"],
    ],
  },
  {
    id: "wnba-nyl-lva",
    league: "WNBA",
    status: "LIVE",
    statusType: "live",
    clock: "Q4 3:18",
    venue: "Michelob Ultra Arena",
    headline: "Liberty trying to close on the road",
    visual: "court",
    away: {
      abbr: "NYL",
      name: "Liberty",
      record: "14-4",
      score: 82,
      color: "#0b223f",
      line: [22, 20, 24, 16],
      leaders: [
        ["Ionescu", "24 PTS, 7 AST"],
        ["Stewart", "18 PTS, 9 REB"],
      ],
    },
    home: {
      abbr: "LVA",
      name: "Aces",
      record: "11-7",
      score: 79,
      color: "#c6a55b",
      line: [18, 28, 17, 16],
      leaders: [
        ["Wilson", "29 PTS, 12 REB"],
        ["Plum", "16 PTS, 5 AST"],
      ],
    },
    probability: { away: 64, home: 36 },
    meta: [
      ["Possession", "Aces ball"],
      ["Fouls", "NYL 3, LVA 4"],
      ["Timeouts", "NYL 2, LVA 1"],
      ["Bonus", "Both teams"],
    ],
    odds: {
      spread: "NYL -2.5 (-108)",
      total: "164.5 U -112",
      moneyline: "NYL -154",
      movement: "Total down 2.5",
    },
    boxColumns: ["PTS", "REB", "AST", "STL", "FG"],
    box: {
      away: [
        ["S. Ionescu", 24, 4, 7, 2, "8-16"],
        ["B. Stewart", 18, 9, 3, 1, "7-14"],
        ["J. Jones", 15, 8, 2, 0, "6-10"],
        ["L. Fiebich", 9, 3, 1, 1, "3-7"],
      ],
      home: [
        ["A. Wilson", 29, 12, 2, 3, "11-19"],
        ["K. Plum", 16, 2, 5, 1, "6-15"],
        ["J. Young", 14, 4, 4, 1, "5-12"],
        ["C. Gray", 8, 3, 6, 0, "3-8"],
      ],
    },
    events: [
      ["Q4 3:18", "LVA", "Wilson finishes through contact. Free throw coming.", "+7% LVA"],
      ["Q4 3:46", "NYL", "Stewart buries a corner three after the trap.", "+9% NYL"],
      ["Q4 4:22", "NYL", "Ionescu draws a foul and hits both.", "+5% NYL"],
      ["Q4 5:01", "LVA", "Young beats the clock with a pull-up jumper.", "+4% LVA"],
    ],
  },
  {
    id: "mlb-lad-sf",
    league: "MLB",
    status: "LIVE",
    statusType: "live",
    clock: "Top 5",
    venue: "Oracle Park",
    headline: "Dodgers have traffic again",
    visual: "baseball",
    away: {
      abbr: "LAD",
      name: "Dodgers",
      record: "55-32",
      score: 3,
      color: "#005a9c",
      line: [0, 2, 0, 0, 1],
      leaders: [
        ["Ohtani", "1-2, HR, BB"],
        ["Freeman", "2-3, RBI"],
      ],
    },
    home: {
      abbr: "SF",
      name: "Giants",
      record: "46-41",
      score: 1,
      color: "#fd5a1e",
      line: [0, 0, 1, 0],
      leaders: [
        ["Lee", "2-2, 2B"],
        ["Webb", "4.2 IP, 5 K"],
      ],
    },
    probability: { away: 71, home: 29 },
    meta: [
      ["On Base", "LAD: corners"],
      ["Count", "2-1, one out"],
      ["Pitch Count", "Webb 82"],
      ["Bullpen", "SF righty warming"],
    ],
    odds: {
      spread: "LAD -1.5 (-102)",
      total: "7.5 O +104",
      moneyline: "LAD -230",
      movement: "LAD live line shortened",
    },
    boxColumns: ["AB", "R", "H", "RBI", "BB", "K"],
    box: {
      away: [
        ["S. Ohtani DH", 2, 1, 1, 1, 1, 0],
        ["F. Freeman 1B", 3, 0, 2, 1, 0, 0],
        ["M. Betts SS", 3, 1, 1, 0, 0, 1],
        ["W. Smith C", 2, 0, 0, 0, 1, 1],
      ],
      home: [
        ["J. Lee CF", 2, 1, 2, 0, 0, 0],
        ["M. Chapman 3B", 2, 0, 1, 1, 0, 1],
        ["W. Flores 1B", 2, 0, 0, 0, 0, 1],
        ["P. Bailey C", 2, 0, 0, 0, 0, 1],
      ],
    },
    events: [
      ["Top 5", "LAD", "Freeman singles hard through the right side.", "+5% LAD"],
      ["Top 5", "LAD", "Betts reaches on an infield single.", "+4% LAD"],
      ["Bot 3", "SF", "Chapman doubles Lee home to cut the lead.", "+8% SF"],
      ["Top 2", "LAD", "Ohtani drives a fastball into McCovey Cove.", "+16% LAD"],
    ],
  },
  {
    id: "nfl-dal-phi",
    league: "NFL",
    status: "8:20 PM",
    statusType: "soon",
    clock: "Tonight",
    venue: "Lincoln Financial Field",
    headline: "Prime-time NFC East total is climbing",
    visual: "field",
    away: {
      abbr: "DAL",
      name: "Cowboys",
      record: "0-0",
      score: 0,
      color: "#003594",
      line: [0, 0, 0, 0],
      leaders: [
        ["Prescott", "Projected 248 pass yds"],
        ["Lamb", "O/U 78.5 rec yds"],
      ],
    },
    home: {
      abbr: "PHI",
      name: "Eagles",
      record: "0-0",
      score: 0,
      color: "#004c54",
      line: [0, 0, 0, 0],
      leaders: [
        ["Hurts", "O/U 41.5 rush yds"],
        ["Brown", "Projected 6.1 receptions"],
      ],
    },
    probability: { away: 46, home: 54 },
    meta: [
      ["Injuries", "DAL LT questionable"],
      ["Total Bets", "68% over"],
      ["Weather", "Clear, 71 F"],
      ["Series", "PHI won last meeting"],
    ],
    odds: {
      spread: "PHI -3 (-110)",
      total: "47.5 O -112",
      moneyline: "PHI -162",
      movement: "Total up 1.5",
    },
    boxColumns: ["CMP", "ATT", "YDS", "TD", "INT"],
    box: {
      away: [
        ["D. Prescott", 0, 0, 0, 0, 0],
        ["C. Rush", 0, 0, 0, 0, 0],
      ],
      home: [
        ["J. Hurts", 0, 0, 0, 0, 0],
        ["K. Pickett", 0, 0, 0, 0, 0],
      ],
    },
    events: [
      ["Pregame", "PHI", "Market settles at Eagles -3 across tracked books.", "No move"],
      ["Pregame", "DAL", "Cowboys elevate a depth receiver for tonight.", "Roster"],
      ["Pregame", "PHI", "Weather report removes rain from the forecast.", "Total"],
    ],
  },
  {
    id: "nba-bkn-nyk",
    league: "NBA",
    status: "FINAL",
    statusType: "final",
    clock: "Final",
    venue: "Madison Square Garden",
    headline: "Knicks win late after Nets bench surge",
    visual: "court",
    away: {
      abbr: "BKN",
      name: "Nets",
      record: "32-50",
      score: 108,
      color: "#111111",
      line: [23, 31, 28, 26],
      leaders: [
        ["Thomas", "31 PTS"],
        ["Sharpe", "14 PTS, 11 REB"],
      ],
    },
    home: {
      abbr: "NYK",
      name: "Knicks",
      record: "51-31",
      score: 114,
      color: "#f58426",
      line: [29, 27, 26, 32],
      leaders: [
        ["Brunson", "34 PTS, 8 AST"],
        ["Anunoby", "19 PTS"],
      ],
    },
    probability: { away: 0, home: 100 },
    meta: [
      ["Result", "NYK cover -4.5"],
      ["Total", "Over 219.5"],
      ["Bench Points", "BKN 42, NYK 28"],
      ["Lead Changes", "14"],
    ],
    odds: {
      spread: "NYK -4.5",
      total: "219.5 Over",
      moneyline: "NYK -188",
      movement: "Closed NYK -4.5",
    },
    boxColumns: ["PTS", "REB", "AST", "STL", "FG"],
    box: {
      away: [
        ["C. Thomas", 31, 4, 3, 1, "12-24"],
        ["D. Sharpe", 14, 11, 2, 1, "6-9"],
        ["N. Claxton", 10, 8, 1, 2, "5-7"],
        ["C. Johnson", 17, 5, 2, 0, "6-13"],
      ],
      home: [
        ["J. Brunson", 34, 3, 8, 1, "11-22"],
        ["O. Anunoby", 19, 6, 2, 2, "7-12"],
        ["M. Bridges", 16, 4, 3, 1, "6-14"],
        ["J. Hart", 9, 12, 5, 0, "4-9"],
      ],
    },
    events: [
      ["Final", "NYK", "Brunson closes with six points in the final minute.", "Final"],
      ["Q4 1:04", "BKN", "Sharpe putback cuts the deficit to two.", "+12% BKN"],
      ["Q4 2:41", "NYK", "Anunoby hits from the corner.", "+9% NYK"],
      ["Q3 0:00", "BKN", "Thomas beats the horn to tie it.", "+7% BKN"],
    ],
  },
  {
    id: "nhl-nyr-bos",
    league: "NHL",
    status: "FINAL",
    statusType: "final",
    clock: "Final OT",
    venue: "TD Garden",
    headline: "Rangers take it in overtime",
    visual: "rink",
    away: {
      abbr: "NYR",
      name: "Rangers",
      record: "48-22-12",
      score: 3,
      color: "#0038a8",
      line: [1, 1, 0, 1],
      leaders: [
        ["Panarin", "1 G, 1 A"],
        ["Shesterkin", "34 saves"],
      ],
    },
    home: {
      abbr: "BOS",
      name: "Bruins",
      record: "47-20-15",
      score: 2,
      color: "#ffb81c",
      line: [0, 1, 1, 0],
      leaders: [
        ["Pastrnak", "1 G"],
        ["Swayman", "29 saves"],
      ],
    },
    probability: { away: 100, home: 0 },
    meta: [
      ["Result", "NYR moneyline"],
      ["Shots", "BOS 36, NYR 32"],
      ["Power Play", "NYR 1-3, BOS 0-2"],
      ["Hits", "BOS 31, NYR 24"],
    ],
    odds: {
      spread: "NYR +1.5",
      total: "5.5 Under",
      moneyline: "NYR +112",
      movement: "Closed BOS -126",
    },
    boxColumns: ["G", "A", "SOG", "HIT", "TOI"],
    box: {
      away: [
        ["A. Panarin", 1, 1, 4, 0, "21:08"],
        ["M. Zibanejad", 0, 1, 3, 2, "20:44"],
        ["A. Fox", 0, 1, 2, 1, "25:12"],
        ["V. Trocheck", 1, 0, 5, 3, "19:37"],
      ],
      home: [
        ["D. Pastrnak", 1, 0, 6, 1, "22:01"],
        ["B. Marchand", 0, 1, 3, 2, "20:18"],
        ["C. McAvoy", 0, 1, 2, 4, "24:45"],
        ["P. Zacha", 1, 0, 4, 1, "18:36"],
      ],
    },
    events: [
      ["OT 2:14", "NYR", "Panarin walks into the slot and wins it.", "Final"],
      ["P3 8:49", "BOS", "Pastrnak ties it on a one-timer.", "+24% BOS"],
      ["P2 14:22", "NYR", "Trocheck redirects the power-play goal.", "+13% NYR"],
    ],
  },
];

const news = [
  {
    league: "NBA",
    tag: "Analysis",
    time: "12 min",
    title: "Day'Ron Sharpe contract watch becomes a Nets swing point",
    summary: "The archive favorite turns into a live tracker with cap context, comps, and fan reaction.",
    thumb: "nba",
  },
  {
    league: "MLB",
    tag: "Trade Board",
    time: "26 min",
    title: "Yankees bullpen targets move after two late-inning scares",
    summary: "A ranking of relievers who match New York's needs, price range, and deadline urgency.",
    thumb: "mlb",
  },
  {
    league: "NFL",
    tag: "Betting",
    time: "41 min",
    title: "Eagles total climbs as weather clears for prime time",
    summary: "How the move changes player props, same-game build paths, and public exposure.",
    thumb: "nfl",
  },
  {
    league: "WNBA",
    tag: "Live",
    time: "54 min",
    title: "Liberty-Aces live notebook: late-clock offense decides it",
    summary: "Possession-by-possession notes from a tight fourth quarter in Las Vegas.",
    thumb: "wnba",
  },
  {
    league: "MLB",
    tag: "Preview",
    time: "1 hr",
    title: "Dodgers-Giants props: lefty power, pitch count, and bullpen angles",
    summary: "Three numbers that matter before the next wave of live markets opens.",
    thumb: "mlb",
  },
  {
    league: "NHL",
    tag: "Recap",
    time: "2 hr",
    title: "Rangers steal overtime after Shesterkin keeps it alive",
    summary: "The box score says close. The shot map says New York survived a third-period push.",
    thumb: "nhl",
  },
];

const picks = [
  {
    gameId: "mlb-nyy-bos",
    expert: "Ross Sutton",
    pick: "Yankees ML",
    price: "-126",
    confidence: 73,
    result: "Open",
  },
  {
    gameId: "wnba-nyl-lva",
    expert: "Nosebleed Model",
    pick: "Liberty -2.5",
    price: "-108",
    confidence: 69,
    result: "Open",
  },
  {
    gameId: "nfl-dal-phi",
    expert: "Market Desk",
    pick: "Over 47.5",
    price: "-112",
    confidence: 64,
    result: "Queued",
  },
  {
    gameId: "nba-bkn-nyk",
    expert: "Ross Sutton",
    pick: "Knicks -4.5",
    price: "-110",
    confidence: 61,
    result: "Win",
  },
  {
    gameId: "nhl-nyr-bos",
    expert: "Nosebleed Model",
    pick: "Rangers ML",
    price: "+112",
    confidence: 57,
    result: "Win",
  },
];

const state = {
  league: "All",
  selectedGameId: "mlb-nyy-bos",
  detailTab: "gamecast",
  following: new Set(JSON.parse(localStorage.getItem("nosebleed-following") || "[]")),
  externalScores: [],
  externalOdds: [],
  syncedGames: [],
  scoresMeta: null,
  externalOddsMeta: null,
  scoresLoading: false,
  scoresFetched: false,
  oddsLoading: false,
  picks: [],
  picksFetched: false,
  picksRecord: null,
  newsItems: [],
  logos: null,
  lineScores: [],
  pulse: 0,
};

const $ = (selector) => document.querySelector(selector);

async function fetchWithMeta(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload = await response.json().catch(() => ({}));
  return {
    payload,
    meta: {
      ok: response.ok,
      cache: response.headers.get("x-cache") || "MISS",
      stale: response.headers.get("x-cache") === "STALE" || Boolean(payload.meta?.stale),
      status: response.status,
    },
  };
}

function activeGames() {
  return state.syncedGames.length ? state.syncedGames : games;
}

function visibleGames() {
  const list = activeGames();
  return state.league === "All" ? list : list.filter((game) => game.league === state.league);
}

function selectedGame() {
  return activeGames().find((game) => game.id === state.selectedGameId) || activeGames()[0] || games[0];
}

function saveFollowing() {
  localStorage.setItem("nosebleed-following", JSON.stringify([...state.following]));
}

function statusClass(game) {
  return game.statusType === "live" ? "live" : game.statusType === "final" ? "final" : "soon";
}

function getPeriods(game) {
  if (game.league === "MLB") return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  if (game.league === "NHL") return ["1", "2", "3", "OT", "SO"];
  if (game.league === "SOCCER") return ["1H", "2H", "ET"];
  return ["1", "2", "3", "4", "OT", "2OT"];
}

function leagueLabel(league) {
  return leagueConfig(league)?.label || (league === "All" ? "Top Events" : league);
}

function leagueBadge(league) {
  const badges = {
    All: "NS",
    MLB: "MLB",
    NBA: "NBA",
    NFL: "NFL",
    NHL: "NHL",
    WNBA: "W",
    NCAAF: "CFB",
    NCAAB: "CBB",
    WNCAAB: "WCB",
    CFL: "CFL",
    EUROLEAGUE: "EL",
    SOCCER: "SOC",
    MMA: "MMA",
    BOXING: "BOX",
    GOLF: "G",
    TENNIS: "T",
  };
  return badges[league] || league.slice(0, 3).toUpperCase();
}

const LEAGUE_LOGOS = {
  NFL: "https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png",
  MLB: "https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png",
  NBA: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png",
  NHL: "https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png",
  WNBA: "https://a.espncdn.com/i/teamlogos/leagues/500/wnba.png",
  NCAAF: "https://a.espncdn.com/i/espn/misc_logos/500/ncaa.png",
  NCAAB: "https://a.espncdn.com/i/espn/misc_logos/500/ncaa.png",
  WNCAAB: "https://a.espncdn.com/i/espn/misc_logos/500/ncaa.png",
  MMA: "https://a.espncdn.com/i/teamlogos/leagues/500/ufc.png",
  SOCCER: "https://a.espncdn.com/i/teamlogos/leagues/500/fifa.png",
};

function leagueIconHtml(league) {
  const logo = LEAGUE_LOGOS[league];
  if (!logo) return leagueBadge(league);
  return `${leagueBadge(league)}<img class="mark-img" src="${logo}" alt="" loading="lazy" onerror="this.remove()">`;
}

function leagueConfig(league) {
  return leagueConfigs.find((item) => item.key === league) || null;
}

function leagueAccent(league) {
  return leagueConfig(league)?.accent || "#b11226";
}

function renderLeagueTabs() {
  $("#leagueTabs").innerHTML = leagues
    .map(
      (league) => `
        <button class="league-tab ${state.league === league ? "is-active" : ""}" type="button" data-league="${league}">
          <span class="league-tab-icon">${leagueIconHtml(league)}</span>
          <span>${leagueLabel(league)}</span>
        </button>
      `,
    )
    .join("");

  $("#leagueList").innerHTML = leagues
    .map((league) => {
      const list = activeGames();
      const count = league === "All" ? list.length : list.filter((game) => game.league === league).length;
      return `
        <button class="${state.league === league ? "is-active" : ""}" type="button" data-league="${league}">
          <span><span class="league-list-icon">${leagueIconHtml(league)}</span>${leagueLabel(league)}</span>
          <small>${count}</small>
        </button>
      `;
    })
    .join("");
}

function renderScoreStrip() {
  const list = visibleGames();
  if (state.scoresLoading && !state.syncedGames.length) {
    $("#scoreStrip").innerHTML = `
      <section class="score-section">
        <div class="score-section-head">
          <h2>Loading Scores</h2>
        </div>
        <div class="score-list">
          ${Array.from({ length: 4 }, () => `<div class="score-row skeleton"></div>`).join("")}
        </div>
      </section>
    `;
    return;
  }

  if (!list.some((game) => game.id === state.selectedGameId)) {
    state.selectedGameId = list[0]?.id || games[0].id;
  }

  if (!list.length) {
    $("#scoreStrip").innerHTML = `<p class="empty-state">Nothing on the board for this league right now.</p>`;
    return;
  }

  const sections =
    state.league === "All"
      ? (() => {
          // The provider feed includes the full future schedule (games months out);
          // the home view should read like today's slate.
          const nearWindowMs = 48 * 60 * 60 * 1000;
          const nearList = list.filter(
            (game) =>
              game.statusType !== "soon" ||
              new Date(game.commenceTime || 0).getTime() - Date.now() <= nearWindowMs,
          );
          const homeList = nearList.length ? nearList : list;
          const hero = homeList.find((game) => game.statusType === "live") || homeList[0] || null;
          const remaining = hero ? homeList.filter((game) => game.id !== hero.id) : homeList;
          const followedTop = remaining.filter((game) => state.following.has(game.id)).slice(0, 3);
          const topGames = followedTop.length ? followedTop : remaining.slice(0, 4);
          const topGameIds = new Set(topGames.map((game) => game.id));
          return [
            { hero },
            {
              title: followedTop.length ? "Favorites" : "Top Events",
              games: topGames,
            },
            ...leagues
              .filter((league) => league !== "All")
              .map((league) => ({
                title: league,
                league,
                games: homeList.filter((game) => game.league === league && !topGameIds.has(game.id)).slice(0, 6),
              })),
          ];
        })()
      : [{ title: state.league, league: state.league, games: list }];

  const demoBadge =
    state.scoresFetched && !state.syncedGames.length
      ? `<div class="pill-delayed">DEMO DATA — LIVE FEED UNAVAILABLE</div>`
      : "";
  const delayedBadge = state.scoresMeta?.stale ? `<div class="pill-delayed">DELAYED</div>` : "";
  $("#scoreStrip").innerHTML =
    demoBadge +
    delayedBadge +
    sections
      .filter((section) => section.hero || section.games?.length)
      .map((section) => (section.hero ? renderHeroGame(section.hero) : renderScoreSection(section)))
      .join("");
}

function renderHeroGame(game) {
  const isLive = game.statusType === "live";
  const isFinal = game.statusType === "final";
  const statusChip = isLive
    ? `<span class="score-status live"><span class="pulse-live" aria-hidden="true"></span>${game.clock}</span>`
    : isFinal
      ? `<span class="score-status final">Final</span>`
      : `<span class="score-status soon">${game.clock}</span>`;
  const heroRow = (team) => `
    <div class="hero-row">
      <span class="team-mark hero-mark" style="--team-color:${team.color}">${team.abbr}${teamMarkImg(team)}</span>
      <span class="hero-name">${escapeHtml(team.name)}<small>${escapeHtml(team.record || "")}</small></span>
      <span class="hero-score">${team.score}</span>
    </div>
  `;
  return `
    <section class="score-section hero-card">
      <button class="hero-button" type="button" data-game-id="${game.id}">
        <div class="hero-head">
          <span class="hero-kicker">${isLive ? "Live Now" : isFinal ? "Just Finished" : "Up Next"} — ${escapeHtml(game.league)}</span>
          ${statusChip}
        </div>
        ${heroRow(game.away)}
        ${heroRow(game.home)}
        <div class="hero-foot">
          <span>${escapeHtml(game.venue || "")}</span>
          <span class="hero-cta">Gamecast</span>
        </div>
      </button>
    </section>
  `;
}

function renderScoreSection(section) {
  return `
    <section class="score-section">
      <div class="score-section-head">
        <h2>${section.title}</h2>
        ${section.league && state.league === "All" ? `<button type="button" data-league="${section.league}">See All</button>` : ""}
      </div>
      <div class="score-list">
        ${section.games.map((game) => renderScoreGame(game)).join("")}
      </div>
    </section>
  `;
}

function renderScoreGame(game) {
  const awayScore = Number(game.away.score);
  const homeScore = Number(game.home.score);
  const hasNumericScore = Number.isFinite(awayScore) && Number.isFinite(homeScore);
  const isFinal = game.statusType === "final";
  const isLive = game.statusType === "live";
  const awayWinner = isFinal && hasNumericScore && awayScore > homeScore;
  const homeWinner = isFinal && hasNumericScore && homeScore > awayScore;
  const awayLoser = isFinal && hasNumericScore && awayScore < homeScore;
  const homeLoser = isFinal && hasNumericScore && homeScore < awayScore;
  const livePulse = isLive ? `<span class="pulse-live" aria-hidden="true"></span>` : "";

  return `
    <button class="score-card ${statusClass(game)} ${game.id === state.selectedGameId ? "is-selected" : ""}" type="button" data-game-id="${game.id}">
      <div class="score-teams">
        ${scoreRow(game.away, awayWinner, awayLoser, isFinal, isLive)}
        ${scoreRow(game.home, homeWinner, homeLoser, isFinal, isLive)}
      </div>
      <div class="score-game-meta">
        <span class="score-status ${statusClass(game)}">${livePulse}${game.statusType === "final" ? "Final" : game.clock}</span>
        <span class="score-action">${game.statusType === "soon" ? game.clock || formatStartTime(game.commenceTime) : "Gamecast"}</span>
      </div>
    </button>
  `;
}

function teamMarkImg(team) {
  if (!team.logo) return "";
  return `<img class="mark-img" src="${escapeAttribute(team.logo)}" alt="" loading="lazy" onerror="this.remove()">`;
}

function scoreRow(team, winner = false, loser = false, isFinal = false, isLive = false) {
  return `
    <div class="score-row ${isFinal ? "final" : ""} ${isLive ? "live" : ""}">
      <span class="team-mark" style="--team-color:${team.color}">${team.abbr}${teamMarkImg(team)}</span>
      <span class="team-label ${winner ? "winner" : ""} ${loser ? "loser" : ""}">${team.name}</span>
      <span class="score-value ${winner ? "winner" : ""} ${loser ? "loser" : ""}">${team.score}</span>
    </div>
  `;
}

function renderLiveGame() {
  const game = selectedGame();
  $("#liveKicker").textContent = `${game.league} Game Center`;
  $("#liveTitle").textContent = `${game.away.name} at ${game.home.name}`;
  $("#gameClock").textContent = game.clock;
  $("#gameVenue").textContent = game.venue;
  $("#awayProbLabel").textContent = `${game.away.abbr} ${game.probability.away}%`;
  $("#homeProbLabel").textContent = `${game.home.abbr} ${game.probability.home}%`;
  $("#awayProbBar").style.width = `${game.probability.away}%`;
  $("#awayTeam").innerHTML = teamTemplate(game.away);
  $("#homeTeam").innerHTML = teamTemplate(game.home);
  $("#gameVisual").innerHTML = `<div class="visual-${game.visual}" aria-hidden="true"></div>`;
  $("#followBtn").textContent = state.following.has(game.id) ? "Following" : "Follow";
  $("#followBtn").classList.toggle("is-following", state.following.has(game.id));

  $("#gameMeta").innerHTML = game.meta
    .map(
      ([label, value]) => `
        <div class="meta-item">
          <strong>${label}</strong>
          <span>${value}</span>
        </div>
      `,
    )
    .join("");
}

function teamTemplate(team) {
  return `
    <div>
      <div class="team-identity">
        <span class="team-logo" style="background:${team.color}">${team.abbr}${teamMarkImg(team)}</span>
        <div class="team-name">
          <strong>${team.name}</strong>
          <span>${team.record}</span>
        </div>
      </div>
      <div class="team-score">${team.score}</div>
    </div>
    <div class="leader-list">
      ${team.leaders
        .map(
          ([name, line]) => `
            <div>
              <strong>${name}</strong>
              <span>${line}</span>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderDetailTabs() {
  $("#detailTabs").innerHTML = ["gamecast", "box", "odds", "picks"]
    .map((tab) => {
      const label = tab === "box" ? "Box Score" : tab[0].toUpperCase() + tab.slice(1);
      return `<button class="detail-tab ${state.detailTab === tab ? "is-active" : ""}" type="button" data-tab="${tab}">${label}</button>`;
    })
    .join("");
}

function renderDetailPanel() {
  const game = selectedGame();
  const panel = $("#detailPanel");

  if (state.detailTab === "box") {
    if (game.isProviderSynced) {
      panel.innerHTML = renderProviderBoxScore(game);
      if (!game.providerBoxscore && game.boxscoreStatus !== "loading" && game.boxscoreStatus !== "error") {
        loadProviderBoxscore(game);
      }
      return;
    }

    panel.innerHTML = renderBoxScore(game);
    return;
  }

  if (state.detailTab === "odds") {
    panel.innerHTML = renderSelectedOdds(game);
    if (game.isProviderSynced && !game.polymarket && game.polymarketStatus !== "loading" && game.polymarketStatus !== "error") {
      loadProviderPolymarket(game);
    }
    return;
  }

  if (state.detailTab === "picks") {
    panel.innerHTML = renderSelectedPicks(game);
    return;
  }

  if (game.isProviderSynced) {
    const plays = game.providerBoxscore?.plays || [];
    if (plays.length) {
      panel.innerHTML = `
        <div class="gamecast-list">
          ${plays
            .map(
              (play) => `
                <article class="play-item">
                  <span class="play-time">${escapeHtml(play.clock || play.period || "—")}</span>
                  <div class="play-body">
                    <strong>${escapeHtml(play.period || play.type || "Play")}</strong>
                    <span>${escapeHtml(play.text)}</span>
                  </div>
                  <span class="impact-badge">${play.scoring ? `SCORE ${escapeHtml(play.score)}` : escapeHtml(play.score || "Play")}</span>
                </article>
              `,
            )
            .join("")}
        </div>
      `;
      return;
    }

    if (!game.providerBoxscore && game.boxscoreStatus !== "loading" && game.boxscoreStatus !== "error") {
      loadProviderBoxscore(game);
    }
  }

  panel.innerHTML = `
    <div class="gamecast-list">
      ${game.events
        .map(
          ([time, team, text, impact]) => `
            <article class="play-item">
              <span class="play-time">${time}</span>
              <div class="play-body">
                <strong>${team}</strong>
                <span>${text}</span>
              </div>
              <span class="impact-badge">${impact}</span>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderProviderBoxScore(game) {
  if (game.providerBoxscore?.teams?.length) {
    return `
      <div class="box-grid">
        <div class="line-score-head">
          <h3>Player Box Score</h3>
          <span class="table-note">${escapeHtml(game.providerBoxscore.status || game.status)}</span>
        </div>
        ${game.providerBoxscore.teams.map((team) => renderProviderTeamBox(team)).join("")}
      </div>
    `;
  }

  if (game.providerBoxscore && !game.providerBoxscore.teams?.length) {
    return `
      <div class="box-grid">
        ${renderProviderScoreSummary(game)}
        <p class="empty-state">Player box score isn't available for this matchup yet.</p>
      </div>
    `;
  }

  if (game.boxscoreStatus === "loading") {
    return `
      <div class="box-grid">
        ${renderProviderScoreSummary(game)}
        <p class="empty-state">Loading player box score...</p>
      </div>
    `;
  }

  if (game.boxscoreStatus === "error") {
    return `
      <div class="box-grid">
        ${renderProviderScoreSummary(game)}
        <p class="empty-state">Player box score isn't available for this matchup.</p>
      </div>
    `;
  }

  return `
    <div class="box-grid">
      ${renderProviderScoreSummary(game)}
      <p class="empty-state">Preparing player box score...</p>
    </div>
  `;
}

function renderProviderTeamBox(team) {
  return `
    <section class="provider-team-box">
      <div class="line-score-head">
        <h3>${escapeHtml(team.team)}</h3>
        <span class="table-note">${escapeHtml(team.abbreviation || "ESPN")}</span>
      </div>
      ${team.groups.map((group) => renderProviderStatGroup(group)).join("")}
    </section>
  `;
}

function renderProviderStatGroup(group) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(group.name)}</th>
            ${group.labels.map((label) => `<th>${escapeHtml(label)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${group.rows
            .map(
              (row) => `
                <tr>
                  <td><strong>${escapeHtml(row.player)}</strong>${row.position ? ` <span class="table-note">${escapeHtml(row.position)}</span>` : ""}</td>
                  ${group.labels.map((_, index) => `<td>${escapeHtml(row.stats[index] ?? "-")}</td>`).join("")}
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderBoxScore(game) {
  if (game.isProviderSynced) return renderProviderScoreSummary(game);

  return `
    <div class="box-grid">
      ${renderLineScore(game)}
      ${renderPlayerTable(game.away.name, game.boxColumns, game.box.away)}
      ${renderPlayerTable(game.home.name, game.boxColumns, game.box.home)}
    </div>
  `;
}

function renderProviderScoreSummary(game) {
  return `
    <div class="box-grid">
      ${renderLineScore(game)}
    </div>
  `;
}

function renderLineScore(game) {
  const periods = getPeriods(game);
  const maxPeriods = periods.slice(0, Math.max(game.away.line.length, game.home.line.length, 4));
  return `
    <div>
      <div class="line-score-head">
        <h3>Line Score</h3>
        <span class="table-note">${game.venue}</span>
      </div>
      <div class="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>Team</th>
              ${maxPeriods.map((period) => `<th>${period}</th>`).join("")}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineScoreRow(game.away, maxPeriods.length)}
            ${lineScoreRow(game.home, maxPeriods.length)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function lineScoreRow(team, length) {
  const cells = Array.from({ length }, (_, index) => team.line[index] ?? "-");
  return `
    <tr>
      <td><strong>${team.abbr}</strong></td>
      ${cells.map((value) => `<td>${value}</td>`).join("")}
      <td><strong>${team.score}</strong></td>
    </tr>
  `;
}

function renderPlayerTable(title, columns, rows) {
  return `
    <div>
      <div class="line-score-head">
        <h3>${title}</h3>
        <span class="table-note">Player Stats</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              ${columns.map((column) => `<th>${column}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    ${row.map((cell, index) => `<td>${index === 0 ? `<strong>${cell}</strong>` : cell}</td>`).join("")}
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSelectedOdds(game) {
  const bookNote = game.odds.bookmaker ? `via ${game.odds.bookmaker}` : "Best available";
  const markets = [
    ["Sportsbook Spread", game.odds.spread, bookNote],
    ["Sportsbook Total", game.odds.total, game.odds.movement],
    ["Sportsbook ML", game.odds.moneyline, "American price"],
  ];
  return `
    <div class="markets-grid">
      ${markets
        .map(
          ([label, value, note]) => `
            <article class="market-card">
              <span>${label}</span>
              <strong>${value}</strong>
              <small>${note}</small>
            </article>
          `,
        )
        .join("")}
      ${renderPolymarketCard(game)}
    </div>
    ${renderBookComparison(game)}
  `;
}

const BOOK_BRANDS = {
  draftkings: { mark: "DK", color: "#0f7a44" },
  fanduel: { mark: "FD", color: "#1381e0" },
  betmgm: { mark: "MGM", color: "#8d783f" },
  williamhill_us: { mark: "CZR", color: "#0b4536" },
  caesars: { mark: "CZR", color: "#0b4536" },
  espnbet: { mark: "EB", color: "#11100d" },
  betrivers: { mark: "BR", color: "#1a4e8a" },
  fanatics: { mark: "FAN", color: "#1f1f1f" },
  bovada: { mark: "BOV", color: "#b3282d" },
  mybookieag: { mark: "MB", color: "#0a2e63" },
  betonlineag: { mark: "BOL", color: "#22354a" },
  betus: { mark: "BUS", color: "#5f2a83" },
  lowvig: { mark: "LV", color: "#5d5850" },
};

// Swap these for affiliate/sponsor URLs when deals are in place.
const BOOK_LINKS = {
  draftkings: "https://sportsbook.draftkings.com",
  fanduel: "https://sportsbook.fanduel.com",
  betmgm: "https://sports.betmgm.com",
  williamhill_us: "https://sportsbook.caesars.com",
  caesars: "https://sportsbook.caesars.com",
  espnbet: "https://espnbet.com",
  betrivers: "https://betrivers.com",
  fanatics: "https://sportsbook.fanatics.com",
  bovada: "https://www.bovada.lv",
  mybookieag: "https://www.mybookie.ag",
  betonlineag: "https://www.betonline.ag",
  betus: "https://www.betus.com.pa",
  lowvig: "https://www.lowvig.ag",
};

function bookChip(book) {
  const brand = BOOK_BRANDS[book.key] || { mark: book.title.slice(0, 3).toUpperCase(), color: "#11100d" };
  const chip = `<span class="book-chip" style="--book-color:${brand.color}">${escapeHtml(brand.mark)}</span>`;
  const link = BOOK_LINKS[book.key];
  const name = link
    ? `<a class="book-link" href="${escapeAttribute(link)}" target="_blank" rel="noopener noreferrer sponsored"><strong>${escapeHtml(book.title)}</strong></a>`
    : `<strong>${escapeHtml(book.title)}</strong>`;
  return chip + name;
}

function renderBookComparison(game) {
  const books = game.odds.books || [];
  if (!books.length) return "";
  return `
    <div class="book-compare">
      <div class="line-score-head">
        <h3>Compare Books</h3>
        <span class="table-note">Away spread | Over | ML away/home</span>
      </div>
      <div class="table-wrap compact-table">
        <table>
          <thead>
            <tr><th>Book</th><th>Spread</th><th>Total</th><th>ML</th></tr>
          </thead>
          <tbody>
            ${books
              .map(
                (book) => `
                  <tr>
                    <td class="book-cell">${bookChip(book)}</td>
                    <td>${escapeHtml(book.spread)}</td>
                    <td>${escapeHtml(book.total)}</td>
                    <td>${escapeHtml(book.moneyline)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function lineMoveHtml(event, marketType) {
  const market = event.markets?.find((item) => item.market === marketType);
  const move = market ? event.movement?.[market.id] : null;
  if (!move || move.dir === "flat") return "";
  return `<span class="line-move ${move.dir}" title="Line movement">${move.dir === "up" ? "▲" : "▼"}</span>`;
}

function renderPolymarketCard(game) {
  if (game.polymarket?.outcomes?.length) {
    const outcomes = game.polymarket.outcomes
      .map((outcome) => `${escapeHtml(teamAbbr(outcome.name))} ${outcome.percent ?? "-"}%`)
      .join(" | ");
    const status = game.polymarket.closed ? "Closed" : game.polymarket.acceptingOrders ? "Trading" : "Open";
    return `
      <article class="market-card prediction-card">
        <span>Polymarket ML</span>
        <strong>${outcomes}</strong>
        <small>${status} | Vol ${formatCompactNumber(game.polymarket.volume)} | <a href="${escapeHtml(game.polymarket.url)}" target="_blank" rel="noreferrer">Market</a></small>
      </article>
    `;
  }

  if (game.polymarketStatus === "loading") {
    return `
      <article class="market-card prediction-card">
        <span>Polymarket ML</span>
        <strong>Loading</strong>
        <small>Searching matching prediction market</small>
      </article>
    `;
  }

  if (game.polymarketStatus === "error") {
    return `
      <article class="market-card prediction-card">
        <span>Polymarket ML</span>
        <strong>No Match</strong>
        <small>No matching market found for this game</small>
      </article>
    `;
  }

  return `
    <article class="market-card prediction-card">
      <span>Polymarket ML</span>
      <strong>Queued</strong>
      <small>Open this tab to fetch prediction-market pricing</small>
    </article>
  `;
}

function activePicks() {
  if (state.picks.length) return state.picks;
  return state.picksFetched ? [] : picks;
}

function renderSelectedPicks(game) {
  const sourcePicks = activePicks();
  const matching = sourcePicks.filter((pick) => pick.gameId === game.id);
  if (!matching.length) return `<p class="empty-state">No tracked picks for this matchup yet.</p>`;

  return `
    <div class="selected-picks-grid">
      ${matching
        .map(
          (pick) => `
            <article class="selected-pick">
              <span>${pick.expert}</span>
              <strong>${pick.pick || pick.title}</strong>
              <small>${pick.price} | ${pick.confidence}% confidence | ${normalizePickStatus(pick.status || pick.result)}</small>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function formatRelativeTime(published) {
  const time = new Date(published || 0).getTime();
  if (!Number.isFinite(time) || !time) return "now";
  const minutes = Math.max(1, Math.round((Date.now() - time) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr`;
  return `${Math.round(hours / 24)} d`;
}

function activeNews() {
  if (!state.newsItems.length) return news;
  return state.newsItems.map((item) => ({
    league: item.league,
    tag: item.type || "News",
    time: formatRelativeTime(item.published),
    title: item.headline,
    summary: item.description,
    link: item.link,
    image: item.image,
  }));
}

function renderNews() {
  const list = activeNews();
  const filtered = state.league === "All" ? list : list.filter((item) => item.league === state.league);
  $("#newsFilterBtn").textContent = state.league === "All" ? "All Sports" : state.league;

  if (!filtered.length) {
    $("#newsGrid").innerHTML = `<p class="empty-state">The desk hasn't filed anything for this league yet.</p>`;
    return;
  }

  $("#newsGrid").innerHTML = `
    <div class="headline-list">
      ${filtered
        .slice(0, 12)
        .map(
          (item) => `
            <article class="headline-row" ${item.link ? `data-news-link="${escapeAttribute(item.link)}" style="cursor:pointer"` : ""}>
              ${
                item.image
                  ? `<img class="headline-thumb" src="${escapeAttribute(item.image)}" alt="" loading="lazy" onerror="this.remove()">`
                  : `<span class="headline-mark" aria-hidden="true"></span>`
              }
              <div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.league)} | ${escapeHtml(item.tag)} | ${escapeHtml(item.time)}</p>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

async function loadNews() {
  try {
    const response = await fetch(API_CONFIG.news, { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (items.length) state.newsItems = items;
  } catch {
    /* keep hardcoded fallback headlines */
  }
}

function visibleExternalOdds() {
  const odds = state.league === "All" ? state.externalOdds : state.externalOdds.filter((event) => event.league === state.league);
  return odds.slice(0, 5);
}

function renderOddsBoard() {
  const liveOdds = visibleExternalOdds();
  if (liveOdds.length) {
    $("#oddsBoard").innerHTML = liveOdds
      .map(
        (event) => `
          <article class="odds-card">
            <div class="odd-row">
              <span class="market-chip">${event.league}</span>
              <span class="movement up">Live</span>
            </div>
            <div class="odd-row">
              <strong>${event.homeTeam ? `${event.awayTeam} at ${event.homeTeam}` : escapeHtml(event.title || "Futures")}</strong>
              <span>${formatStartTime(event.commenceTime)}</span>
            </div>
            <div class="odd-row">
              <span>${event.display.spread}${lineMoveHtml(event, "spread")}</span>
              <span>${event.display.total}${lineMoveHtml(event, "total")}</span>
            </div>
            <div class="odd-row">
              <span>${event.display.moneyline}${lineMoveHtml(event, "moneyline")}</span>
              <span>${event.bookmakerCount} books</span>
            </div>
          </article>
        `,
      )
      .join("");
    return;
  }

  $("#oddsBoard").innerHTML = games
    .slice(0, 5)
    .map(
      (game, index) => `
        <article class="odds-card">
          <div class="odd-row">
            <span class="market-chip">${game.league}</span>
            <span class="movement ${index % 2 ? "down" : "up"}">${index % 2 ? "Watch" : "Move"}</span>
          </div>
          <div class="odd-row">
            <strong>${game.away.abbr} at ${game.home.abbr}</strong>
            <span>${game.clock}</span>
          </div>
          <div class="odd-row">
            <span>${game.odds.spread}</span>
            <span>${game.odds.total}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function formatStartTime(value) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function renderPicks() {
  const sourcePicks = activePicks();
  const wins = sourcePicks.filter((pick) => ["Win", "won"].includes(pick.result || pick.status)).length;
  const losses = sourcePicks.filter((pick) => ["Loss", "lost"].includes(pick.result || pick.status)).length;
  $("#picksRecord").textContent = `${wins}-${losses}`;
  const record = state.picksRecord;
  const recordBar = record
    ? `
      <div class="pick-record">
        <strong>${record.won}-${record.lost}-${record.push}</strong>
        <span>${record.winPct === null ? "No graded decisions" : `${record.winPct}% win rate`} | ${record.pending} pending</span>
      </div>
    `
    : "";

  if (!sourcePicks.length) {
    $("#picksList").innerHTML = recordBar + `<p class="empty-state">The picks desk hasn't posted today's card yet.</p>`;
    return;
  }

  $("#picksList").innerHTML =
    recordBar +
    sourcePicks
    .map(
      (pick) => {
        const game = pick.gameId ? activeGames().find((item) => item.id === pick.gameId) || null : null;
        const status = normalizePickStatus(pick.status || pick.result);
        return `
          <article class="pick-card pick-${status}">
            <div class="pick-meta">
              <span>${pick.expert}</span>
              <span>${status}</span>
            </div>
            <strong>${pick.pick || pick.title} <span>${pick.price}</span></strong>
            <div class="pick-meta">
              <span>${game ? `${game.away.abbr} ${matchupWord(game.league)} ${game.home.abbr}` : pick.league || "General"}</span>
              <span>${pick.confidence}%</span>
            </div>
            <div class="confidence" aria-label="${pick.confidence}% confidence">
              <span style="width:${pick.confidence}%"></span>
            </div>
          </article>
        `;
      },
    )
    .join("");
}

function normalizePickStatus(value) {
  const status = String(value || "").toLowerCase();
  if (["win", "won"].includes(status)) return "won";
  if (["loss", "lost"].includes(status)) return "lost";
  if (status === "push") return "push";
  return "pending";
}

function renderWatchList() {
  const followed = activeGames().filter((game) => state.following.has(game.id));
  $("#watchCount").textContent = followed.length;
  $("#watchList").innerHTML = followed.length
    ? followed
        .map(
          (game) => `
            <button class="watch-item" type="button" data-game-id="${game.id}">
              <strong>${game.away.abbr} at ${game.home.abbr}</strong>
              <small>${game.clock}</small>
            </button>
          `,
        )
        .join("")
    : `<p class="empty-state">Follow a matchup to keep it here.</p>`;
}

function renderAll() {
  renderLeagueTabs();
  renderScoreStrip();
  renderLiveGame();
  renderDetailTabs();
  renderDetailPanel();
  renderNews();
  renderOddsBoard();
  renderPicks();
  renderWatchList();
}

function setLeague(league) {
  state.league = league;
  document.documentElement.style.setProperty("--league-accent", leagueAccent(league));
  const list = visibleGames();
  if (!list.find((game) => game.id === state.selectedGameId)) {
    state.selectedGameId = list[0]?.id || games[0].id;
  }
  renderAll();
}

function selectGame(gameId) {
  state.selectedGameId = gameId;
  renderAll();
  $("#livePanel").scrollIntoView({ block: "start", behavior: "smooth" });
}

function toggleFollow() {
  const game = selectedGame();
  if (state.following.has(game.id)) {
    state.following.delete(game.id);
    showToast(`${game.away.abbr} at ${game.home.abbr} removed from watchlist`);
  } else {
    state.following.add(game.id);
    showToast(`${game.away.abbr} at ${game.home.abbr} added to watchlist`);
  }
  saveFollowing();
  renderLiveGame();
  renderWatchList();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function simulateLiveTick(manual = false) {
  if (state.syncedGames.length) return;

  const liveGames = games.filter((game) => game.statusType === "live");
  const game = liveGames[state.pulse % liveGames.length];
  state.pulse += 1;

  if (!game) return;

  const scoringTeam = state.pulse % 2 ? game.away : game.home;
  const bump = game.league === "WNBA" ? 2 : 1;
  scoringTeam.score += bump;
  const lastLineIndex = Math.max(0, scoringTeam.line.length - 1);
  scoringTeam.line[lastLineIndex] = (scoringTeam.line[lastLineIndex] || 0) + bump;
  game.probability.away = Math.max(5, Math.min(95, game.probability.away + (scoringTeam === game.away ? 3 : -3)));
  game.probability.home = 100 - game.probability.away;
  game.events.unshift([
    game.clock,
    scoringTeam.abbr,
    liveUpdateText(game, scoringTeam, bump),
    scoringTeam === game.away ? `+3% ${game.away.abbr}` : `+3% ${game.home.abbr}`,
  ]);
  game.events = game.events.slice(0, 6);

  renderAll();
  if (manual) showToast("Live feed refreshed");
}

function liveUpdateText(game, team, bump) {
  if (game.league === "MLB") return `${team.name} add ${bump} on a sharp ball in play.`;
  if (game.league === "WNBA") return `${team.name} get ${bump} after a half-court set.`;
  return `${team.name} update the live tracker.`;
}

function rebuildSyncedGames() {
  state.syncedGames = state.externalScores.map((scoreGame) => scoreGameToUiGame(scoreGame)).sort(compareSyncedGames);

  const list = visibleGames();
  if (state.syncedGames.length && !list.some((game) => game.id === state.selectedGameId)) {
    state.selectedGameId = list[0]?.id || state.syncedGames[0].id;
  }
}

function compareSyncedGames(a, b) {
  const rank = { live: 0, soon: 1, final: 2 };
  const rankDiff = rank[a.statusType] - rank[b.statusType];
  if (rankDiff) return rankDiff;

  const aTime = new Date(a.commenceTime || 0).getTime();
  const bTime = new Date(b.commenceTime || 0).getTime();
  if (a.statusType === "final") return bTime - aTime;
  return aTime - bTime;
}

function hasGameStarted(scoreGame) {
  const startMs = new Date(scoreGame.commenceTime || 0).getTime();
  return Number.isFinite(startMs) && startMs > 0 && startMs <= Date.now();
}

function formatStartLabel(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "TBD";
  if (date.toDateString() === new Date().toDateString()) return formatStartTime(value);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function matchupWord(league) {
  return ["TENNIS", "MMA", "BOXING"].includes(league) ? "vs" : "at";
}

function scoreGameToUiGame(scoreGame) {
  const matchingOdds = findOddsForScore(scoreGame);
  const lineScore = findLineScore(scoreGame);
  let awayScore = getTeamScore(scoreGame, scoreGame.awayTeam);
  let homeScore = getTeamScore(scoreGame, scoreGame.homeTeam);
  // "Has a score" is not enough: providers send placeholder 0-0 before kickoff,
  // and can lag on live games — the start time decides live vs upcoming.
  const started = hasGameStarted(scoreGame);
  const statusType = scoreGame.completed ? "final" : started ? "live" : "soon";

  // ESPN updates live scores faster than the odds feed - prefer it in-game.
  if (lineScore && lineScore.state === "in" && !scoreGame.completed) {
    if (lineScore.awayScore !== null && lineScore.awayScore !== "") awayScore = lineScore.awayScore;
    if (lineScore.homeScore !== null && lineScore.homeScore !== "") homeScore = lineScore.homeScore;
  }
  const hasScore = awayScore !== null || homeScore !== null;

  const startTime = formatStartLabel(scoreGame.commenceTime);
  const lastUpdateLabel = scoreGame.lastUpdate ? formatAbsoluteTime(scoreGame.lastUpdate) : "Awaiting update";
  const liveDetail = started && !scoreGame.completed && lineScore?.state === "in" && lineScore.detail ? lineScore.detail : "";
  const status = scoreGame.completed ? "FINAL" : started ? "LIVE" : startTime;
  const clock = scoreGame.completed ? "Final" : started ? liveDetail || "Live" : startTime;
  const total = Number(awayScore || 0) + Number(homeScore || 0);

  return {
    id: scoreGame.id,
    league: scoreGame.league,
    commenceTime: scoreGame.commenceTime,
    status,
    statusType,
    clock,
    venue: lineScore?.venue || (matchingOdds?.bookmaker ? `${matchingOdds.bookmaker} line` : ""),
    headline: `${scoreGame.awayTeam} ${matchupWord(scoreGame.league)} ${scoreGame.homeTeam}`,
    visual: visualForLeague(scoreGame.league),
    isProviderSynced: true,
    lastUpdateLabel,
    away: {
      abbr: teamLogoEntry(scoreGame.league, scoreGame.awayTeam)?.a || teamAbbr(scoreGame.awayTeam),
      logo: teamLogoEntry(scoreGame.league, scoreGame.awayTeam)?.l || null,
      name: scoreGame.awayTeam,
      record: lineScore?.awayRecord || (scoreGame.completed ? "Final" : started ? "Live" : "Scheduled"),
      score: awayScore ?? "-",
      color: colorForTeam(scoreGame.awayTeam),
      line: lineScore?.awayLine || [],
      leaders: [
        ["Updated", lastUpdateLabel],
        ["Start", formatStartDateTime(scoreGame.commenceTime)],
      ],
    },
    home: {
      abbr: teamLogoEntry(scoreGame.league, scoreGame.homeTeam)?.a || teamAbbr(scoreGame.homeTeam),
      logo: teamLogoEntry(scoreGame.league, scoreGame.homeTeam)?.l || null,
      name: scoreGame.homeTeam,
      record: lineScore?.homeRecord || (scoreGame.completed ? "Final" : started ? "Live" : "Scheduled"),
      score: homeScore ?? "-",
      color: colorForTeam(scoreGame.homeTeam),
      line: lineScore?.homeLine || [],
      leaders: [
        ["Updated", lastUpdateLabel],
        ["Start", formatStartDateTime(scoreGame.commenceTime)],
      ],
    },
    probability: impliedProbabilityFromOdds(matchingOdds),
    meta: [
      ["Status", scoreGame.completed ? "Final" : started ? "Live" : "Pregame"],
      ["Last Update", lastUpdateLabel],
      ["Start", formatStartDateTime(scoreGame.commenceTime)],
      ["Books", matchingOdds ? `${matchingOdds.bookmakerCount} tracked` : "Odds pending"],
    ],
    odds: {
      spread: matchingOdds?.display.spread || "Spread N/A",
      total: matchingOdds?.display.total || (hasScore ? `Total ${total}` : "Total N/A"),
      moneyline: matchingOdds?.display.moneyline || "ML N/A",
      movement: matchingOdds?.updatedAt ? `Updated ${formatAbsoluteTime(matchingOdds.updatedAt)}` : "Line pending",
      bookmaker: matchingOdds?.bookmaker || "",
      books: matchingOdds?.books || [],
    },
    boxColumns: ["Score", "Status", "Updated"],
    box: {
      away: [[scoreGame.awayTeam, awayScore ?? "-", status, lastUpdateLabel]],
      home: [[scoreGame.homeTeam, homeScore ?? "-", status, lastUpdateLabel]],
    },
    events: providerEvents(scoreGame, status, lastUpdateLabel, matchingOdds),
  };
}

function providerEvents(scoreGame, status, lastUpdateLabel, matchingOdds) {
  const events = [
    [
      status,
      scoreGame.league,
      `${scoreGame.awayTeam} ${matchupWord(scoreGame.league)} ${scoreGame.homeTeam} — every score, straight from the desk.`,
      "Score",
    ],
  ];

  if (matchingOdds) {
    events.push([
      "Market",
      matchingOdds.bookmaker,
      `${matchingOdds.display.spread} | ${matchingOdds.display.total} | ${matchingOdds.display.moneyline}`,
      "Odds",
    ]);
  }

  events.push(["Updated", "Feed", `Last score update: ${lastUpdateLabel}.`, "Sync"]);
  return events;
}

function findOddsForScore(scoreGame) {
  return (
    state.externalOdds.find((odds) => odds.id === scoreGame.id) ||
    state.externalOdds.find(
      (odds) =>
        odds.league === scoreGame.league &&
        odds.homeTeam === scoreGame.homeTeam &&
        odds.awayTeam === scoreGame.awayTeam,
    ) ||
    null
  );
}

function getTeamScore(scoreGame, teamName) {
  const score = scoreGame.scores?.find((entry) => entry.name === teamName)?.score;
  if (score === undefined || score === null || score === "") return null;
  const numeric = Number(score);
  return Number.isFinite(numeric) ? numeric : score;
}

function visualForLeague(league) {
  if (league === "MLB") return "baseball";
  if (league === "NFL") return "field";
  if (league === "NHL") return "rink";
  return "court";
}

const teamLogoCache = new Map();

function normalizeTeamKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function teamLogoEntry(league, teamName) {
  const table = state.logos?.[league];
  if (!table) return null;

  const cacheKey = `${league}|${teamName}`;
  if (teamLogoCache.has(cacheKey)) return teamLogoCache.get(cacheKey);

  const key = normalizeTeamKey(teamName);
  let entry = table[key] || null;
  if (!entry && key.length >= 4) {
    for (const [candidate, value] of Object.entries(table)) {
      if (candidate.length >= 4 && (candidate.includes(key) || key.includes(candidate))) {
        entry = value;
        break;
      }
    }
  }

  teamLogoCache.set(cacheKey, entry);
  return entry;
}

async function loadLineScores() {
  try {
    const response = await fetch(API_CONFIG.linescores, { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const payload = await response.json();
    if (Array.isArray(payload.games) && payload.games.length) {
      state.lineScores = payload.games;
    }
  } catch {
    /* line scores are an enrichment; games render without them */
  }
}

const TEAM_KEY_ALIASES = { usa: "unitedstates", usmnt: "unitedstates", uswnt: "unitedstates" };

function canonicalTeamKey(name) {
  const key = normalizeTeamKey(name);
  return TEAM_KEY_ALIASES[key] || key;
}

function findLineScore(scoreGame) {
  const awayKey = canonicalTeamKey(scoreGame.awayTeam);
  const homeKey = canonicalTeamKey(scoreGame.homeTeam);
  const gameTime = new Date(scoreGame.commenceTime || 0).getTime();

  const exact = [];
  const fuzzy = [];
  for (const entry of state.lineScores) {
    if (entry.league !== scoreGame.league) continue;
    const entryAway = canonicalTeamKey(entry.awayTeam);
    const entryHome = canonicalTeamKey(entry.homeTeam);
    if (entryAway === awayKey && entryHome === homeKey) exact.push(entry);
    else if (teamKeysOverlap(entryAway, awayKey) && teamKeysOverlap(entryHome, homeKey)) fuzzy.push(entry);
  }

  // Doubleheaders list the same two teams twice in a day - pick the closest start.
  const byTime = (a, b) =>
    Math.abs(new Date(a.startTime || 0).getTime() - gameTime) - Math.abs(new Date(b.startTime || 0).getTime() - gameTime);
  if (exact.length) return exact.sort(byTime)[0];
  if (fuzzy.length) return fuzzy.sort(byTime)[0];
  return null;
}

function teamKeysOverlap(a, b) {
  return Boolean(a && b && a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a)));
}

async function loadLogos() {
  try {
    const response = await fetch(API_CONFIG.logos, { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const payload = await response.json();
    if (payload.leagues && Object.keys(payload.leagues).length) {
      state.logos = payload.leagues;
      teamLogoCache.clear();
      rebuildSyncedGames();
      renderAll();
    }
  } catch {
    /* letter marks remain as fallback */
  }
}

function teamAbbr(teamName) {
  const known = {
    "Arizona Diamondbacks": "ARI",
    "Atlanta Braves": "ATL",
    "Baltimore Orioles": "BAL",
    "Boston Red Sox": "BOS",
    "Chicago Cubs": "CHC",
    "Chicago White Sox": "CWS",
    "Cincinnati Reds": "CIN",
    "Cleveland Guardians": "CLE",
    "Colorado Rockies": "COL",
    "Detroit Tigers": "DET",
    "Houston Astros": "HOU",
    "Kansas City Royals": "KC",
    "Los Angeles Angels": "LAA",
    "Los Angeles Dodgers": "LAD",
    "Miami Marlins": "MIA",
    "Milwaukee Brewers": "MIL",
    "Minnesota Twins": "MIN",
    "New York Mets": "NYM",
    "New York Yankees": "NYY",
    "Oakland Athletics": "OAK",
    "Philadelphia Phillies": "PHI",
    "Pittsburgh Pirates": "PIT",
    "San Diego Padres": "SD",
    "San Francisco Giants": "SF",
    "Seattle Mariners": "SEA",
    "St. Louis Cardinals": "STL",
    "Tampa Bay Rays": "TB",
    "Texas Rangers": "TEX",
    "Toronto Blue Jays": "TOR",
    "Washington Nationals": "WSH",
  };

  if (known[teamName]) return known[teamName];
  return teamName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function colorForTeam(teamName) {
  let hash = 0;
  for (const char of teamName) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return `hsl(${hash} 66% 28%)`;
}

function impliedProbabilityFromOdds(odds) {
  if (!odds?.display.moneyline || odds.display.moneyline === "ML N/A") {
    return { away: 50, home: 50 };
  }

  const prices = odds.display.moneyline.match(/[+-]\d+/g)?.map(Number) || [];
  if (prices.length < 2) return { away: 50, home: 50 };

  const away = americanToProbability(prices[0]);
  const home = americanToProbability(prices[1]);
  const total = away + home || 1;
  const awayPct = Math.round((away / total) * 100);
  return { away: awayPct, home: 100 - awayPct };
}

function americanToProbability(price) {
  if (price < 0) return Math.abs(price) / (Math.abs(price) + 100);
  return 100 / (price + 100);
}

function formatAbsoluteTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatStartDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCompactNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "N/A";
  return new Intl.NumberFormat([], {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numeric);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadProviderPolymarket(game) {
  game.polymarketStatus = "loading";
  renderDetailPanel();

  const url = new URL(API_CONFIG.polymarket, window.location.origin);
  url.searchParams.set("league", game.league);
  url.searchParams.set("homeTeam", game.home.name);
  url.searchParams.set("awayTeam", game.away.name);
  if (game.commenceTime) url.searchParams.set("commenceTime", game.commenceTime);

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Polymarket request failed: ${response.status}`);

    const payload = await response.json();
    if (!payload.market?.outcomes?.length) throw new Error("No matching Polymarket market");

    game.polymarket = payload.market;
    game.polymarketStatus = "loaded";
  } catch {
    game.polymarketStatus = "error";
  }

  if (selectedGame().id === game.id && state.detailTab === "odds") {
    renderDetailPanel();
  }
}

async function loadProviderBoxscore(game) {
  game.boxscoreStatus = "loading";
  renderDetailPanel();

  const url = new URL(API_CONFIG.boxscore, window.location.origin);
  url.searchParams.set("league", game.league);
  url.searchParams.set("homeTeam", game.home.name);
  url.searchParams.set("awayTeam", game.away.name);
  if (game.commenceTime) url.searchParams.set("commenceTime", game.commenceTime);

  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Box score request failed: ${response.status}`);

    const payload = await response.json();
    if (!payload.boxscore?.teams?.length && !payload.boxscore?.plays?.length) {
      throw new Error("No player box score rows returned");
    }

    game.providerBoxscore = payload.boxscore;
    game.boxscoreStatus = "loaded";
  } catch {
    game.boxscoreStatus = "error";
  }

  if (selectedGame().id === game.id && ["box", "gamecast"].includes(state.detailTab)) {
    renderDetailPanel();
  }
}

async function loadExternalScores() {
  state.scoresLoading = true;
  try {
    const { payload, meta } = await fetchWithMeta(API_CONFIG.scores);
    if (!meta.ok) return false;

    state.externalScores = Array.isArray(payload.games) ? payload.games : [];
    state.scoresMeta = { ...(payload.meta || {}), stale: meta.stale };
    return state.externalScores.length > 0;
  } catch {
    state.scoresMeta = { ...(state.scoresMeta || {}), stale: true };
    return false;
  } finally {
    state.scoresLoading = false;
    state.scoresFetched = true;
  }
}

async function loadExternalOdds({ showSuccess = false, render = true } = {}) {
  state.oddsLoading = true;
  try {
    const response = await fetch(API_CONFIG.odds, { headers: { Accept: "application/json" } });
    if (!response.ok) return false;

    const payload = await response.json();
    state.externalOdds = (Array.isArray(payload.events) ? payload.events : []).map((event) => ({
      ...event,
      movement: payload.movement || {},
    }));
    state.externalOddsMeta = { ...(payload.meta || {}), movement: payload.movement || {} };
    if (render) renderOddsBoard();

    if (showSuccess && state.externalOdds.length) {
      showToast("Live odds refreshed");
    }
    return state.externalOdds.length > 0;
  } catch {
    return false;
  } finally {
    state.oddsLoading = false;
  }
}

async function loadPicksData() {
  try {
    const [picksResponse, recordResponse] = await Promise.all([
      fetch(API_CONFIG.picks, { headers: { Accept: "application/json" } }),
      fetch(API_CONFIG.picksRecord, { headers: { Accept: "application/json" } }),
    ]);
    if (picksResponse.ok) {
      const payload = await picksResponse.json();
      state.picks = Array.isArray(payload.picks) ? payload.picks : [];
      state.picksFetched = true;
    }
    if (recordResponse.ok) {
      const payload = await recordResponse.json();
      state.picksRecord = payload.record || null;
    }
  } catch {
    state.picks = [];
    state.picksRecord = null;
  }
}

async function loadLeagues() {
  try {
    const response = await fetch(API_CONFIG.leagues, { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const payload = await response.json();
    const items = Array.isArray(payload.leagues) ? payload.leagues : [];
    if (!items.length) return;
    leagueConfigs = items;
    leagues = items.map((item) => item.key);
    document.documentElement.style.setProperty("--league-accent", leagueAccent(state.league));
  } catch {
    document.documentElement.style.setProperty("--league-accent", leagueAccent(state.league));
  }
}

async function refreshData(manual = false) {
  const synced = await syncProviderData();
  if (manual) showToast(synced ? "Scores and odds synced" : "Live feed unavailable; showing demo data");
}

async function syncProviderData() {
  const [scoresUpdated, oddsUpdated] = await Promise.all([
    loadExternalScores(),
    loadExternalOdds({ render: false }),
    loadNews(),
    loadLineScores(),
  ]);
  await loadPicksData();
  rebuildSyncedGames();
  renderAll();
  return scoresUpdated || oddsUpdated;
}

function wireEvents() {
  document.addEventListener("click", (event) => {
    const leagueButton = event.target.closest("[data-league]");
    if (leagueButton) setLeague(leagueButton.dataset.league);

    const gameButton = event.target.closest("[data-game-id]");
    if (gameButton) selectGame(gameButton.dataset.gameId);

    const tabButton = event.target.closest("[data-tab]");
    if (tabButton) {
      state.detailTab = tabButton.dataset.tab;
      renderDetailTabs();
      renderDetailPanel();
    }

    const newsRow = event.target.closest("[data-news-link]");
    if (newsRow) window.open(newsRow.dataset.newsLink, "_blank", "noopener");

    const anchorButton = event.target.closest("[data-anchor]");
    if (anchorButton) {
      const anchor = anchorButton.dataset.anchor;
      if (anchor === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const target = $(`#${anchor}`);
        if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
      }

      document.querySelectorAll(".nav-pill[data-anchor], .mobile-nav [data-anchor]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.anchor === anchor);
      });
      const title = anchorButton.textContent.trim();
      if (title) $(".topbar-title").textContent = title;
    }
  });

  $("#followBtn").addEventListener("click", toggleFollow);
  $("#refreshBtn").addEventListener("click", () => refreshData(true));
  $("#newsFilterBtn").addEventListener("click", () => setLeague("All"));
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {
    /* PWA is optional; the app works without it */
  });
}

async function boot() {
  await Promise.resolve(API_CONFIG);
  registerServiceWorker();
  wireEvents();
  $("#dateline").textContent = new Date().toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  loadLogos();
  await loadLeagues();
  await loadPicksData();
  renderAll();
  syncProviderData();
  setInterval(() => {
    if (state.syncedGames.length) {
      syncProviderData();
    } else {
      simulateLiveTick(false);
      syncProviderData();
    }
  }, 30000);
}

boot();
