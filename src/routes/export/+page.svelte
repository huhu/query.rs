<script>
  import {
    storage,
    settings,
    Compat,
    CrateDocManager,
    Statistics,
  } from "querylib";

  /**
   * @type {{ [x: string]: any; }}
   */
  let exportConfig = {
    settings: true,
    searchHistory: true,
    searchStatistics: true,
    crates: true,
  };
  /**
   * @type {{ [x: string]: any; }}
   */
  let importConfig = {
    settings: true,
    searchHistory: true,
    searchStatistics: true,
    crates: true,
  };
  /**
   * @type {{ [x: string]: any; }}
   */
  let importedJson;
  /**
   * @type {HTMLInputElement}
   */
  let fileSelector;

  /**
   * @param {string} item
   * @returns {string}
   */
  function formatItem(item) {
    // Insert a space before each uppercase letter and capitalize the first letter of the string
    const result = item
      .replace(/([A-Z])/g, " $1") // Add space before each uppercase letter
      .replace(/^./, function (str) {
        return str.toUpperCase();
      }); // Capitalize the first letter of the string
    return result;
  }

  /**
   * @param {BlobPart} content
   * @param {string} fileName
   * @param {any} contentType
   */
  function saveToFile(content, fileName, contentType) {
    let a = document.createElement("a");
    let file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  async function onExport() {
    let data = Object.create(null);
    if (exportConfig.settings) {
      data["settings"] = {
        "auto-update": await settings.autoUpdate,
        "crate-registry": await settings.crateRegistry,
        "offline-mode": await settings.isOfflineMode,
        "offline-path": await settings.offlineDocPath,
      };
    }
    if (exportConfig.searchHistory) {
      data["history"] = (await storage.getItem("history")) || [];
    }
    if (exportConfig.searchStatistics) {
      data["stats"] = await Statistics.load();
    }
    if (exportConfig.crates) {
      let catalog = await CrateDocManager.getCrates();
      let list = Object.create(null);
      for (const name of Object.keys(catalog)) {
        list[`@${name}`] = await CrateDocManager.getCrateSearchIndex(name);
      }
      data["crates"] = {
        catalog,
        list,
      };
    }
    let date = Compat.normalizeDate(new Date());
    saveToFile(JSON.stringify(data), `${date}.json`, "text/plain");
  }

  /**
   * @param {any} event
   */
  function onFileSelected(event) {
    fileSelector.classList.remove("required");

    let fileReader = new FileReader();
    fileReader.onload = () => {
      importedJson = JSON.parse(fileReader.result);
      console.log("Imported JSON:", importedJson);
    };
    fileReader.readAsText(this.files[0]);
  }

  async function onImport() {
    if (!importedJson) {
      fileSelector.classList.add("required");
      return;
    }

    if (
      !["settings", "history", "stats", "crates"].some(
        (item) => item in importedJson
      )
    ) {
      alert("Invalid json file");
      return;
    }

    if (importedJson["settings"] && importConfig.settings) {
      let importedSettings = importedJson["settings"];
      settings.autoUpdate = importedSettings["auto-update"];
      settings.crateRegistry = importedSettings["crate-registry"];
      settings.isOfflineMode = importedSettings["offline-mode"];
      settings.offlineDocPath = importedSettings["offline-path"];
    }
    if (importedJson["history"] && importConfig.searchHistory) {
      await storage.setItem("history", importedJson["history"]);
    }
    if (importedJson["stats"] && importConfig.searchStatistics) {
      await storage.setItem("statistics", importedJson["stats"]);
    }
    if (importedJson["crates"] && importConfig.crates) {
      let importedCrates = importedJson["crates"];
      let catalog = await CrateDocManager.getCrates();
      for (let [name, searchIndex] of Object.entries(importedCrates["list"])) {
        await storage.setItem(name, searchIndex);
      }
      let crates = Object.assign(catalog, importedCrates["catalog"]);
      await storage.setItem("crates", crates);
    }

    alert("Import success!");
  }
</script>

<div class="setting-group">
  <div class="title-text">Export</div>
  <div class="text">
    <div>Export following data to JSON file:</div>
    <br />
    {#each Object.keys(exportConfig) as key}
      <div class="setting-item">
        <div>
          <label class="toggle">
            <input type="checkbox" bind:checked={exportConfig[key]} />
            <span class="slider"></span>
          </label>
          {formatItem(key)}
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
    <input
      class="file-selector text"
      bind:this={fileSelector}
      on:change={onFileSelected}
      type="file"
      accept="application/json"
    />
    {#each Object.keys(importConfig) as key}
      <div class="setting-item">
        <div>
          <label class="toggle">
            <input type="checkbox" bind:checked={importConfig[key]} />
            <span class="slider"></span>
          </label>
          {formatItem(key)}
        </div>
      </div>
    {/each}
    <div class="btn btn-secondary btn-import" on:click={onImport}>Import</div>
  </div>
</div>
