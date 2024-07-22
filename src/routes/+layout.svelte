<script>
  import { onMount } from "svelte";
  import { storage, Statistics, CrateDocManager } from "querylib";
  import "../app.css";

  let hiddenMenu = true;
  const menus = [
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
    if ((await storage.getItem("first-visit")) !== "false") {
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

      let response = await fetch("https://crates.io/api/v1/crates/tokio");
      let data = await response.json();
      response = await fetch(
        `https://query.rs/index/${data.crate.name}/${data.crate.newest_version}`
      );
      data = await response.json();
      await CrateDocManager.addCrate(data);
      await storage.setItem("first-visit", "false");
    }
  });
</script>

<div class="flex-layout" style="flex-direction: column;">
  <div class="max-w-[1160px] w-full flex flex-col">
    <ul
      class="hidden list-none flex-row overflow-auto md:flex self-end py-5 text-base md:text-xl"
    >
      {#each menus as menu}
        <li class="px-5 rounded-md hover:bg-[#f9bc2d46]">
          <a href={menu.path}>{menu.name}</a>
        </li>
      {/each}
    </ul>
    <div>
      <div class="flex flex-row justify-between items-center md:hidden">
        <img
          src="/assets/logo.svg"
          alt="logo"
          class="w-24 mx-6 transition-opacity ease-in-out delay-300 duration-1000"
          class:opacity-0={hiddenMenu}
          class:opacity-100={!hiddenMenu}
        />
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
      </div>
      <div
        on:click={() => (hiddenMenu = true)}
        aria-readonly="true"
        class="transition ease-in-out duration-700 z-10 right-0 text-left list-none absolute flex-col target:flex shadow-md text-base bg-[#fcfaf6] rounded-md w-full"
        class:-translate-y-72={hiddenMenu}
        class:translate-y-0={!hiddenMenu}
      >
        {#each menus as menu}
          <a class="p-3 px-6 block" href={menu.path}>{menu.name}</a>
        {/each}
      </div>
    </div>
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
      <slot />
    </div>
  </div>
  <footer class="pb-6 text-center px-4">
    © 2024 Query.rs, built by
    <a href="https://github.com/folyd" target="_blank">Folyd</a>
    with ❤️❤️, see <a href="/about">about</a> page to learn more.
  </footer>
</div>
