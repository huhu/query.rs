import { Marked } from "marked";

export const SITE_ORIGIN = "https://query.rs";

const POST_ID = /^[a-z0-9]{1,16}$/;

const marked = new Marked({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    html({ text }) {
      return escapeHtml(text || "");
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const safe = safeUrl(href);
      if (!safe) return text;
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<a href="${escapeHtml(safe)}"${titleAttr} rel="nofollow noopener noreferrer">${text}</a>`;
    },
    image({ href, title, text, tokens }) {
      let alt = text || "";
      if (tokens) {
        alt = this.parser.parseInline(tokens, this.parser.textRenderer);
      }
      const safe = safeUrl(href);
      if (!safe) return escapeHtml(alt);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${escapeHtml(safe)}" alt="${escapeHtml(alt)}"${titleAttr}>`;
    },
  },
});

/**
 * @param {string | null | undefined} id
 */
export function isPostId(id) {
  return typeof id === "string" && POST_ID.test(id);
}

const POST_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const SLUG_MAX = 80;
const UNDATED = "1970-01-01";

/** Posts per crawlable archive page. */
export const ARCHIVE_PAGE_SIZE = 50;

/**
 * Page 1 is /posts/archive. Later pages are /posts/archive/2, /posts/archive/3, …
 * @param {number} [page]
 */
export function archivePath(page = 1) {
  const n = Math.floor(Number(page));
  if (!Number.isInteger(n) || n <= 1) return "/posts/archive";
  return `/posts/archive/${n}`;
}

/**
 * @param {number} totalPosts
 */
export function archivePageCount(totalPosts) {
  const total = Number(totalPosts) || 0;
  if (total <= 0) return 1;
  return Math.ceil(total / ARCHIVE_PAGE_SIZE);
}

/**
 * Page numbers worth linking: the ends, the current page, and its neighbors.
 * @param {number} page
 * @param {number} pageCount
 * @returns {number[]}
 */
export function archivePageLinks(page, pageCount) {
  /** @type {Set<number>} */
  const pages = new Set([1, page, pageCount]);
  for (let n = page - 2; n <= page + 2; n += 1) {
    if (n >= 1 && n <= pageCount) pages.add(n);
  }
  return [...pages].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
}

/**
 * Canonical path: /posts/YYYY-MM-DD/{postId}/{title-slug}
 * @param {{ postId?: string | null, title?: string | null, createdAt?: string | null }} post
 */
export function postPath(post) {
  const id = String(post?.postId || "").toLowerCase();
  return `/posts/${postDate(post?.createdAt)}/${id}/${slugifyTitle(post?.title)}`;
}

/**
 * @param {{ postId?: string | null, title?: string | null, createdAt?: string | null }} post
 */
export function postCanonical(post) {
  return `${SITE_ORIGIN}${postPath(post)}`;
}

/**
 * @param {string | null | undefined} value
 */
export function isPostDate(value) {
  const match = POST_DATE.exec(value || "");
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * @param {string | null | undefined} createdAt
 */
export function postDate(createdAt) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(createdAt || "");
  if (match && isPostDate(match[1])) return match[1];
  return UNDATED;
}

/**
 * ASCII hyphen slug. Empty and non-Latin titles fall back to "post".
 * A display-only "[Media]" prefix is ignored so list links match the canonical slug.
 * @param {string | null | undefined} title
 */
