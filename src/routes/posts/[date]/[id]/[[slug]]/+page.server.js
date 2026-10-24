import { error, redirect } from "@sveltejs/kit";
import {
  externalUrl,
  formatCreatedAt,
  formatTitle,
  isImageUrl,
  isMediaUrl,
  isPostDate,
  isVideoUrl,
  metaDescription,
  postCanonical,
  postPath,
  publishedTime,
  redditUrl,
  renderMarkdown,
  SITE_ORIGIN,
} from "$lib/reddit-post.js";
import { fetchRedditPost } from "$lib/server/reddit-posts.js";

export const prerender = false;
export const ssr = true;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform, setHeaders, url }) {
  if (!isPostDate(params.date)) error(404, "Post not found");

  const row = await fetchRedditPost(platform, params.id);
  const canonicalPath = postPath(row);
  if (url.pathname !== canonicalPath) {
    redirect(301, canonicalPath);
  }

  setHeaders({
    "cache-control": "public, max-age=3600",
  });

  const title = formatTitle(row) || "Reddit post";
  const description = metaDescription(row);
  const canonical = postCanonical(row);
  const image = isImageUrl(row.url) ? row.url : `${SITE_ORIGIN}/og.png`;
  const published = publishedTime(row.createdAt);

  return {
    post: {
      postId: row.postId,
      title,
      author: row.author || "",
      score: row.score ?? 0,
      createdAtLabel: formatCreatedAt(row.createdAt),
      publishedTime: published,
      numComments: row.numComments ?? null,
      redditUrl: redditUrl(row.permalink),
      externalUrl: externalUrl(row.url),
      mediaUrl: isMediaUrl(row.url) ? row.url : "",
      video: isVideoUrl(row.url),
      bodyHtml: renderMarkdown(row.selftext),
    },
    seo: {
      title: `${title} · Query.rs`,
      description,
      canonical,
      ogType: "article",
      image,
      publishedTime: published,
      author: row.author || "",
    },
  };
}
