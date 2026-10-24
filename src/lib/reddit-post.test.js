import { describe, expect, it } from "vitest";
import {
  externalUrl,
  formatTitle,
  isPostId,
  metaDescription,
  postCanonical,
  postPath,
  renderMarkdown,
  slugifyTitle,
} from "./reddit-post.js";

function postDateFallback() {
  return postPath({ postId: "abc", title: "   ", createdAt: "nope" });
}

describe("reddit post helpers", () => {
  it("accepts reddit base36 ids", () => {
    expect(isPostId("1d6d0ng")).toBe(true);
    expect(isPostId("search")).toBe(true);
    expect(isPostId("../etc")).toBe(false);
    expect(isPostId("has space")).toBe(false);
    expect(isPostId("")).toBe(false);
  });

  it("builds a dated slug path and falls back when the title is empty", () => {
    expect(
      postCanonical({
        postId: "1D6D0NG",
        title: "The Borrow Checker Within",
        createdAt: "2024-06-02T15:20:03",
      })
    ).toBe(
      "https://query.rs/posts/2024-06-02/1d6d0ng/the-borrow-checker-within"
    );

    expect(
      postPath({
        postId: "abc",
        title: "[Media] Don't stop & Café!!",
        createdAt: "2024-06-02 15:20:03",
      })
    ).toBe("/posts/2024-06-02/abc/dont-stop-and-cafe");

    expect(slugifyTitle("")).toBe("post");
    expect(slugifyTitle("你好")).toBe("post");
    expect(slugifyTitle("A".repeat(200))).toHaveLength(80);
    expect(postDateFallback()).toBe("/posts/1970-01-01/abc/post");
  });

  it("decodes stored titles and marks media posts", () => {
    expect(
      formatTitle({
        title: "A \\\"quote\\\" &amp; more",
        url: "https://i.redd.it/example.png",
      })
    ).toBe('[Media] A "quote" & more');
  });

  it("renders selftext and strips unsafe html and urls", () => {
    const html = renderMarkdown(
      "Hello\\n\\n<script>alert(1)</script>\\n\\n[ok](https://example.com/?a=1&b=2)\\n\\n[bad](javascript:alert(1))\\n\\n[ws](java\\nscript:alert(1))"
    );

    expect(html).toContain("<p>");
    expect(html).toContain("Hello");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain('href="https://example.com/?a=1&amp;b=2"');
    expect(html).not.toContain("javascript:");
    expect(html).toContain("bad");
    expect(html).not.toContain(">bad</a>");
    expect(html).not.toContain(">ws</a>");
    expect(html).toContain("ws");
  });

  it("describes text posts from the body and link posts from the title", () => {
    const body = metaDescription({
      title: "Short",
      selftext:
        "I've written plenty of c++ for work and other projects. I still forget how CMake works every dawn time.",
    });
    expect(body.startsWith("I've written plenty of c++")).toBe(true);
    expect(body.length).toBeLessThanOrEqual(160);

    const withScript = metaDescription({
      title: "Short",
      selftext:
        "I've written plenty of c++ for work and other projects before.\\n\\n<script>alert(1)</script>\\n\\nLife is great and the borrow checker is kind.",
    });
    expect(withScript).not.toContain("alert");
    expect(withScript).toContain("Life is great");

    const link = metaDescription({
      title: "The Borrow Checker Within",
      url: "https://example.com/post",
      selftext: "",
    });
    expect(link).toContain("The Borrow Checker Within");
    expect(link).toContain("Query.rs");
  });

  it("rejects non-http external urls", () => {
    expect(externalUrl("javascript:alert(1)")).toBe("");
    expect(externalUrl("https://www.reddit.com/r/rust")).toBe("");
    expect(externalUrl("https://blog.rust-lang.org/release")).toBe(
      "https://blog.rust-lang.org/release"
    );
  });
});
