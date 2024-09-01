import { redirect } from "@sveltejs/kit";

/**
 * This function behaves as a redirector for the search queries.
 * 
 * Suggest format like this: <doc> - <url>
 * This API will redirect to <url> if it is a valid docs url.
 * Otherwise it will redirect to the search page.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET({ params }) {
    let query = params.query;
    query = decodeURIComponent((query + '').replace(/\+/g, '%20'));

    let [keyword, url] = query.split(" - ");
    if (url && /^https?:\/\/doc.rust-lang.org/.test(url)) {
        return redirect(302, url);
    }

    return redirect(302, "/?q=" + keyword);
}
