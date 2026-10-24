import { isPostId, postPath, SITE_ORIGIN } from "./reddit-post.js";

export const STATIC_PATHS = [
  "/",
  "/reddit",
  "/about",
  "/crates",
  "/stats",
  "/settings",
  "/opensearch",
];

const SITEMAP_URL_LIMIT = 50000;
export const MAX_POST_URLS = SITEMAP_URL_LIMIT - STATIC_PATHS.length;

/**
 * @param {{ postId?: string | null, title?: string | null, createdAt?: string | null }[]} posts
 */
export function renderSitemap(posts) {
  /** @type {{ loc: string, lastmod?: string }[]} */
  const urls = [
    ...STATIC_PATHS.map((path) => ({ loc: `${SITE_ORIGIN}${path}` })),
    ...posts.slice(0, MAX_POST_URLS).flatMap((post) => {
      const id = String(post?.postId || "").toLowerCase();
      if (!isPostId(id)) return [];
      const lastmod = dateOnly(post.createdAt);
      return [
        {
          loc: `${SITE_ORIGIN}${postPath({ ...post, postId: id })}`,
          lastmod,
        },
      ];
    }),
  ];

  const body = urls
    .map((url) => {
      const lastmod = url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : "";
      return `  <url><loc>${escapeXml(url.loc)}</loc>${lastmod}</url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

/**
 * @param {string | null | undefined} createdAt
 */
function dateOnly(createdAt) {
  if (!createdAt) return "";
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(createdAt);
  return match ? match[1] : "";
}

/**
 * @param {string} value
 */
function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
