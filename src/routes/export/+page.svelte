<script>
  import { Compat } from "omnibox-js";
  import {
    storage,
    settings,
    CrateDocManager,
    Statistics,
  } from "$lib/index.js";
  import { onMount } from "svelte";

  /**
   * @param {string} item
   * @returns {string}
   */
  function formatItem(item) {
    if (!item) return item; // Return the string as is if it's empty or null
    let capitalizedItem = item.charAt(0).toUpperCase() + item.slice(1);
    return capitalizedItem.replace("-", " ");
  }

  function onExport() {}

  function onImport() {}
  onMount(async () => {});
</script>

<div class="setting-group">
  <div class="title-text">Export</div>
  <div class="text">
    <div>Export following data to JSON file:</div>
    <br />
    {#each ["settings", "search-history", "search-statistics", "crates"] as item}
      <div class="setting-item">
        <div>
          <label class="toggle">
            <input type="checkbox" class={item} checked />
            <span class="slider"></span>
          </label>
          {formatItem(item)}
        </div>
      </div>
    {/each}
    <div class="btn btn-primary btn-export" on:click={onExport}>Export</div>
  </div>
</div>
<div class="setting-group">
  <div class="title-text">Import</div>
  <div class="text">
    <div>Import from local JSON file:</div>
    <br />
    <input class="file-selector text" type="file" accept="application/json" />
    {#each ["settings", "search-history", "search-statistics", "crates"] as item}
      <div class="setting-item">
        <div>
          <label class="toggle">
            <input type="checkbox" class={item} checked />
            <span class="slider"></span>
          </label>
          {formatItem(item)}
        </div>
      </div>
    {/each}
    <div class="btn btn-secondary btn-import" on:click={onImport}>Import</div>
  </div>
</div>
