<script>
  import { browser } from "$app/environment";
  import { Statistics, CrateDocManager } from "$lib/index.js";
  import { Compat } from "omnibox-js";
  import { onMount } from "svelte";

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
    let size = Object.keys(localStorage)
      .map((k) => ((localStorage.getItem(k) ?? "").length * 2) / 1024 / 1024)
      .reduce((a, b) => a + b);
    usageSize = `${Math.round(size * 100) / 100} MB`;
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
      // new Toast(".toast").info("Please input crate name");
      return;
    }

    if (searchCrate in crates) {
      // new Toast(".toast").info(`Crate \`${crate}\` already exists`);
      return;
    }

    let response = await fetch(
      `https://crates.io/api/v1/crates/${searchCrate}`
    );
    if (response.status !== 200) {
      // new Toast(".toast").info(`Crate \`${crate}\` not found`);
      return;
    }

    try {
      let data = await response.json();
      response = await fetch(
        `https://query.rs/index/${data.crate.name}/${data.crate.newest_version}`
      );
      if (response.status !== 200) {
        let data = await response.json();
        // new Toast(".toast").info(data.error);
        return;
      }

      data = await response.json();
      await CrateDocManager.addCrate(data);
      crates = await getCrates();
    } catch (e) {
      //   new Toast(".toast").info(e.message);
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

<div
  style="position:relative;text-align:center;margin:20px;margin-bottom:60px;"
>
  <input
    id="crate-name"
    bind:value={searchCrate}
    type="text"
    style="width:400px;height:32px;padding:0 12px;border-radius:10px;border:1px solid #f9bb2daa;"
  />
  <span class="btn btn-primary" on:click={addCrate}> Add crate </span>
  <div class="toast"></div>
</div>
<div class="subtitle-text crate-list-filter">
  <span>
    You have indexed <span>{crates.length}</span> crate(s), disk usage:
    <span>{usageSize}</span>
    /10 MB
  </span>
  <span>
    Sort by:
    <select bind:value={orderBy}>
      <option value="time">Indexed time</option>
      <option value="alphanumeric">Alphanumeric</option>
      <option value="searches">Searches</option>
    </select>
  </span>
</div>
<ul class="text">
  {#each crates as crate}
    <li class="crate-list-item" style="padding: 15px;">
      <div style="display: flex; flex-direction: column;">
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
      <span
        class="btn-remove"
        on:click={async () => await removeCrate(crate.name)}>Remove</span
      >
    </li>
  {/each}
</ul>
