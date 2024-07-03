<script>
  import { onMount } from "svelte";
  import { settings } from "$lib/index.js";
  import { browser } from "$app/environment";
  let isOfflineMode = false;
  let offlineDocPath = "";
  let defaultSearch = {
    attributes: true,
    docsRs: true,
    thirdPartyDocs: false,
  };
  let crateRegistry = "crates.io";

  $: {
    if (browser) {
        console.log(offlineDocPath);
      settings.offlineMode = isOfflineMode;
      settings.offlineDocPath = offlineDocPath;
      // settings.defaultSearch = defaultSearch;
      settings.crateRegistry = crateRegistry;
    }
  }

  onMount(async () => {
    offlineDocPath = await settings.offlineDocPath;
    isOfflineMode = await settings.isOfflineMode;
    defaultSearch = await settings.defaultSearch;
    crateRegistry = await settings.crateRegistry;
  });
</script>

<div class="text">
  <div class="setting-group">
    <div class="title-text">General</div>
    <div>
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
            <input type="checkbox" bind:checked={isOfflineMode} />
            <span class="slider"></span>
          </label>
        </div>
        <input
          type="text"
          class="offline-doc-path"
          bind:value={offlineDocPath}
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
            <input
              type="checkbox"
              bind:checked={defaultSearch.thirdPartyDocs}
            />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-subitem">
          - Docs.rs
          <label class="toggle">
            <input type="checkbox" bind:checked={defaultSearch.docsRs} />
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-subitem">
          - Attributes
          <label class="toggle">
            <input type="checkbox" bind:checked={defaultSearch.attributes} />
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div>
        <label>Crate registry</label>
        <select name="crate-registry" bind:value={crateRegistry}>
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
