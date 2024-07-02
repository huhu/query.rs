import { Compat } from "omnibox-js";
import { CrateDocManager, Statistics } from "../lib/index.js";
import Toast from "./toast.js";

document.addEventListener("DOMContentLoaded", async () => {
    let addButton = document.querySelector("span.btn");
    addButton.onclick = async (e) => {
        let crate = document.getElementById("crate-name").value;
        if (!crate) {
            new Toast(".toast").info("Please input crate name");
            return;
        }

        let crates = await CrateDocManager.getCrates();
        if (crate in crates) {
            new Toast(".toast").info(`Crate \`${crate}\` already exists`);
            return;
        }

        let response = await fetch(`https://crates.io/api/v1/crates/${crate}`);
        if (response.status !== 200) {
            new Toast(".toast").info(`Crate \`${crate}\` not found`);
            return;
        }

        let data = await response.json();
        response = await fetch(`https://query.rs/index/${data.crate.name}/${data.crate.newest_version}`);
        if (response.status !== 200) {
            let data = await response.json();
            new Toast(".toast").info(data.error);
            return;
        }

        data = await response.json();
        try {
            await CrateDocManager.addCrate(data);
            await refresh();
        }
        catch (e) {
            new Toast(".toast").info(e.message);
            return;
        }
    };
});

function buildRemoveButton(name) {
    let btn = document.createElement("span");
    btn.classList.add("btn-remove");
    btn.textContent = "Remove";
    btn.onclick = async () => {
        await CrateDocManager.removeCrate(name);
        // Update the crate count
        let crates = await CrateDocManager.getCrates();
        btn.parentElement.remove();
        updateMetrics(crates.length);
    };
    return btn;
}

function buildCrateItem(crate) {
    let li = document.createElement("li");
    li.classList.add("crate-list-item");
    li.style.padding = "15px";
    li.innerHTML = `<div style="display: flex; flex-direction: column;">
        <div>
            <b class="subtitle-text">${crate.crateName || crate.name}</b>
            <span class="crate-attr">v${crate.version}</span>
            <a class="crate-attr" href="https://crates.io/crates/${crate.crateName || crate.name}" target="_blank">crates.io</a>
            <a class="crate-attr" href="https://docs.rs/${crate.crateName || crate.name}" target="_blank">docs.rs</a>
        </div>
        <div class="crate-desc">${crate.doc}</div>
        <div class="crate-extra subtext">
            <b>${crate.searchs}</b> ${crate.searchs > 0 ? "searches" : "search"} since
            <span>${crate.formatedTime}</span>
        </div>
    </div>`;
    li.appendChild(buildRemoveButton(crate.name));
    return li;
}

function updateMetrics(cratesCount) {
    document.getElementById("crate-count").textContent = cratesCount;
    let usage = Object.keys(localStorage).map(k => (localStorage.getItem(k) ?? '').length * 2 / 1024 / 1024).reduce((a, b) => a + b);
    document.getElementById("storage-usage").textContent = `${Math.round(usage * 100) / 100} MB`;
}

async function refresh(orderBy = "time") {
    let root = document.querySelector(".crate-list");
    // Clear old crate list.
    while (root.firstChild) {
        root.firstChild.remove();
    }

    const { timeline } = await Statistics.load();
    const cratesData = timeline.reduce((pre, [time, type, crate]) => {
        if (crate) {
            pre[crate] = (pre[crate] || 0) + 1;
        }
        return pre;
    }, Object.create(null));
    let crates = Object.entries(await CrateDocManager.getCrates()).map(([name, crate]) => {
        return {
            name,
            searchs: cratesData[name] || 0,
            formatedTime: Compat.normalizeDate(new Date(crate.time)),
            ...crate,
        };
    });

    if (orderBy === "time") {
        crates.sort((a, b) => b.time - a.time);
    } else if (orderBy === "alphanumeric") {
        crates.sort((a, b) => a.name.localeCompare(b.name));
    } else if (orderBy === "searches") {
        crates.sort((a, b) => b.searchs - a.searchs);
    }

    crates.forEach(crate => {
        root.appendChild(buildCrateItem(crate));
    });

    updateMetrics(crates.length);
}

let crateFilter = document.querySelector("select[name='crate-filter']");
crateFilter.onchange = async function () {
    await refresh(crateFilter.value);
};

(async () => {
    await refresh();
})();