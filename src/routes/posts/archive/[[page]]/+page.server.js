import { error, redirect } from "@sveltejs/kit";
import {
  ARCHIVE_PAGE_SIZE,
  archivePageCount,
  archivePageLinks,
  archivePath,
  DISCUSSION_BODY_SQL,
  formatCreatedAt,
  formatTitle,
  postPath,
  SITE_ORIGIN,
} from "$lib/reddit-post.js";

export const prerender = false;
export const ssr = true;

const COUNT_SQL = `SELECT COUNT(*) AS total FROM reddit_posts WHERE ${DISCUSSION_BODY_SQL}`;
const LIST_SQL = `SELECT postId, title, score, author, createdAt, url
         FROM reddit_posts
         WHERE ${DISCUSSION_BODY_SQL}
         ORDER BY createdAt DESC, postId DESC
         LIMIT ? OFFSET ?`;

/**
 * @param {string | undefined} raw
 * @returns {number | null}
 */
function pageNumber(raw) {
  if (raw == null) return 1;
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const page = Number(raw);
  if (!Number.isSafeInteger(page)) return null;
  return page;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform, setHeaders }) {
  const page = pageNumber(params.page);
  if (page == null) error(404, "Page not found");

  const requested = params.page == null ? "/posts/archive" : `/posts/archive/${params.page}`;
  if (requested !== archivePath(page)) redirect(301, archivePath(page));

  const db = platform?.env?.DB;
  if (!db) error(500, "Database unavailable");

  const listed = await listPage(db, page);
  if (!listed) error(404, "Page not found");

  setHeaders({
    "cache-control": "public, max-age=3600",
  });

  const { total, pageCount, rows } = listed;
  return {
    page,
    pageCount,
    total,
    prev: page > 1 ? archivePath(page - 1) : null,
    next: page < pageCount ? archivePath(page + 1) : null,
    pageLinks: archivePageLinks(page, pageCount).map((n) => ({
      page: n,
      href: archivePath(n),
    })),
    posts: rows.map((row) => ({
      href: postPath(row),
      title: formatTitle(row) || "Reddit post",
      score: row.score ?? 0,
      author: row.author || "",
      createdAtLabel: formatCreatedAt(row.createdAt),
    })),
    seo: {
      title: page === 1 ? "Reddit posts · Query.rs" : `Reddit posts, page ${page} · Query.rs`,
      description:
        page === 1
          ? "Browse r/rust posts indexed by Query.rs, newest first."
          : `Page ${page} of r/rust posts indexed by Query.rs.`,
      canonical: `${SITE_ORIGIN}${archivePath(page)}`,
      ogType: "website",
    },
  };
}

/**
 * @param {{ prepare: (sql: string) => { bind: (...values: unknown[]) => { first: () => Promise<{ total?: number } | null>, all: () => Promise<{ results?: ArchiveRow[] }> } } }} db
 * @param {number} page
 * @returns {Promise<{ total: number, pageCount: number, rows: ArchiveRow[] } | null>}
 */
async function listPage(db, page) {
  try {
    const countRow = await db.prepare(COUNT_SQL).bind().first();
    const total = Number(countRow?.total) || 0;
    const pageCount = archivePageCount(total);
    if (page > pageCount) return null;

    const offset = (page - 1) * ARCHIVE_PAGE_SIZE;
    const batch = await db.prepare(LIST_SQL).bind(ARCHIVE_PAGE_SIZE, offset).all();
    return { total, pageCount, rows: batch?.results ?? [] };
  } catch (err) {
    console.error("archive query failed", err);
    error(500, "Could not load posts");
  }
}

/**
 * @typedef {Object} ArchiveRow
 * @property {string} postId
 * @property {string | null} title
 * @property {number | null} score
 * @property {string | null} author
 * @property {string | null} createdAt
 * @property {string | null} url
 */
