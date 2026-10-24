import { describe, expect, it } from "vitest";
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

describe("post page load", () => {
  it("opts out of prerender and keeps server rendering", () => {
    expect(prerender).toBe(false);
    expect(ssr).toBe(true);
  });

  it("returns article html and seo fields from D1", async () => {
    const headers = new Headers();
    const data = await load({
      params: { id: "18X6UC3" },
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
    expect(data.seo.canonical).toBe("https://query.rs/posts/18x6uc3");
    expect(data.seo.title).toBe(`${row.title} · Query.rs`);
    expect(data.seo.description).toContain("I've written plenty of c++");
    expect(data.seo.ogType).toBe("article");
    expect(data.seo.publishedTime).toBe("2024-01-03T02:30:04Z");
    expect(data.seo.image).toBe("https://query.rs/og.png");
    expect(headers.get("cache-control")).toContain("max-age=3600");
  });

  it("uses an image url as the social image", async () => {
    const data = await load({
      params: { id: "img123" },
      platform: mockPlatform({
        ...row,
        postId: "img123",
        url: "https://i.redd.it/crab.png",
        selftext: "",
      }),
      setHeaders() {},
    });

    expect(data.post.mediaUrl).toBe("https://i.redd.it/crab.png");
    expect(data.post.video).toBe(false);
    expect(data.seo.image).toBe("https://i.redd.it/crab.png");
    expect(data.post.bodyHtml).toBe("");
  });

  it("404s for unknown and invalid ids", async () => {
    await expect(
      load({
        params: { id: "missing" },
        platform: mockPlatform(row),
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 404 });

    await expect(
      load({
        params: { id: "../passwd" },
        platform: mockPlatform(row),
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 404 });
  });

  it("fails when D1 is not bound", async () => {
    await expect(
      load({
        params: { id: "18x6uc3" },
        platform: {},
        setHeaders() {},
      })
    ).rejects.toMatchObject({ status: 500 });
  });
});
