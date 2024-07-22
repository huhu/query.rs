<script>
  import { onMount } from "svelte";
  import { settings } from "querylib";
  import Export from "./Export.svelte";

  async function render() {
    let crateRegistry = document.querySelector("select[name='crate-registry']");
    crateRegistry.value = await settings.crateRegistry;
    crateRegistry.onchange = function () {
      settings.crateRegistry = crateRegistry.value;
    };

    await setupDefaultSearch();
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

<div class="flex flex-col items-start m-auto text w-full md:mx-36">
  <div class="setting-group">
    <div class="title-text">General</div>
    <div>
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
        Crate registry
        <select name="crate-registry" class="border">
          <option value="crates.io">crates.io</option>
          <option value="lib.rs">lib.rs</option>
        </select>
      </div>
    </div>
  </div>
</div>
<Export />
