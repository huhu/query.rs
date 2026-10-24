import { describe, expect, it } from "vitest";
import { load, prerender, ssr } from "./+page.server.js";

const imagePost = {
  postId: "img1234",
  score: 80,
  title: "A crab",
  selftext: "hello **crab**",
  author: "ferris",
  permalink: "/r/rust/comments/img1234/a_crab/",
  url: "https://i.redd.it/crab.png",
  createdAt: "2024-06-03T00:00:00",
  numComments: 3,
};

const textPost = {
  postId: "1d6d0ng",
  score: 351,
  title: "The Borrow Checker Within",
  selftext: "A long note about the borrow checker that should be in the first paint.",
  author: "burntsushi",
  permalink: "/r/rust/comments/1d6d0ng/the_borrow_checker_within/",
  url: "https://example.com/borrow",
  createdAt: "2024-06-02T15:20:03",
  numComments: 12,
};

/**
 * @param {object[]} rows
 * @param {{ fail?: boolean }} [options]
 */
function mockPlatform(rows, options = {}) {
  /** @type {string[]} */
  const sqls = [];
  /** @type {unknown[][]} */
  const binds = [];
  return {
    sqls,
    binds,
    platform: {
      env: {
        DB: {
          prepare(sql) {
            sqls.push(String(sql));
            return {
              bind(...args) {
                binds.push(args);
                return {
                  async all() {
                    if (options.fail) throw new Error("d1 down");
                    return { results: rows };
                  },
                };
              },
            };
          },
        },
      },
    },
  };
}

/**
 * @param {string} path
 */
function request(path) {
  /** @type {Record<string, string>} */
  const headers = {};
  return {
    url: new URL(path, "https://query.rs"),
    headers,
    setHeaders(value) {
      Object.assign(headers, value);
    },
  };
}

describe("reddit reader load", () => {
  it("opts out of prerender and keeps server rendering", () => {
    expect(prerender).toBe(false);
    expect(ssr).toBe(true);
  });

  it("loads today's top posts with the /posts date query", async () => {
    const db = mockPlatform([imagePost, textPost]);
    const event = request("/reddit");
    const data = await load({ ...event, platform: db.platform });

    expect(db.sqls[0]).toContain("date(createdAt) >= date(?)");
    expect(db.sqls[0]).toContain("ORDER BY score DESC");
    const today = new Date().toISOString().slice(0, 10);
    expect(db.binds[0]).toEqual([today, today, 20]);
    expect(data.mode).toBe("date");
    expect(data.query).toBe("");
    expect(data.posts).toHaveLength(2);
    expect(data.posts[0].title).toBe("[Media] A crab");
    expect(data.posts[0].createdAt).toBe("2024-06-03 00:00:00");
    expect(data.posts[0].selftext).toBe(imagePost.selftext);
    expect(data.selectedPost).toBe(data.posts[0]);
    expect(data.headerTitle).toBe("");
    expect(data.error).toBeNull();
    expect(event.headers["cache-control"]).toBe("public, max-age=3600");
  });

  it("server-renders search results when q is set", async () => {
    const db = mockPlatform([textPost]);
    const event = request("/reddit?q=%20borrow%20");
    const data = await load({ ...event, platform: db.platform });

    expect(db.sqls[0]).toContain("title LIKE ?");
    expect(db.binds[0]).toEqual(["%borrow%", 20]);
    expect(data.mode).toBe("search");
    expect(data.query).toBe("borrow");
    expect(data.posts[0].title).toBe("The Borrow Checker Within");
    expect(data.selectedPost?.postId).toBe("1d6d0ng");
    expect(data.headerTitle).toBe('Search Results: "borrow" (1 results)');
  });

  it("does not cache a missing database or a failed query", async () => {
    const missing = request("/reddit");
    const unavailable = await load({ ...missing, platform: {} });
    expect(unavailable.posts).toEqual([]);
    expect(unavailable.error).toBe("Database unavailable");
    expect(missing.headers["cache-control"]).toBe("no-store");

    const failed = request("/reddit?q=rust");
    const db = mockPlatform([], { fail: true });
    const data = await load({ ...failed, platform: db.platform });
    expect(data.posts).toEqual([]);
    expect(data.error).toBe("Could not load posts");
    expect(data.mode).toBe("search");
    expect(failed.headers["cache-control"]).toBe("no-store");
  });
});
