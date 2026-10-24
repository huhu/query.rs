import { describe, expect, it } from "vitest";
import { postPath } from "$lib/reddit-post.js";
import { load, prerender, ssr } from "./+page.server.js";

const row = {
  postId: "18x6uc3",
  score: 1146,
  title: "I don't even use rust for the memory safety",
  selftext:
    "I've written plenty of c++ for work.\\n\\n<script>alert(1)</script>\\n\\nLife is great.",
  author: "abiotic_studio",
  permalink: "/r/rust/comments/18x6uc3/i_dont_even_use_rust_for_the_memory_safety/",
  url: "https://www.reddit.com/r/rust/comments/18x6uc3/i_dont_even_use_rust_for_the_memory_safety/",
  createdAt: "2024-01-03T02:30:04",
  numComments: null,
};

const canonicalPath = postPath(row);

/**
 * @param {typeof row | null} result
 */
function mockPlatform(result) {
  return {
    env: {
      DB: {
        prepare() {
          return {
            bind(id) {
              return {
                async first() {
                  return id === result?.postId ? result : null;
                },
              };
            },
          };
        },
      },
    },
  };
}

/**
 * @param {string} pathname
 */
function request(pathname) {
  const [, , date, id, slug] = pathname.split("/");
  return {
    params: { date, id, slug },
    url: new URL(`https://query.rs${pathname}`),
  };
}

describe("post page load", () => {
  it("opts out of prerender and keeps server rendering", () => {
    expect(prerender).toBe(false);
    expect(ssr).toBe(true);
  });

  it("returns article html and a canonical dated slug url", async () => {
    const headers = new Headers();
    const data = await load({
      ...request(canonicalPath),
      platform: mockPlatform(row),
      setHeaders(next) {
        for (const [key, value] of Object.entries(next)) {
          headers.set(key, value);
        }
      },
    });

    expect(data.post.title).toBe(row.title);
    expect(data.post.bodyHtml).toContain("Life is great.");
    expect(data.post.bodyHtml).not.toContain("<script>");
    expect(data.post.redditUrl).toContain("reddit.com/r/rust/comments/18x6uc3");
    expect(data.post.externalUrl).toBe("");
    expect(data.seo.canonical).toBe(`https://query.rs${canonicalPath}`);
    expect(data.seo.canonical).toBe(
      "https://query.rs/posts/2024-01-03/18x6uc3/i-dont-even-use-rust-for-the-memory-safety"
    );
    expect(data.seo.title).toBe(`${row.title} · Query.rs`);
    expect(data.seo.description).toContain("I've written plenty of c++");
    expect(data.seo.ogType).toBe("article");
    expect(data.seo.publishedTime).toBe("2024-01-03T02:30:04Z");
    expect(data.seo.image).toBe("https://query.rs/og.png");
    expect(headers.get("cache-control")).toContain("max-age=3600");
  });

  it("redirects a stale slug or date to the canonical path", async () => {
    await expect(
      load({
        ...request("/posts/2024-01-03/18x6uc3/wrong-slug"),
        platform: mockPlatform(row),
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 301, location: canonicalPath });

    await expect(
      load({
        ...request("/posts/2020-01-01/18x6uc3/i-dont-even-use-rust-for-the-memory-safety"),
        platform: mockPlatform(row),
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 301, location: canonicalPath });

    await expect(
      load({
        ...request(canonicalPath.replace("/18x6uc3/", "/18X6UC3/")),
        platform: mockPlatform(row),
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 301, location: canonicalPath });
  });

  it("uses an image url as the social image", async () => {
    const imagePost = {
      ...row,
      postId: "img123",
      url: "https://i.redd.it/crab.png",
      selftext: "A crab, described in the post body.",
    };
    const data = await load({
      ...request(postPath(imagePost)),
      platform: mockPlatform(imagePost),
      setHeaders() {},
    });

    expect(data.post.mediaUrl).toBe("https://i.redd.it/crab.png");
    expect(data.post.video).toBe(false);
    expect(data.seo.image).toBe("https://i.redd.it/crab.png");
    expect(data.post.bodyHtml).toContain("described in the post body");

    const scriptUrl = {
      ...row,
      postId: "img124",
      url: "javascript:alert(1).jpg",
      permalink: "https://reddit.com.evil.com/phish",
      selftext: "Still a discussion, but the media url is unsafe.",
    };
    const unsafe = await load({
      ...request(postPath(scriptUrl)),
      platform: mockPlatform(scriptUrl),
      setHeaders() {},
    });
    expect(unsafe.post.mediaUrl).toBe("");
    expect(unsafe.seo.image).toBe("https://query.rs/og.png");
    expect(unsafe.post.redditUrl).toBe("");
  });

  it("404s link-only posts instead of serving an empty article", async () => {
    const linkOnly = {
      ...row,
      postId: "linkonly",
      selftext: "",
      url: "https://blog.rust-lang.org/release",
    };
    await expect(
      load({
        ...request(postPath(linkOnly)),
        platform: mockPlatform(linkOnly),
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 404 });

    const whitespace = {
      ...row,
      postId: "blankbody",
      selftext: "\\n\\n\\n",
    };
    await expect(
      load({
        ...request(postPath(whitespace)),
        platform: mockPlatform(whitespace),
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 404 });
  });

  it("404s for unknown ids, invalid ids, and invalid dates", async () => {
    await expect(
      load({
        ...request("/posts/2024-01-03/missing/somewhere"),
        platform: mockPlatform(row),
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 404 });

    await expect(
      load({
        ...request("/posts/2024-02-31/18x6uc3/title"),
        platform: mockPlatform(row),
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 404 });
  });

  it("fails when D1 is not bound", async () => {
    await expect(
      load({
        ...request(canonicalPath),
        platform: {},
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 500 });
  });
});
