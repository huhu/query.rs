/**
 * A HTML handler to parse attributes from meta tag
 * <meta name="rustdoc-vars"
 *       data-root-path="../"
 *       data-static-root-path="/-/rustdoc.static/"
 *       data-current-crate="opentelemetry"
 *       data-themes=""
 *       data-resource-suffix="-20240514-1.80.0-nightly-8387315ab"
 *       data-rustdoc-version="1.80.0-nightly (8387315ab 2024-05-14)"
 *       data-channel="nightly" 
 *       data-search-js="search-d52510db62a78183.js"
 *       data-settings-js="settings-4313503d2e1961c2.js">
 */
class MetaHandler {
    /**
     * @param {{ getAttribute: (arg0: string) => string; }} element
     */
    element(element) {
        if (element.getAttribute('name') === 'rustdoc-vars') {
            this.rootPath = element.getAttribute('data-root-path');
            this.resourceSuffix = element.getAttribute('data-resource-suffix');
            this.searchJs = element.getAttribute('data-search-js');
            this.settingsJs = element.getAttribute('data-settings-js');
        }
    }

    searchIndexJs() {
        return `search-index${this.resourceSuffix}.js`;
    }

    /**
     * @param {string} crate
     * @param {number} shard
     */
    descShardJs(crate, shard) {
        return `search.desc/${crate}/${crate}-desc-${shard}-${this.resourceSuffix}.js`;
    }
}

class VlqHexDecoder {
    /**
     * @param {any} string
     * @param {(noop: any) => any} cons
     */
    constructor(string, cons) {
        this.string = string;
        this.cons = cons;
        this.offset = 0;
        /**
         * @type {any[]}
         */
        this.backrefQueue = [];
    }
    // call after consuming `{`
    decodeList() {
        const cb = "}".charCodeAt(0);
        let c = this.string.charCodeAt(this.offset);
        const ret = [];
        while (c !== cb) {
            ret.push(this.decode());
            c = this.string.charCodeAt(this.offset);
        }
        this.offset += 1; // eat cb
        return ret;
    }
    // consumes and returns a list or integer
    decode() {
        const [ob, la] = ["{", "`"].map(c => c.charCodeAt(0));
        let n = 0;
        let c = this.string.charCodeAt(this.offset);
        if (c === ob) {
            this.offset += 1;
            return this.decodeList();
        }
        while (c < la) {
            n = (n << 4) | (c & 0xF);
            this.offset += 1;
            c = this.string.charCodeAt(this.offset);
        }
        // last character >= la
        n = (n << 4) | (c & 0xF);
        const [sign, value] = [n & 1, n >> 1];
        this.offset += 1;
        return sign ? -value : value;
    }
    next() {
        const c = this.string.charCodeAt(this.offset);
        const [zero, ua, la] = ["0", "@", "`"].map(c => c.charCodeAt(0));
        // sixteen characters after "0" are backref
        if (c >= zero && c < ua) {
            this.offset += 1;
            return this.backrefQueue[c - zero];
        }
        // special exception: 0 doesn't use backref encoding
        // it's already one character, and it's always nullish
        if (c === la) {
            this.offset += 1;
            return this.cons(0);
        }
        const result = this.cons(this.decode());
        this.backrefQueue.unshift(result);
        if (this.backrefQueue.length > 16) {
            this.backrefQueue.pop();
        }
        return result;
    }
}

export async function GET({ params, platform }) {
    let crate = params.crate;
    let version = params.version;

    let cacheKey = `${crate}/${version}`;
    const obj = await platform.env.QUERY_INDEX.get(cacheKey);
    if (obj) {
        return Response.json(await obj.json());
    }

    let docUrl = `https://docs.rs/${crate}/${version}`;
    if (crate === "std") {
        docUrl = `https://doc.rust-lang.org/${version}/std`;
    }
    console.log('docUrl:', docUrl);

    let metaHandler = new MetaHandler();
    let rewriter = new HTMLRewriter().on('meta', metaHandler);

    let response = await fetch(docUrl);
    if (response.status !== 200) {
        return Response.json({ 'error': `Crate ${crate} not found` }, { status: 404 });
    }
    let [crateName, crateVersion, libName] = new URL(response.url).pathname.slice(1).split("/");
    rewriter.transform(response);

    let waitTime = 0;
    while (!metaHandler.resourceSuffix || waitTime < 100) {
        // wait until rewriting finished
        await new Promise(resolve => setTimeout(resolve, 1));
        waitTime += 1;
    }

    // Step 1: load search-index.js
    if (crate === "std") {
        docUrl = `https://doc.rust-lang.org/${version}`;
        libName = "std";
    }
    let searchIndexUrl = new URL(`${docUrl}/${metaHandler.searchIndexJs()}`);
    console.log("searchIndexUrl:", searchIndexUrl.href);
    response = await fetch(searchIndexUrl);
    let text = await response.text();
    let start = text.indexOf("parse('") + 7;
    let end = text.indexOf("')");
    let searchIndex = JSON.parse(text.substring(start, end).replace(/\\/g, ''));

    // Step 2: load desc shards
    if (!(searchIndex[0] && searchIndex[0][1] && "D" in searchIndex[0][1])) {
        return Response.json({
            error: `This crate version: ${libName}/${crateVersion} is not supported`
        }, { status: 400 });
    }

    let descShards = [];
    for (let crateIndex of searchIndex) {
        let crate = crateIndex[0];
        console.log("searchIndex: ", crate);
        // Get desc shards number from search index
        let vlqHex = crateIndex[1]["D"];
        let decoder = new VlqHexDecoder(vlqHex, (/** @type {any} */ noop) => noop);
        let shardNum = 0;

        let shards = {};
        while (decoder.next() > 0) {
            let descShardJsUrl = new URL(`${docUrl}/${metaHandler.descShardJs(crate, shardNum)}`);
            console.log("descShardJsUrl:", descShardJsUrl.href);
            response = await fetch(descShardJsUrl);
            text = await response.text();
            let result = text.substring("searchState.loadedDescShard(".length, text.length - 1);
            let [_crate, shard, ...descs] = result.split(',');
            descs = descs.join("").trim();
            // Trim the first and last `"`
            descs = descs.substring(1, descs.length);

            descs = descs.split("\\n").map((/** @type {string} */ desc) => {
                return desc.replace(/<\/?(code|span)>/g, "");
            });
            // trim and parse shard into int
            shards[parseInt(shard.trim())] = descs;
            shardNum += 1;
        }

        descShards.push([crate, shards]);
    }


    // Step 3: get crate detail
    let crateTitle = "";
    if (crate !== "std") {
        response = await fetch(`https://crates.io/api/v1/crates/${crate}`, {
            headers: {
                "User-Agent": "Query.rs on Cloudflare Pages function",
            }
        });
        let data = await response.json();
        crateTitle = data.crate.description;
    }

    let index = {
        libName,
        crateName,
        crateVersion,
        crateTitle,
        searchIndex,
        descShards,
    };

    // cache the index
    await platform.env.QUERY_INDEX.put(cacheKey, JSON.stringify(index));
    return Response.json(index);
}
