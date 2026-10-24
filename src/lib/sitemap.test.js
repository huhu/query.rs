import { describe, expect, it } from "vitest";
import { renderSitemap } from "./sitemap.js";

describe("sitemap", () => {
  it("includes static pages and post urls", () => {
    const xml = renderSitemap([
      {
        postId: "1d6d0ng",
        title: "The Borrow Checker Within",
        createdAt: "2024-06-02T15:20:03",
      },
      { postId: "a&b", title: "Ignored", createdAt: "not-a-date" },
    ]);

    expect(xml).toContain("https://query.rs/</loc>");
    expect(xml).toContain("https://query.rs/reddit");
    expect(xml).toContain("https://query.rs/about");
    expect(xml).toContain(
      "https://query.rs/posts/2024-06-02/1d6d0ng/the-borrow-checker-within"
    );
    expect(xml).toContain("<lastmod>2024-06-02</lastmod>");
    expect(xml).not.toContain("a%26b");
    expect(xml).not.toContain("Ignored");
    expect(xml).not.toContain("<lastmod></lastmod>");
    expect(xml).not.toContain("not-a-date");
  });
});
