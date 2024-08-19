<script>
  import { browser } from "$app/environment";
  import { Statistics, CrateDocManager, Compat } from "querylib";
  import { onMount } from "svelte";
  import toast, { Toaster } from "svelte-french-toast";

  /**
   * @type {string}
   */
  let searchCrate;
  /**
   * @type {any[]}
   */
  let crates = [];
  let orderBy = "time";
  /**
   * @type {String}
   */
  let usageSize = "0";
  /**
   * @type {{ [x: string]: any; }}
   */
  let cratesData = {};

  $: if (browser && crates.length >= 0) {
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
      crates.sort((a, b) => b.time - a.time);
    } else if (orderBy === "alphanumeric") {
      crates.sort((a, b) => a.name.localeCompare(b.name));
    } else if (orderBy === "searches") {
      crates.sort((a, b) => b.searchs - a.searchs);
    }
    crates = crates;
  }

  /**
   * @param {string} name
   */
  async function removeCrate(name) {
    await CrateDocManager.removeCrate(name);
    crates = await getCrates();
  }

  async function addCrate() {
    if (!searchCrate) {
      toast.error("Please input crate name");
      return;
    }

    if (searchCrate in (await CrateDocManager.getCrates())) {
      toast.error(`Crate ${searchCrate} already exists`);
      return;
    }

    let toastId = toast("Loading crate...", {
      icon: "👏",
    });
    console.log(toastId);
    let response = await fetch(
      `https://crates.io/api/v1/crates/${searchCrate}`
    );
    if (response.status !== 200) {
      toast.dismiss(toastId);
      toast.error(`Crate ${searchCrate} not found`);
      return;
    }

    try {
      let data = await response.json();
      response = await fetch(
        `https://query.rs/index/${data.crate.name}/${data.crate.newest_version}`
      );
      toast.dismiss(toastId);

      data = await response.json();
      if (response.status !== 200) {
        toast.error(data.error);
        return;
      }

      await CrateDocManager.addCrate(data);
      crates = await getCrates();
      toast.success(`Crate ${searchCrate} added`);
      searchCrate = "";
    } catch (e) {
      toast.dismiss(toastId);
      toast.error(e.message);
    }
  }

  async function getCrates() {
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

  /**
   * @param {{ key: string; }} event
   */
  async function handleKeydown(event) {
    if (event.key === "Enter" && searchCrate) {
      await addCrate();
    }
  }

  onMount(async () => {
    crates = await getCrates();
    const { timeline } = await Statistics.load();
    cratesData = timeline.reduce((pre, [_time, _type, crate]) => {
      if (crate) {
        pre[crate] = (pre[crate] || 0) + 1;
      }
      return pre;
    }, Object.create(null));
  });
</script>

<svelte:window on:keydown={handleKeydown} />
<Toaster />
<div class="text-center text-sm max-w-screen-md mx-auto px-4">
  You can add the crate you search most to local, this allows you to search that
  crate's docs via <code class="text-[#f9bb2d]">@crate-name keyword</code>, for
  example: <a href="https://query.rs/?q=@tokio%20spawn">@tokio spawn</a>
</div>
<div
  class="m-8 mb-16 flex flex-col items-center md:flex-row md:justify-center md:items-center"
>
  <input
    bind:value={searchCrate}
    autofocus
    type="text"
    class="w-full md:w-[400px] h-8 px-2 py-0 rounded border border-solid border-[#f9bb2daa] focus:outline-none"
  />
  <button class="btn btn-primary m-4" on:click={addCrate}> Add crate </button>
</div>
<div class="subtext flex justify-between my-4">
  <span>
    You have indexed <span>{crates.length}</span>
    {crates.length > 0 ? "crates" : "crate"}, disk usage:
    <span>{usageSize}</span>
    /10 MB
  </span>
  <span>
    Sort by:
    <select bind:value={orderBy} class="border">
      <option value="time">Indexed time</option>
      <option value="alphanumeric">Alphanumeric</option>
      <option value="searches">Searches</option>
    </select>
  </span>
</div>
<ul class="text">
  {#each crates as crate}
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
