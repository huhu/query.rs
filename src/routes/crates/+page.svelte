<script>
  import { browser } from "$app/environment";
  import { Statistics, CrateDocManager, Compat } from "querylib";
  import { searchCrates } from "querylib/utils";
  import { onMount } from "svelte";
  import toast, { Toaster } from "svelte-french-toast";

  /**
   * @type {string}
   */
  let searchKeyword;
  /**
   * @type {{ name: string; max_stable_version: string; description: string; } | null}
   */
  let selectedCrate = null;
  /**
   * @type {{ name: string; max_stable_version: string; description: string; }[]}
   */
  let searchResults = [];
  /**
   * @type {any[]}
   */
  let localCrates = [];
  let orderBy = "time";
  /**
   * @type {String}
   */
  let usageSize = "0";
  /**
   * @type {{ [x: string]: any; }}
   */
  let cratesData = {};

  let selectedIndex = -1;
  /**
   * @type {NodeJS.Timeout | undefined}
   */
  let searchTimeout;

  /**
   * @param {Function} func
   * @param {number} delay
   * @returns {Function}
   */
  function debounce(func, delay) {
    /**
     * @param {any[]} args
     */
    return (...args) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => func(...args), delay);
    };
  }

  const debouncedSearchCrates = debounce(async () => {
    if (searchKeyword.length < 1) {
      searchResults = [];
      selectedIndex = -1;
      return;
    }
    selectedIndex = -1;
    searchResults = (await searchCrates(searchKeyword)).slice(0, 8);
  }, 200);

  function handleInput() {
    debouncedSearchCrates();
  }

  $: if (browser && localCrates.length >= 0) {
    let keys = Object.keys(localStorage);
    if (keys.length > 0) {
      let size = Object.keys(localStorage)
        .map((k) => ((localStorage.getItem(k) ?? "").length * 2) / 1024 / 1024)
        .reduce((a, b) => a + b);
      usageSize = `${Math.round(size * 100) / 100} MB`;
    } else {
      usageSize = "0 MB";
    }
  }

  $: {
    if (orderBy === "time") {
      localCrates.sort((a, b) => b.time - a.time);
    } else if (orderBy === "alphanumeric") {
      localCrates.sort((a, b) => a.name.localeCompare(b.name));
    } else if (orderBy === "searches") {
      localCrates.sort((a, b) => b.searchs - a.searchs);
    }
    localCrates = localCrates;
  }

  /**
   * @param {string} name
   */
  async function removeCrate(name) {
    await CrateDocManager.removeCrate(name);
    localCrates = await getLocalCrates();
  }

  /**
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (searchResults.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedIndex = (selectedIndex + 1) % searchResults.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedIndex =
        (selectedIndex - 1 + searchResults.length) % searchResults.length;
    } else if (event.key === "Enter" && selectedIndex !== -1) {
      event.preventDefault();
      selectCrate(searchResults[selectedIndex]);
    }
    searchKeyword = searchResults[selectedIndex].name;
  }

  /**
   * @param {{ name: string; max_stable_version: string; description: string; }} crate
   */
  async function selectCrate(crate) {
    if (!crate.name) {
      toast.error("Please input crate name");
      return;
    }

    if (crate.name in (await CrateDocManager.getCrates())) {
      toast.error(`Crate ${crate.name} already exists`);
      return;
    }

    selectedCrate = crate;
    searchResults = [];
    let toastId = toast("Loading crate...", {
      icon: "👏",
    });
    console.log(toastId);

    try {
      let response = await fetch(
        `https://query.rs/index/${crate.name}/${crate.max_stable_version}`
      );
      toast.dismiss(toastId);

      let data = await response.json();
      if (response.status !== 200) {
        toast.error(data.error);
        return;
      }

      await CrateDocManager.addCrate(data);
      localCrates = await getLocalCrates();
      toast.success(`Crate ${crate.name} added`);
      searchKeyword = "";
      selectedCrate = null;
    } catch (e) {
      toast.dismiss(toastId);
      toast.error(e.message);
    }
  }

  async function getLocalCrates() {
    let crates = Object.entries(await CrateDocManager.getCrates()).map(
      ([name, crate]) => {
        return {
          name,
          searchs: cratesData[name] || 0,
          formatedTime: Compat.normalizeDate(new Date(crate.time)),
          ...crate,
        };
      }
    );
    return crates;
  }

  onMount(async () => {
    localCrates = await getLocalCrates();
    const { timeline } = await Statistics.load();
    cratesData = timeline.reduce((pre, [_time, _type, crate]) => {
      if (crate) {
        pre[crate] = (pre[crate] || 0) + 1;
      }
      return pre;
    }, Object.create(null));
  });
</script>

<Toaster />
<div
  class="text-center text-sm max-w-screen-md mx-auto px-4 dark:text-darkTextPrimary"
>
  You can add the crate you search most to local, this allows you to search that
  crate's docs via <code class="text-[#f9bb2d]">@crate-name keyword</code>, for
  example:
  <a
    href="https://query.rs/?q=@tokio%20spawn"
    class="dark:text-darkTextPrimary">@tokio spawn</a
  >
</div>
<div
  class="my-8 mb-16 flex flex-col items-center md:flex-row md:justify-center md:items-center"
>
  <div class="relative w-full md:w-[420px]">
    <input
      bind:value={searchKeyword}
      on:input={handleInput}
      on:keydown={handleKeydown}
      autofocus
      type="text"
      class="w-full h-8 px-2 py-0 rounded border border-solid border-[#f9bb2daa] focus:outline-none"
    />
    {#if searchResults.length > 0}
      <ul
        class="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg"
      >
        {#each searchResults as crate, index}
          <li
            class="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            class:bg-gray-100={index === selectedIndex}
          >
            <button
              on:click={async () => await selectCrate(crate)}
              class="w-full text-left"
            >
              <div class="flex items-center">
                <span class="font-bold truncate mr-2">{crate.name}</span>
                <span class="truncate flex-1"
                  >v{crate.max_stable_version} - {crate.description}</span
                >
              </div>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
<div class="subtext flex justify-between my-4 dark:text-darkTextPrimary">
  <span>
    You have indexed <span>{localCrates.length}</span>
    {localCrates.length > 0 ? "crates" : "crate"}, disk usage:
    <span>{usageSize}</span>
    /10 MB
  </span>
  <span>
    Sort by:
    <select bind:value={orderBy} class="border dark:bg-darkBgPrimary">
      <option value="time">Indexed time</option>
      <option value="alphanumeric">Alphanumeric</option>
      <option value="searches">Searches</option>
    </select>
  </span>
</div>
<ul class="text">
  {#each localCrates as crate}
    <li class="crate-list-item" style="padding: 15px;">
      <div class="flex flex-col">
        <div>
          <b class="subtitle-text">{crate.crateName || crate.name}</b>
          <span class="crate-attr">v{crate.version}</span>
          <a
            class="crate-attr"
            href="https://crates.io/crates/{crate.crateName || crate.name}"
            target="_blank"
          >
            crates.io
          </a>
          <a
            class="crate-attr"
            href="https://docs.rs/{crate.crateName || crate.name}"
            target="_blank"
          >
            docs.rs
          </a>
        </div>
        <div class="crate-desc">{crate.doc}</div>
        <div class="crate-extra subtext">
          <b>{crate.searchs}</b>
          {crate.searchs > 0 ? "searches" : "search"} since
          <span>{crate.formatedTime}</span>
        </div>
      </div>
      <button
        class="btn-remove"
        on:click={async () => await removeCrate(crate.name)}
      >
        Remove
      </button>
    </li>
  {/each}
</ul>
