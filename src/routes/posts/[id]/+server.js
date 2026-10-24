import { redirect } from "@sveltejs/kit";
import { postPath } from "$lib/reddit-post.js";
import { fetchRedditPost } from "$lib/server/reddit-posts.js";

export const prerender = false;

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, platform }) {
  const row = await fetchRedditPost(platform, params.id);
  redirect(301, postPath(row));
}
