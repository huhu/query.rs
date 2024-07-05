<script>
  import { onMount } from "svelte";
  import { settings } from "$lib/index.js";

  // Get the information about the current platform os.
  // Possible os values: "mac", "win", "android", "cros", "linux", or "openbsd"
  function getPlatformOs() {
    let os = "unknown";
    if (navigator.userAgent.indexOf("Win") != -1) os = "win";
    if (navigator.userAgent.indexOf("Mac") != -1) os = "mac";
    if (navigator.userAgent.indexOf("Linux") != -1) os = "linux";
    return os;
  }

  // document.addEventListener('DOMContentLoaded',
  async function render() {
    const autoUpdateCheckbox = document.getElementById("auto-update");
    autoUpdateCheckbox.checked = await settings.autoUpdate;
    autoUpdateCheckbox.onchange = async function (event) {
      settings.autoUpdate = event.target.checked;
    };
    const showMacroRailroad = document.getElementById("show-macro-railroad");
    if (showMacroRailroad) {
      showMacroRailroad.checked = await settings.showMacroRailroad;
      showMacroRailroad.onchange = async function (event) {
        settings.showMacroRailroad = event.target.checked;
      };
    }

    // Offline mode checkbox
    if (!(await settings.offlineDocPath)) {
      // If the offline doc path not exists, turn off the offline mode.
      settings.isOfflineMode = false;
    }
    const offlineModeCheckbox = document.getElementById("offline-mode");
    const checkedState = await settings.isOfflineMode;
    offlineModeCheckbox.checked = checkedState;
    toggleOfflinePathEnableState(checkedState);
    offlineModeCheckbox.onchange = function (event) {
      const checked = event.target.checked;
      settings.isOfflineMode = checked;
      toggleOfflinePathEnableState(checked);
    };

    // Offline doc path
    const offlineDocPath = document.querySelector(".offline-doc-path");
    offlineDocPath.value = await settings.offlineDocPath;
    offlineDocPath.onchange = async function (event) {
      let path = event.target.value;
      if (getPlatformOs() === "win") {
        // Replace all "/" to "\" for Windows.
        path = event.target.value.replaceAll("/", "\\");
      }
      if (path.startsWith("/")) {
        // Prepend file:// to allow browser open the file url
        path = "file://" + path;
      }

      event.target.value = path;
      settings.offlineDocPath = path;
    };

    let crateRegistry = document.querySelector("select[name='crate-registry']");
    crateRegistry.value = await settings.crateRegistry;
    crateRegistry.onchange = function () {
      settings.crateRegistry = crateRegistry.value;
    };

    const keepCratesUpToDate = document.getElementById(
      "keep-crates-up-to-date"
    );
    if (keepCratesUpToDate) {
      keepCratesUpToDate.checked = await settings.keepCratesUpToDate;
      keepCratesUpToDate.onchange = async function (event) {
        settings.keepCratesUpToDate = event.target.checked;
      };
    }

    await setupDefaultSearch();
  }

  function toggleOfflinePathEnableState(enable) {
    const offlineDocPath = document.querySelector(".offline-doc-path");
    if (enable) {
      offlineDocPath.classList.remove("disable");
      offlineDocPath.classList.add("enable");
    } else {
      offlineDocPath.classList.remove("enable");
      offlineDocPath.classList.add("disable");
    }
  }

  async function setupDefaultSearch() {
    const thirdPartyDocs = document.getElementById("ds-3rd-docs");
    const docsRs = document.getElementById("ds-docs-rs");
    const attributes = document.getElementById("ds-attributes");

    let defaultSearch = await settings.defaultSearch;

    thirdPartyDocs.checked = defaultSearch.thirdPartyDocs;
    docsRs.checked = defaultSearch.docsRs;
    attributes.checked = defaultSearch.attributes;

    thirdPartyDocs.onchange = function (event) {
      defaultSearch.thirdPartyDocs = event.target.checked;
      settings.defaultSearch = defaultSearch;
    };
    docsRs.onchange = function (event) {
      defaultSearch.docsRs = event.target.checked;
      settings.defaultSearch = defaultSearch;
    };
    attributes.onchange = function (event) {
      defaultSearch.attributes = event.target.checked;
      settings.defaultSearch = defaultSearch;
    };
  }

  onMount(async () => {
    await render();
  });
</script>

<div class="text">
  <div class="setting-group">
    <div class="title-text">General</div>
    <div>
      <div class="setting-item">
        <div>
          Enable auto update
          <span
            aria-label="Whether auto opens the index update page when the browser launch (default false). At any time, you can use the `:update` command to sync the latest index."
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
      <div class="setting-item">
        <div>
          Enable offline mode
          <span
            aria-label="Please check the FAQ if you are a Firefox user."
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
            <input type="checkbox" id="offline-mode" />
            <span class="slider"></span>
          </label>
        </div>
        <input
          type="text"
          class="offline-doc-path"
          placeholder="Input the local doc path"
        />
      </div>
      <div class="setting-item">
        <div>
          Enable default search items
          <span
            aria-label="Default search means search without any sigils required."
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
        </div>
        <div class="setting-subitem" style="opacity: 0.5">
          - Standard library
          <label class="toggle">
            <input type="checkbox" disabled checked />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-subitem">
          - Third-party docs
          <label class="toggle">
            <input type="checkbox" id="ds-3rd-docs" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-subitem">
          - Docs.rs
          <label class="toggle">
            <input type="checkbox" id="ds-docs-rs" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-subitem">
          - Attributes
          <label class="toggle">
            <input type="checkbox" id="ds-attributes" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div>
        <label>Crate registry</label>
        <select name="crate-registry">
          <option value="crates.io">crates.io</option>
          <option value="lib.rs">lib.rs</option>
        </select>
      </div>
    </div>
  </div>
  <div class="setting-group">
    <div class="title-text">About</div>
    <div>
      <div class="setting-item">
        <a href="https://rust.extension.sh">Website</a>
      </div>
      <div class="setting-item">
        <a href="https://rust.extension.sh/changelog">Changelog</a>
      </div>
      <div class="setting-item">
        <a href="https://github.com/huhu/rust-search-extension">Github</a>
      </div>
      <div class="setting-item">
        <a href="https://discord.gg/xucZNVd">Discord</a>
      </div>
    </div>
  </div>
  <div class="setting-group">
    <div class="title-text">Other extensions</div>
    <div>
      <div class="setting-item">
        <a href="https://rust.extension.sh">Rust Search Extension</a>
      </div>
      <div class="setting-item">
        <a href="https://cpp.extension.sh">C/C++ Search Extension</a>
      </div>
      <div class="setting-item">
        <a href="https://go.extension.sh">Go Search Extension</a>
      </div>
      <div class="setting-item">
        <a href="https://k8s.extension.sh">Kubernetes Search Extension</a>
      </div>
    </div>
  </div>
  <div class="setting-group">
    <div class="title-text">Author</div>
    <div>
      <div class="setting-item">
        <a href="https://twitter.com/_hisriver">@hisriver</a>
      </div>
      <div class="setting-item">
        <a href="https://github.com/folyd">Github</a>
      </div>
    </div>
  </div>
</div>
