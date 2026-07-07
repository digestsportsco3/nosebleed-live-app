const BLOG_URL = "https://nosebleedsportsmedia.com/blog";
const CACHE_TTL_MS = Number(process.env.NEWSLETTER_CACHE_TTL_MS || 15 * 60 * 1000);
const MAX_ITEMS = 8;
const ENRICH_COUNT = 5;

let cache = null;

// The main site's auth middleware (Clerk) bounces cookie-less clients through
// a handshake redirect chain. Node's fetch doesn't carry Set-Cookie across
// redirects, so follow them manually with a per-host cookie jar.
async function fetchThroughHandshake(startUrl, maxHops = 8) {
  const jars = new Map();
  let url = startUrl;

  for (let hop = 0; hop < maxHops; hop++) {
    const host = new URL(url).host;
    const cookies = jars.get(host);
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        accept: "text/html",
        "user-agent": "NosebleedLive/1.0 (+https://live.nosebleedsportsmedia.com)",
        ...(cookies ? { cookie: cookies } : {}),
      },
    });

    const setCookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
    if (setCookies.length) {
      const existing = jars.get(host) ? `${jars.get(host)}; ` : "";
      jars.set(host, existing + setCookies.map((cookie) => cookie.split(";")[0]).join("; "));
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return response;
      url = new URL(location, url).href;
      continue;
    }

    return response;
  }

  throw new Error("Redirect chain did not settle");
}

// The blog page publishes schema.org JSON-LD with every article's headline,
// URL, and date - a stable contract, not markup scraping.
function extractArticles(html) {
  const articles = [];
  const blocks = html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs);
  for (const block of blocks) {
    try {
      const data = JSON.parse(block[1]);
      const parts = Array.isArray(data.hasPart) ? data.hasPart : [];
      for (const part of parts) {
        if (part["@type"] === "Article" && part.headline && part.url) {
          articles.push({
            headline: part.headline,
            url: part.url,
            published: part.datePublished || null,
          });
        }
      }
    } catch {
      /* skip malformed blocks */
    }
  }
  return articles;
}

async function enrichArticle(article) {
  try {
    const upstream = await fetchThroughHandshake(article.url);
    if (!upstream.ok) return article;
    const html = await upstream.text();
    const image = html.match(/property="og:image" content="([^"]+)"/)?.[1] || "";
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] || "";
    return { ...article, image, description };
  } catch {
    return article;
  }
}

async function getNewsletter() {
  if (cache && Date.now() - cache.createdAt < CACHE_TTL_MS) {
    return cache.payload;
  }

  const errors = [];
  let articles = [];
  try {
    const upstream = await fetchThroughHandshake(BLOG_URL);
    if (upstream.ok) {
      articles = extractArticles(await upstream.text()).slice(0, MAX_ITEMS);
    } else {
      errors.push({ status: upstream.status, message: `Blog returned ${upstream.status}` });
    }
  } catch (error) {
    errors.push({ message: error.message });
  }

  if (!articles.length && cache) {
    return { ...cache.payload, meta: { ...cache.payload.meta, stale: true, errors } };
  }

  const enriched = await Promise.all(
    articles.map((article, index) => (index < ENRICH_COUNT ? enrichArticle(article) : Promise.resolve(article))),
  );

  const items = enriched.map((article) => ({
    id: article.url,
    league: "NOSEBLEED",
    headline: article.headline,
    description: article.description || "",
    published: article.published,
    link: article.url,
    image: article.image || "",
    type: "Newsletter",
  }));

  const payload = {
    items,
    meta: {
      provider: "Nosebleed Sports blog",
      fetchedAt: new Date().toISOString(),
      count: items.length,
      errors,
    },
  };

  cache = { createdAt: Date.now(), payload };
  return payload;
}

module.exports = { getNewsletter };