export function slugifyTitle(title) {
  let text = decodeTitle(title || "").replace(/^\[media\]\s+/i, "");
  text = text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  text = text.toLowerCase().replace(/&/g, " and ").replace(/['’]/g, "");
  text = text.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (text.length > SLUG_MAX) {
    text = text.slice(0, SLUG_MAX).replace(/-+$/g, "");
  }
  return text || "post";
}

/**
 * @param {string | null | undefined} text
 */
export function decodeTitle(text) {
  if (!text) return "";
  return text
    .replace(/\\"/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Stored selftext uses literal "\n" and escaped quotes, matching the reader.
 * @param {string | null | undefined} text
 */
export function decodeBody(text) {
  if (!text) return "";
  return decodeTitle(text.replace(/\\n/g, "\n"));
}

/**
 * @param {{ title?: string | null, url?: string | null }} post
 */
export function formatTitle(post) {
  let title = decodeTitle(post?.title || "");
  const url = post?.url || "";
  if (/\.(gif|jpe?g|png|mp4)$/i.test(url) && !title.includes("[Media]")) {
    title = `[Media] ${title}`;
  }
  return title;
}

/**
 * @param {string | null | undefined} createdAt
 */
export function formatCreatedAt(createdAt) {
  if (!createdAt) return "";
  return createdAt.replace("T", " ").replace(/Z$/, "");
}

/**
 * @param {string | null | undefined} createdAt
 */
export function publishedTime(createdAt) {
  if (!createdAt) return "";
  const value = createdAt.trim();
  if (!value) return "";
  if (/[zZ]$/.test(value) || /[+-]\d{2}:\d{2}$/.test(value)) return value;
  return `${value}Z`;
}

/**
 * @param {string} text
 */
function clampDescription(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= 160) return normalized;
  const clipped = normalized.slice(0, 157);
  const lastSpace = clipped.lastIndexOf(" ");
  const base = lastSpace > 80 ? clipped.slice(0, lastSpace) : clipped;
  return `${base.trim()}…`;
}

/**
 * @param {string | null | undefined} text
 */
function stripMarkdown(text) {
  return decodeBody(text)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[>*+-]\s+/gm, "")
    .replace(/[*_~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {{ title?: string | null, url?: string | null, selftext?: string | null }} post
 */
export function metaDescription(post) {
  const body = stripMarkdown(post.selftext || "");
  if (body.length >= 40) return clampDescription(body);
  const title = formatTitle(post);
  return clampDescription(
    `${title} — a Rust discussion from r/rust, archived on Query.rs.`
  );
}

/**
 * @param {string | null | undefined} permalink
 */
export function redditUrl(permalink) {
  if (!permalink) return "";
  if (/^https?:\/\//i.test(permalink)) return permalink;
  const path = permalink.startsWith("/") ? permalink : `/${permalink}`;
  return `https://reddit.com${path}`;
}

/**
 * @param {string | null | undefined} url
 */
export function externalUrl(url) {
  if (!url || /reddit\.com/i.test(url)) return "";
  return safeUrl(url);
}

/**
 * @param {string | null | undefined} url
 */
export function isMediaUrl(url) {
  if (!url) return false;
  return (
    /\.(jpg|jpeg|png|gif|webp|mp4|webm)$/i.test(url) ||
    url.includes("i.imgur.com") ||
    url.includes("i.redd.it")
  );
}

/**
 * @param {string | null | undefined} url
 */
export function isVideoUrl(url) {
  return /\.(mp4|webm)$/i.test(url || "");
}

/**
 * @param {string | null | undefined} url
 */
export function isImageUrl(url) {
  return !!url && isMediaUrl(url) && !isVideoUrl(url);
}

/**
 * @param {string | null | undefined} text
 */
export function renderMarkdown(text) {
  if (!text) return "";
  try {
    const html = marked.parse(decodeBody(text));
    return typeof html === "string" ? html : "";
  } catch (err) {
    console.error("markdown render failed", err);
    return escapeHtml(decodeBody(text));
  }
}

/**
 * @param {unknown} value
 */
export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * Drop ASCII controls and whitespace so schemes like "java\nscript:" cannot slip through.
 * @param {string} href
 */
function compactUrl(href) {
  let out = "";
  const value = String(href).trim();
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    const code = value.charCodeAt(i);
    if (code <= 32 || code === 127 || /\s/u.test(char)) continue;
    out += char;
  }
  return out;
}

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Allow http(s), mailto, and same-site relative URLs. Reject protocol-relative
 * and scriptable schemes, including ones hidden by whitespace.
 * @param {string | null | undefined} href
 */
function safeUrl(href) {
  if (!href) return "";
  const compact = compactUrl(href);
  if (!compact || compact.startsWith("//")) return "";
  if (compact.startsWith("#")) return compact;
  if (compact.startsWith("/")) return compact;
  try {
    const url = new URL(compact);
    if (
      url.protocol === "http:" ||
      url.protocol === "https:" ||
      url.protocol === "mailto:"
    ) {
      return compact;
    }
  } catch {
    return "";
  }
  return "";
}
