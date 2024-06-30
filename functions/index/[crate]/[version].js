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

    descShardJs(crate, shard) {
        return `search.desc/${crate}/${crate}-desc-${shard}-${this.resourceSuffix}.js`;
    }
}

class VlqHexDecoder {
    constructor(string, cons) {
        this.string = string;
        this.cons = cons;
        this.offset = 0;
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

export async function onRequestGet(context) {
    let crate = context.params.crate;
    let version = context.params.version;

    let docUrl = `https://docs.rs/${crate}/${version}`;
    console.log(docUrl);

    let metaHandler = new MetaHandler();
    let rewriter = new HTMLRewriter().on('meta', metaHandler);

    rewriter.transform(await fetch(docUrl));
    // sleep 1 ms to wait for the rewriter to finish
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 1: load search-index.js
    let searchIndexUrl = new URL(`${docUrl}/${metaHandler.searchIndexJs()}`);
    console.log(searchIndexUrl.href);
    let response = await fetch(searchIndexUrl);
    let text = await response.text();
    let start = text.indexOf("parse('") + 7;
    let end = text.lastIndexOf("'));");
    let searchIndex = JSON.parse(text.substring(start, end).replace(/\\/g, ''));

    // Step 2: load desc shards
    // Get desc shards number from search index
    let vlqHex = searchIndex[0][1]["D"];
    let decoder = new VlqHexDecoder(vlqHex, noop => noop);
    let shardNum = 0;

    let shards = {};
    while (decoder.next() > 0) {
        let descShardJsUrl = new URL(`${docUrl}/${metaHandler.descShardJs(context.params.crate, shardNum)}`);
        console.log(descShardJsUrl.href);
        response = await fetch(descShardJsUrl);
        text = await response.text();
        let result = text.substring("searchState.loadedDescShard(".length, text.length - 1);
        let [crate, shard, ...descs] = result.split(',');
        descs = descs.join("").trim();
        // Trim the first and last `"`
        descs = descs.substring(1, descs.length);

        descs = descs.split("\\n").map(desc => {
            return desc.replace(/<\/?(code|span)>/g, "");
        });
        shards[shard] = descs;
        shardNum += 1;
    }

    // Step 3: get crate detail
    response = await fetch(`https://crates.io/api/v1/crates/${crate}`, {
        headers: {
            "User-Agent": "Query.rs on Cloudflare Pages function",
        }
    });
    let data = await response.json();
    return Response.json({
        crate,
        version,
        title: data.crate.description,
        searchIndex,
        descShards: [context.params.crate, shards],
    });
}