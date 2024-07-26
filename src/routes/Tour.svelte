<script>
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { pushState } from "$app/navigation";

  const helpTips = [
    {
      type: "Docs",
      color: "#f2b9ebaa",
      tips: [
        {
          title: "Search stable std docs",
          queries: ["option", "fn:find", "trait:Iterator"],
        },
        {
          title: "Search nightly std docs",
          queries: ["/async", "/pin"],
        },
        {
          title: "Search attributes",
          queries: ["#", "#cfg", "#derive"],
        },
        {
          title:
            "Search docs by type signature, <a href='https://doc.rust-lang.org/1.79.0/rustdoc/read-documentation/search.html'>full search features</a>",
          queries: ["vec -> usize", "[] -> bool"],
        },
      ],
    },
    {
      type: "Crates",
      color: "#f7927b7d",
      tips: [
        {
          title: "Search top 20K crates",
          queries: ["!", "!tokio", "!axum"],
        },
        {
          title: "Search crates.io/lib.rs",
          queries: ["!!", "!!sqlx", "!!reqwest"],
        },
        {
          title: "<a href='/crates'>Add crate</a> to search docs",
          queries: ["@tokio spawn", "@tokio int -> bool"],
        },
        {
          title: "Search added crates's docs",
          queries: ["~spawn", "~str -> vec"],
        },
      ],
    },
    {
      type: "Others",
      color: "#8bbdf494",
      tips: [
        {
          title: "Search error code",
          queries: ["e0038"],
        },
        {
          title: "Search rust books",
          queries: ["%", "%pin", "%error"],
        },
        {
          title: "Search clippy lints",
          queries: [">", ">if_let", ">try"],
        },
        {
          title: "Search caniuse",
          queries: ["?", "?const", "?slice"],
        },
        {
          title: "Query parameters: <a href='/?q=cell' target='_blank'>?q=cell</a>",
          queries: [],
        },
      ],
    },
    {
      type: "Misc",
      color: "#86e7f1a1",
      tips: [
        {
          title: "Commands",
          queries: [
            ":",
            ":help",
            ":book",
            ":cargo",
            ":stable",
            ":tool",
            ":yet",
          ],
        },
        {
          title:
            "<b><code>Ctrl</code> + <code>n</code></b> / <b><code>p</code></b> or append <b>-</b> to page down/up",
          queries: ["entry -", "!tokio --"],
        },
        {
          title:
            "<b><code>Ctrl</code> + <code>j</code></b> / <b><code>k</code></b> to move selection down/up",
          queries: [],
        },
        {
          title:
            "<b><code>ALT</code> + <code>Enter</code></b> to open in the new tab",
          queries: [],
        },
      ],
    },
  ];

  /**
   * @type {string|null}
   */
  let currentQuery;

  $: if (browser) {
    if ($page.state.q && $page.state.q !== currentQuery) {
      currentQuery = $page.state.q;
    }
    triggerQuery(currentQuery);
  }

  /**
   * @param {string|null} [query]
   */
  export function triggerQuery(query) {
    let omniboxInput = document.querySelector(".omn-input");
    if (query && omniboxInput) {
      setTimeout(async () => {
        omniboxInput.value = query;
        omniboxInput.dispatchEvent(new Event("input"));
      });
    }
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 md:mt-16">
  {#each helpTips as { type, color, tips }}
    <div class="rounded border m-2">
      <div class="px-4 text-base font-bold" style:background-color={color}>
        {type}
      </div>
      <ul class="px-5 p-2 text-sm list-disc list-outside">
        {#each tips as tip, index}
          <li class="py-1">
            <div>{@html tip.title}</div>
            <div>
              {#each tip.queries as q}
                <button
                  class="rounded hover:!bg-[#f9bc2d59] px-1 text-xs mr-1"
                  style:background-color={color}
                  on:click={() => pushState("", { q })}
                >
                  <code>{q}</code>
                </button>
              {/each}
              {#if index === 0}
                <span class="relative inline-flex h-3 w-3">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f9bb2d] opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-3 w-3 bg-[#f9bc2d46]"
                  ></span>
                </span>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>
