<script>
  import { settings } from "$lib/index.js";
  import { onMount } from "svelte";

  onMount(async () => {
    const autoUpdateCheckbox = document.getElementById("auto-update");
    if (autoUpdateCheckbox) {
      autoUpdateCheckbox.checked = await settings.autoUpdate;
      autoUpdateCheckbox.onchange = async function (event) {
        settings.autoUpdate = event.target.checked;
      };
    }

    const showMacroRailroad = document.getElementById("show-macro-railroad");
    if (showMacroRailroad) {
      showMacroRailroad.checked = await settings.showMacroRailroad;
      showMacroRailroad.onchange = async function (event) {
        settings.showMacroRailroad = event.target.checked;
      };
    }

    const keepCratesUpToDate = document.getElementById(
      "keep-crates-up-to-date"
    );
    if (keepCratesUpToDate) {
      keepCratesUpToDate.checked = await settings.keepCratesUpToDate;
      keepCratesUpToDate.onchange = async function (event) {
        settings.keepCratesUpToDate = event.target.checked;
      };
    }
  });
</script>

<div class="setting-item">
  <div>
    Enable auto update
    <span
      aria-label="Whether auto opens the index update page when the browser launch (default false). At any time, you can use the ':update' command to sync the latest index."
      data-balloon-pos="up"
      data-balloon-length="large"
      style="vertical-align: middle"
    >
      <img
        style="vertical-align: middle;width: 15px;margin-right: 5px;"
        src="../assets/info.svg"
        alt="info"
      />
    </span>
    <label class="toggle">
      <input type="checkbox" id="auto-update" />
      <span class="slider"></span>
    </label>
  </div>
</div>
