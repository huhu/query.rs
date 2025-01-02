<script>
  import { onMount } from "svelte";
  import { storage, Statistics, CrateDocManager } from "querylib";
  import "../../app.css";

  let hiddenMenu = true;
  const searchMenus = [
    {
      name: "Home",
      path: "/",
    },
    {
      name: "Crates",
      path: "/crates",
    },
    {
      name: "Stats",
      path: "/stats",
    },
    {
      name: "Settings",
      path: "/settings",
    },
  ];

  onMount(async () => {
    let firstVisit = await storage.getItem("first-visit");
    if (firstVisit === null) {
      let response = await fetch("https://crates.io/api/v1/crates/tokio");
      let data = await response.json();
      response = await fetch(
        `https://query.rs/index/${data.crate.name}/${data.crate.newest_version}`
      );
      data = await response.json();
      await CrateDocManager.addCrate(data);

      // Create first query record
      let statistics = await Statistics.load();
      await statistics.record(
        {
          query: "hi",
          content: "https://query.rs",
          description: "Welcome to query.rs",
          time: Date.now(),
        },
        true
      );
      await storage.setItem("first-visit", "false");
    }
  });
</script>

<div
  class="box-border px-4 py-12 md:px-12 md:py-24 bg-[white] relative rounded-[10px] mb-[50px] min-h-[calc(100vh_-_180px)]"
>
  <a href="/" class="no-underline hover:no-underline">
    <img
      src="/assets/logo.svg"
      alt="logo"
      class="block mx-auto w-60 md:w-80 mt-8 mb-12"
    />
  </a>
  <div class="absolute top-2 right-2">
    <button
      on:click={() => (hiddenMenu = !hiddenMenu)}
      class="z-50 p-4 inline-block"
    >
      <svg
        class="w-5 h-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 17 14"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M1 1h15M1 7h15M1 13h15"
        />
      </svg>
    </button>
    <div
      class="absolute top-12 right-4 z-50 bg-[#fcfaf6] rounded-md shadow-md"
      on:click={() => (hiddenMenu = true)}
      class:hidden={hiddenMenu}
    >
      {#each searchMenus as menu}
        <a class="p-3 px-6 block hover:bg-[#f9bc2d46]" href={menu.path}
          >{menu.name}</a
        >
      {/each}
    </div>
  </div>
  <slot />
</div>
