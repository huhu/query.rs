import { redirect } from "@sveltejs/kit";
import searchIndex from "querylib/index/std-docs";
import { DescShardManager, DocSearch } from "querylib/search";

/**
 * This function behaves as a redirector for the search queries.
 * 
 * There are two types of search queries:
 * A keyword query. This is a known word followed by a colon and a search query.
 * This will direct the user to the appropriate page as long as an exact match is found.
 * 
 * A general query. This is a search query without a keyword. This will direct
 * the user to the search page.
 * 
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function GET({ params }) {
    let query = params.query;
    query = decodeURIComponent((query + '').replace(/\+/g, '%20'));

    // // This is the first word in query
    let keyword = query.split(":")[0];
    let queryWithoutKeyword = query.slice(keyword.length + 1).trim();

    if (keyword === "std") {
        const descShards = new DescShardManager();
        let stdSearcher = new DocSearch(
            "std",
            structuredClone(searchIndex),
            "https://doc.rust-lang.org/",
            descShards,
        );

        let response = await stdSearcher.search(queryWithoutKeyword);
        let firstEntry = response[0];
        if (firstEntry) {
            let valueToCheckFor = "std: " + firstEntry["path"] + "::" + firstEntry["name"];
            if (valueToCheckFor == query) {
                return Response.redirect(firstEntry["href"]);
            }
        }
    } else if (keyword === "crate") {
        // const crateSearcher = new CrateSearch(mapping, crateIndex);
        // let response = await crateSearcher.search(queryWithoutKeyword);
        // let firstEntry = response[0];
        // if (firstEntry) {
        //     let valueToCheckFor = firstEntry["id"];
        //     if (valueToCheckFor == queryWithoutKeyword) {
        //         return Response.redirect("https://crates.io/crates/" + firstEntry["id"]);
        //     }
        // }
    }

    return redirect(302, "/?q=" + query);
}
