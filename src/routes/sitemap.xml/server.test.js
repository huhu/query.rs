import { describe, expect, it } from "vitest";
import { GET, prerender } from "./+server.js";

describe("sitemap endpoint", () => {
  it("is rendered on demand from D1", async () => {
    expect(prerender).toBe(false);

    let calls = 0;
    /** @type {string[]} */
    const sql = [];
    const response = await GET({
      platform: {
        env: {
          DB: {
            prepare(statement) {
              sql.push(statement);
              return {
                bind() {
                  return {
                    async first() {
                      return { total: 1 };
                    },
                    async all() {
                      calls += 1;
                      if (calls > 1) return { results: [] };
                      return {
                        results: [
                          {
                            postId: "abc123",
                            title: "Hello World",
                            createdAt: "2024-01-02T03:04:05",
                          },
                        ],
                      };
                    },
                  };
                },
              };
            },
          },
        },
      },
    });

    const xml = await response.text();
    expect(response.headers.get("content-type")).toContain("application/xml");
    expect(xml).toContain("https://query.rs/posts/archive</loc>");
    expect(xml).toContain(
      "https://query.rs/posts/2024-01-02/abc123/hello-world"
    );
    expect(xml).toContain("<lastmod>2024-01-02</lastmod>");
    expect(calls).toBe(1);
    expect(sql.some((statement) => statement.includes("postId DESC"))).toBe(true);
    expect(sql.filter((statement) => statement.includes("CHAR(92)"))).toHaveLength(2);
    expect(response.headers.get("cache-control")).toContain("max-age=60");
  });

  it("lists static pages when the database is empty", async () => {
    const response = await GET({
      platform: {
        env: {
          DB: {
            prepare() {
              return {
                bind() {
                  return {
                    async first() {
                      return { total: 0 };
                    },
                    async all() {
                      return { results: [] };
                    },
                  };
                },
              };
            },
          },
        },
      },
    });
    const xml = await response.text();
    expect(response.status).toBe(200);
    expect(xml).toContain("https://query.rs/reddit");
    expect(xml).toContain("https://query.rs/posts/archive</loc>");
    expect(response.headers.get("cache-control")).toContain("public");
  });

  it("does not cache a sitemap when D1 is missing or the query fails", async () => {
    const missing = await GET({ platform: {} });
    expect(missing.status).toBe(500);
    expect(missing.headers.get("cache-control")).toContain("no-store");
    expect(await missing.text()).not.toContain("<urlset");

    const failed = await GET({
      platform: {
        env: {
          DB: {
            prepare() {
              return {
                bind() {
                  return {
                    async first() {
                      return { total: 5 };
                    },
                    async all() {
                      throw new Error("d1 down");
                    },
                  };
                },
              };
            },
          },
        },
      },
    });
    expect(failed.status).toBe(500);
    expect(failed.headers.get("cache-control")).toBe("no-store");
    expect(await failed.text()).not.toContain("https://query.rs/posts/");
  });
});
