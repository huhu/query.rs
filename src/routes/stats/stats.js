import { STATS_PATTERNS, Statistics } from "querylib";
import moment from "moment";

const TOP_CRATE_LENGTH = 15;
let chartWidth = 460;
const TYPE_OTHER = "other";
export const CHART_COLOR = "rgba(249, 188, 45, 0.5)";
const STATS_MAP = {
    "stable": {
        color: "#FEC744",
        description: "Std stable docs searches."
    },
    "nightly": {
        color: "#030303",
        description: "Std nightly docs searches."
    },
    "docs.rs": {
        color: "#dd6b33",
        description: "Docs.rs docs search.",
    },
    "crate": {
        color: "#3D6739",
        description: "crates.io or lib.rs searches."
    },
    "attribute": {
        color: "#9e78c6",
        description: "Built-in attributes searches."
    },
    "error code": {
        color: "#f50707",
        description: "Compile error index searches."
    },
    [TYPE_OTHER]: {
        color: "#ededed",
        description: "Others including any Rust version, Clippy lint (>), book (%), and caniuse/rfc (?) searches."
    }
};
const STATS_NUMBER = STATS_PATTERNS.reduce((pre, current) => {
    pre[current.type] = current.name;
    return pre;
}, Object.create(null));
export const WEEKS_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function makeNumericKeyObject(start, end, initial = 0) {
    return Array.from({ length: end + 1 - start }).fill(initial)
        .reduce((obj, current, index) => {
            obj[start + index] = current;
            return obj;
        }, {});
}

/**
 * @param {number} start 
 * @param {number} end 
 * @returns {number[]}
 */
function makeNumericKeyArray(start, end,) {
    return Array.from({ length: end + 1 - start }).map((_, index) => index + 1);
};

export const DATES_LABEL = makeNumericKeyArray(1, 31);
export const HOURS_LABEL = makeNumericKeyArray(1, 23);
export const TOP_CRATE_LABEL = Array.from({ length: TOP_CRATE_LENGTH }).map((_, i) => `#${i + 1}`);


function calculateSavedTime(times) {
    let seconds = times * 5;
    if (seconds > 3600) {
        let hours = seconds / 3600;
        let minutes = seconds % 3600 / 60;
        if (minutes > 0) {
            return `${Math.round(hours)} hours ${Math.round(minutes)} minutes`;
        } else {
            return `${Math.round(hours)} hours`;
        }
    } else if (seconds > 60) {
        return `${Math.round(seconds / 60)} minutes`;
    } else {
        return `${Math.round(seconds)} seconds`;
    }
}

function renderSearchTimes(length = 0) {
    let searchTimes = document.querySelector(".search-time");
    let frequency = searchTimes.querySelectorAll("b");
    frequency[0].textContent = `${length}`;
    frequency[2].textContent = calculateSavedTime(length);
}

function renderSearchStats(typeDataObj, total) {
    let searchStatsGraph = document.querySelector(".search-stats-graph");
    if (searchStatsGraph.hasChildNodes()) {
        searchStatsGraph.innerHTML = null;
    }

    let searchStatsText = document.querySelector(".search-stats-text");
    let ol = searchStatsText.querySelector("ol");
    if (ol.hasChildNodes()) {
        ol.innerHTML = null;
    }
    // Generate default type data.
    let defaultTypeData = Object.create(null)
    Object.keys(STATS_MAP).forEach(name => {
        defaultTypeData[name] = 0;
    });

    // Merge default type data with statistic type data.
    let array = Object.entries(Object.assign(defaultTypeData, typeDataObj));

    // Split the other part from the others in order to
    // keep the other part always in the last order.
    [
        ...array.filter(([key]) => key !== TYPE_OTHER).sort((a, b) => b[1] - a[1]),
        ...array.filter(([key]) => key === TYPE_OTHER),
    ].forEach(([name, value]) => {
        let { color, description } = STATS_MAP[name];
        let li = document.createElement("li");
        let percent = total ? (value / total * 100).toFixed(1) : 0.0;
        li.innerHTML = `<div aria-label="${description}" data-balloon-pos="up" data-balloon-length="large"
                        style="text-align: center" class="tooltip-color">
                        <span class="color-circle-dot" style="background-color:${color}"></span>
                        <span class="">${name}</span>
                        <span class="">${percent}%</span>
                     </div>`;
        ol.append(li);
        if (value > 0) {
            searchStatsGraph.insertAdjacentHTML('beforeend',
                `<span class="percent-bar" style="width: ${percent}%; background-color:${color}"></span>`
            );
        }
    });
}

export async function renderCharts(now, yearAgo) {
    chartWidth = Math.min(chartWidth, document.getElementById("chart").clientWidth) - 10;
    const { timeline } = await Statistics.load();

    const data = timeline.filter(([time]) => {
        return now >= time && time >= yearAgo;
    });

    const weeksObj = WEEKS_LABEL.reduce((obj, week) => {
        obj[week] = 0;
        return obj;
    }, {});
    const datesObj = makeNumericKeyObject(1, 31);
    const hoursObj = makeNumericKeyObject(1, 23);

    let typeTotal = 0;
    const typeDataObj = Object.create(null);

    data.forEach(([t, content]) => {
        const time = moment(t);
        const hour = time.hour();

        weeksObj[WEEKS_LABEL[time.weekday()]] += 1;
        datesObj[time.date()] += 1;
        if (hour !== 0) {
            hoursObj[hour] += 1;
        }
        if (content) {
            const typeName = STATS_NUMBER[content];
            typeDataObj[typeName] = (typeDataObj[typeName] || 0) + 1;
            typeTotal += 1;
        }
    });

    renderSearchTimes(data.length);
    renderSearchStats(typeDataObj, typeTotal);
}

/**
 * 
 * @param {number} now 
 * @param {number} yearAgo 
 * @returns 
 */
export async function getHistogramEchartDatas(now, yearAgo) {
    const { timeline } = await Statistics.load();
    const data = timeline.filter(([time]) => {
        return now >= time && time >= yearAgo;
    });
    const weeksArr = WEEKS_LABEL.map(() => 0);
    const dateArr = DATES_LABEL.map(() => 0);
    const hourArr = HOURS_LABEL.map(() => 0);

    const topCratesObj = Object.create(null);

    const heatMapArr = data.reduce((pre, [t]) => {
        const time = moment(t).format("YYYY-MM-DD");
        pre[time] = (pre[time] || 0) + 1;
        return pre;
    }, {});

    for (const [t, , type] of data) {
        const time = moment(t);
        const hour = time.hour();

        weeksArr[time.weekday()] += 1;
        dateArr[time.date() - 1] += 1;
        if (hour !== 0) {
            hourArr[hour - 1] += 1;
        }
        if (type) {
            topCratesObj[type] = (topCratesObj[type] || 0) + 1;
        }
    };

    const topCratesArr = Object.entries(topCratesObj)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value]) => {
            return {
                name: key,
                value
            };
        });
    topCratesArr.splice(TOP_CRATE_LENGTH);
    return {
        weeksArr,
        dateArr,
        hourArr,
        topCratesArr,
        heatMapArr: Object.entries(heatMapArr),
    }
}

/**
 * 
 * @param {number} y 
 * @returns {Promise<number[]>}
 */
export async function getYearList(y) {
    const { timeline } = await Statistics.load();
    const min = timeline.reduce((pre, current) => {
        return Math.min(pre, current[0]);
    }, moment().valueOf());
    const list = [];
    for (let i = y; i >= moment(min).year(); i--) {
        list.push(i);
    }
    return list;
}

