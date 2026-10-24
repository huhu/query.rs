import { describe, expect, it } from "vitest";
import { GET as listPosts } from "./+server.js";
import { GET as searchPosts } from "./search/+server.js";

/**
 * @param {object[]} rows
 */
function platform(rows) {
  return {
    env: {
      DB: {
        prepare(sql) {
          return {
            bind() {
              return {
                async all() {
                  return { results: rows, sql };
                },
              };
            },
          };
        },
      },
    },
  };
}

describe("posts JSON API", () => {
  it("still returns raw rows for a date range", async () => {
    const response = await listPosts({
      url: new URL("https://query.rs/posts?start=2024-06-02&end=2024-06-03"),
      platform: platform([{ postId: "img1234", title: "A crab", url: "https://i.redd.it/a.png" }]),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/json");
    const body = await response.json();
    expect(body).toEqual([{ postId: "img1234", title: "A crab", url: "https://i.redd.it/a.png" }]);
  });

  it("still requires start and end", async () => {
    const response = await listPosts({
      url: new URL("https://query.rs/posts?start=2024-06-02"),
      platform: platform([]),
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Both start and end date parameters are required",
    });
  });

  it("still searches titles and returns raw JSON", async () => {
    const response = await searchPosts({
      url: new URL("https://query.rs/posts/search?q=borrow"),
      platform: platform([{ postId: "1d6d0ng", title: "The Borrow Checker Within" }]),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { postId: "1d6d0ng", title: "The Borrow Checker Within" },
    ]);
  });
});
