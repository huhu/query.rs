export async function onRequestGet(context) {
    let crate = context.params.crate;
    let response = await fetch(`https://crates.io/api/v1/crates/${crate}`, {
        headers: {
            "User-Agent": "Query.rs on Cloudflare Pages function",
        }
    });
    if (response.status !== 200) {
        return new Response(response.statusText, { status: response.status });
    }
    let data = await response.json();
    console.log(data.crate);
    if (data.crate) {
        return Response.redirect(data.crate.repository || data.crate.homepage, 301);
    } else {
        const html = `<div>
        <p>Sorry, the crate <b>${crate}</b> has no repository url. </p>
        <h2 class="redirect">Go to <a href="https://crates.io/crates/${crate}">crates.io/crates/${crate}</a> or <a href="https://docs.rs/${crate}">docs.rs/${crate}</a></h2>
        </div>`;
        return new Response(html, {
            headers: {
                "content-type": "text/html;charset=UTF-8",
            }
        });
    }
}