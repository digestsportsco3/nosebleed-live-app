const ESPN_SITE_API_BASE = "https://site.api.espn.com/apis/site/v2/sports";
const CACHE_TTL_MS = Number(process.env.NEWS_CACHE_TTL_MS || 5 * 60 * 1000);

const ESPN_NEWS_PATHS = {
  MLB: "baseball/mlb",
  NBA: "basketball/nba",
  NFL: "football/nfl",
  NHL: "hockey/nhl",
  WNBA: "basketball/wnba",
};

let cache = null;

async function getNews() {
  if (cache && Date.now() - cache.createdAt < CACHE_TTL_MS) {
    return cache.payload;
  }

  const items = [];
  const errors = [];

  await Promise.all(
    Object.entries(ESPN_NEWS_PATHS).map(async ([league, sportPath]) => {
      try {
        const endpoint = `${ESPN_SITE_API_BASE}/${sportPath}/news?limit=10`;
        const upstream = await fetch(endpoint, { headers: { accept: "application/json" } });
        if (!upstream.ok) {
          errors.push({ league, status: upstream.status, message: `ESPN news returned ${upstream.status}` });
          return;
        }

        const data = await upstream.json();
        for (const article of Array.isArray(data.articles) ? data.articles : []) {
          const item = normalizeArticle(article, league);
          if (item) items.push(item);
        }
      } catch (error) {
        errors.push({ league, message: error.message });
      }
    }),
  );

  items.sort((a, b) => new Date(b.published || 0).getTime() - new Date(a.published || 0).getTime());

  if (!items.length && cache) {
    return {
      ...cache.payload,
      meta: { ...cache.payload.meta, stale: true, errors },
    };
  }

  const payload = {
    items,
    meta: {
      provider: "ESPN public news JSON",
      fetchedAt: new Date().toISOString(),
      errors,
    },
  };

  cache = { createdAt: Date.now(), payload };
  return payload;
}

function normalizeArticle(article, league) {
  const headline = article.headline || article.title || "";
  if (!headline) return null;

  const link = article.links?.web?.href || article.links?.mobile?.href || "";
  return {
    id: String(article.id || article.dataSourceIdentifier || link || headline),
    league,
    headline,
    description: article.description || "",
    published: article.published || article.lastModified || null,
    link,
    image: article.images?.[0]?.url || "",
    type: article.type || "News",
  };
}

module.exports = { getNews };
