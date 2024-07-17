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
          queries: ["#cfg", "#derive"],
        },
        {
          title: "Offline mode <a href='/settings'>supported</a>",
          queries: [],
        },
      ],
    },
    {
      type: "Crates",
      color: "#f7927b7d",
      tips: [
        {
          title: "Search top 20K crates",
          queries: ["!tokio", "!axum"],
        },
        {
          title: "Search crates.io/lib.rs",
          queries: ["!!sqlx", "!!reqwest"],
        },
        {
          title: "<a href='/crates'>Add crate</a> to search docs",
          queries: ["@tokio spawn", "@axum route"],
        },
        {
          title: "Search added crates's docs",
          queries: ["~spawn"],
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
          queries: ["%pin", "%error"],
        },
        {
          title: "Search clippy lints",
          queries: [">if_let", ">try"],
        },
        {
          title: "Search caniuse",
          queries: ["?const", "?slice"],
        },
      ],
    },
    {
      type: "Misc",
      color: "#86e7f1a1",
      tips: [
        {
          title: "Commands",
          queries: [":", ":help", ":book", ":cargo", ":stable"],
        },
        {
          title: "Append '-' for pagination",
          queries: ["entry -", "fn:search --"],
        },
        {
          title:
            "<a href='/stats'>Search statistics</>, <a href='/crates'>Crate manage</a>, <a href='/settings'>Import/export</a>",
          queries: [],
        },
        {
          title:
            "See also <a href='https://rust.extension.sh'>rust.extension.sh</a>",
          queries: [],
        },
      ],
    },
  ];

  /**
   * @type {string|null}
   */
  let currentQuery = $page.url.searchParams.get("q");

  $: if (browser) {
    if ($page.state.q && $page.state.q !== currentQuery) {
      currentQuery = $page.state.q;
    }
    triggerQuery();
  }

  function triggerQuery() {
    let omniboxInput = document.querySelector(".omn-input");
    if (currentQuery && omniboxInput) {
      setTimeout(async () => {
        omniboxInput.value = currentQuery;
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
        {#each tips as tip}
          <li class="py-1">
            <div>{@html tip.title}</div>
            <div>
              {#each tip.queries as q}
                <button
                  class="rounded hover:!bg-[#f9bc2d59] px-1 text-xs mr-1"
                  style:background-color={color}
                  on:click={() => pushState("", { q })}
                >
                  {q}
                </button>
              {/each}
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>
