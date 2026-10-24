import { describe, expect, it } from "vitest";
import { GET, prerender } from "./+server.js";

const row = {
  postId: "1d6d0ng",
  score: 351,
  title: "The Borrow Checker Within",
  selftext: "",
  author: "burntsushi",
  permalink: "/r/rust/comments/1d6d0ng/the_borrow_checker_within/",
  url: "https://smallcultfollowing.com/babysteps/blog/2024/06/02/the-borrow-checker-within/",
  createdAt: "2024-06-02T15:20:03",
  numComments: null,
};

describe("legacy post id redirect", () => {
  it("301s /posts/{postId} to the dated slug path", async () => {
    expect(prerender).toBe(false);
    await expect(
      GET({
        params: { id: "1D6D0NG" },
        platform: {
          env: {
            DB: {
              prepare() {
                return {
                  bind(id) {
                    return {
                      async first() {
                        return id === row.postId ? row : null;
                      },
                    };
                  },
                };
              },
            },
          },
        },
      })
    ).rejects.toMatchObject({
      status: 301,
      location:
        "/posts/2024-06-02/1d6d0ng/the-borrow-checker-within",
    });
  });
});
