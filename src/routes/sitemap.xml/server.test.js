import { describe, expect, it } from "vitest";
import { GET, prerender } from "./+server.js";

describe("sitemap endpoint", () => {
  it("is rendered on demand from D1", async () => {
    expect(prerender).toBe(false);

    let calls = 0;
    const response = await GET({
      platform: {
        env: {
          DB: {
            prepare() {
              return {
                bind() {
                  return {
                    async all() {
                      calls += 1;
                      if (calls > 1) return { results: [] };
                      return {
                        results: [
                          { postId: "abc123", createdAt: "2024-01-02T03:04:05" },
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
    expect(xml).toContain("https://query.rs/posts/abc123");
    expect(xml).toContain("<lastmod>2024-01-02</lastmod>");
    expect(calls).toBe(1);
  });

  it("still lists static pages when the database is unavailable", async () => {
    const response = await GET({ platform: {} });
    const xml = await response.text();
    expect(response.status).toBe(200);
    expect(xml).toContain("https://query.rs/reddit");
    expect(xml).not.toContain("/posts/");
  });
});
