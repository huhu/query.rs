import { describe, expect, it } from "vitest";
import { ARCHIVE_PAGE_SIZE, postPath } from "$lib/reddit-post.js";
import { load, prerender, ssr } from "./+page.server.js";

/**
 * @param {number} count
 */
function rows(count) {
  return Array.from({ length: count }, (_, index) => ({
    postId: `p${index.toString(36)}`,
    title: index === 0 ? "Crab photo" : `Post ${index}`,
    score: 1000 - index,
    author: index === 0 ? "ferris" : "",
    createdAt: "2024-06-02T15:20:03",
    url:
      index === 1
        ? "https://blog.rust-lang.org/release"
        : index === 0
          ? "https://i.redd.it/crab.png"
          : "https://www.reddit.com/r/rust/comments/p/t/",
    permalink: `/r/rust/comments/p${index}/post/`,
    discussion: index === 1 ? 0 : 1,
  }));
}

/**
 * @param {ReturnType<typeof rows> | null} allRows
 * @param {{ fail?: boolean }} [options]
 */
function mockPlatform(allRows, options = {}) {
  return {
    env: {
      DB: {
        prepare(sql) {
          return {
            bind(limit, offset) {
              return {
                async first() {
                  if (options.fail) throw new Error("d1 down");
                  if (!String(sql).includes("COUNT")) return null;
                  return { total: allRows?.length ?? 0 };
                },
                async all() {
                  if (options.fail) throw new Error("d1 down");
                  const start = Number(offset) || 0;
                  const end = start + (Number(limit) || 0);
                  return { results: (allRows ?? []).slice(start, end) };
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
 * @param {string | undefined} page
 */
function request(page) {
  return {
    params: { page },
    setHeaders() {},
  };
}

describe("archive page load", () => {
  it("opts out of prerender and keeps server rendering", () => {
    expect(prerender).toBe(false);
    expect(ssr).toBe(true);
  });

  it("returns crawlable canonical links for the first page", async () => {
    const allRows = rows(51);
    const data = await load({
      ...request(undefined),
      platform: mockPlatform(allRows),
    });

    expect(data.posts).toHaveLength(ARCHIVE_PAGE_SIZE);
    expect(data.posts[0].title).toBe("[Media] Crab photo");
    expect(data.posts[0].author).toBe("ferris");
    expect(data.posts[0].href).toBe(postPath(allRows[0]));
    expect(data.posts[0].href).toBe("/posts/2024-06-02/p0/crab-photo");
    expect(data.posts[0].external).toBe(false);
    expect(data.posts[0].href).not.toContain("media");
    expect(data.posts[1].href).toBe("https://blog.rust-lang.org/release");
    expect(data.posts[1].external).toBe(true);
    expect(data.posts[1].href).not.toContain("/posts/");
    expect(data.prev).toBeNull();
    expect(data.next).toBe("/posts/archive/2");
    expect(data.pageLinks.map((link) => link.href)).toEqual([
      "/posts/archive",
      "/posts/archive/2",
    ]);
    expect(data.seo.canonical).toBe("https://query.rs/posts/archive");
    expect(data.seo.ogType).toBe("website");
  });

  it("serves a later page and an empty first page", async () => {
    const allRows = rows(51);
    const pageTwo = await load({
      ...request("2"),
      platform: mockPlatform(allRows),
    });

    expect(pageTwo.posts).toHaveLength(1);
    expect(pageTwo.posts[0].href).toBe(postPath(allRows[50]));
    expect(pageTwo.prev).toBe("/posts/archive");
    expect(pageTwo.next).toBeNull();
    expect(pageTwo.seo.canonical).toBe("https://query.rs/posts/archive/2");
    expect(pageTwo.seo.title).toContain("page 2");

    const empty = await load({
      ...request(undefined),
      platform: mockPlatform([]),
    });
    expect(empty.posts).toEqual([]);
    expect(empty.pageCount).toBe(1);
    expect(empty.next).toBeNull();
  });

  it("redirects page 1 and rejects pages that are not in the catalog", async () => {
    await expect(
      load({
        ...request("1"),
        platform: mockPlatform(rows(1)),
      })
    ).rejects.toMatchObject({ status: 301, location: "/posts/archive" });

    await expect(
      load({
        ...request("3"),
        platform: mockPlatform(rows(51)),
      })
    ).rejects.toMatchObject({ status: 404 });

    await expect(
      load({
        ...request("02"),
        platform: mockPlatform(rows(51)),
      })
    ).rejects.toMatchObject({ status: 404 });

    await expect(
      load({
        ...request("nope"),
        platform: mockPlatform(rows(51)),
      })
    ).rejects.toMatchObject({ status: 404 });
  });

  it("fails when the database is missing or the query errors", async () => {
    await expect(
      load({
        ...request(undefined),
        platform: {},
      })
    ).rejects.toMatchObject({ status: 500 });

    await expect(
      load({
        ...request(undefined),
        platform: mockPlatform(rows(1), { fail: true }),
      })
    ).rejects.toMatchObject({ status: 500 });
  });
});
