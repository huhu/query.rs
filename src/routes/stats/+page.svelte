<script>
  import moment from "moment";
  import {
    getSearchStats,
    getHistogramEchartDatas,
    WEEKS_LABEL,
    DATES_LABEL,
    HOURS_LABEL,
  } from "./stats";
  import { onMount } from "svelte";
  import Histogram from "./HistogramChart.svelte";
  import TopCratesChart from "./TopCratesChart.svelte";
  import HeatMapChart from "./HeatMapChart.svelte";
  import { Statistics } from "querylib";

  /**
   * @type {number[]}
   */
  let weekData = [];

  /**
   * @type {number[]}
   */
  let dateData = [];

  /**
   * @type {number[]}
   */
  let hourData = [];

  /**
   * @type {number[]}
   */
  let yearList = [];

  let currentYear = moment().year();

  /**
   * @type {{name:string; value: number}[]}
   */
  let topCratesData = [];

  let searchTime = "the last year";

  /**
   * @type {number[]}
   */
  let dateRange = [];

  /**
   * @type {(string | number)[][]}
   */
  let heatMapData = [];
  /**
   * @type {{name:string; description: string, color: string, percent: string | number}[]}
   */
  let searchStats = [];
  /**
   * @type {number}
   * @description the total number of search in the last year
   */
  let yearSearchTotal = 0;

  /**
   *
   * @param {number} now
   * @param {number} yearAgo
   */
  async function getEchartData(now, yearAgo) {
    const { timeline } = await Statistics.load();
    const data = timeline.filter(([time]) => {
      return now >= time && time >= yearAgo;
    });

    yearSearchTotal = data.length;
    dateRange = [now, yearAgo];
    const { weeksArr, dateArr, hourArr, topCratesArr, heatMapArr } =
      getHistogramEchartDatas(data);
    weekData = weeksArr;
    dateData = dateArr;
    hourData = hourArr;
    topCratesData = topCratesArr;
    heatMapData = heatMapArr;
    searchStats = getSearchStats(data);
  }

  /**
   *
   * @param {number} y
   */
  function handleChangeYear(y) {
    currentYear = y;
    searchTime = String(y);
    const year = moment(searchTime);
    const now = year.endOf("year").valueOf();
    const yearAgo = year.startOf("year").valueOf();
    getEchartData(now, yearAgo);
  }

  /**
   * @param {number} times
   */
  function calculateSavedTime(times) {
    let seconds = times * 5;
    if (seconds > 3600) {
      let hours = seconds / 3600;
      let minutes = (seconds % 3600) / 60;
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

  /**
   *
   * @param {number} y
   * @returns {Promise<number[]>}
   */
  async function getYearList(y) {
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

  onMount(async () => {
    const now = moment().valueOf();
    const yearAgo = moment().startOf("day").subtract(1, "year").valueOf();
    dateRange = [now, yearAgo];
    yearList = await getYearList(currentYear);
    getEchartData(now, yearAgo);
  });
</script>

<link rel="stylesheet" href="/css/charts.css" />
<div class="flex flex-col items-center m-auto w-full">
  <div class="mb-9 w-full hidden md:block">
    <HeatMapChart {dateRange} data={heatMapData} />
  </div>
  <div class="search-time w-full text-center text-xl">
    <b>{yearSearchTotal}</b> searches in <b>{searchTime}</b>, approximately
    saved <b>{calculateSavedTime(yearSearchTotal)}</b>.
    <b
      aria-label="We consider one search save 5 seconds in average, just an estimated value."
      data-balloon-pos="up"
      data-balloon-length="large"
      style="vertical-align: middle"
      class="tooltip-color"
    >
      <img src="../assets/info.svg" alt="info" />
    </b>
  </div>
  <div id="chart" class="w-full">
    <div class="py-12 w-full mx-auto md:w-[85%]">
      <div class="h-[8px] flex">
        {#each searchStats as item}
          <span
            class="percent-bar"
            style="width: {item.percent}%"
            style:background-color={item.color}
          ></span>
        {/each}
      </div>
      <div class="search-stats-text p-2">
        <ol class="flex justify-around flex-wrap">
          {#each searchStats as item}
            <div
              aria-label="${item.description}"
              data-balloon-pos="up"
              data-balloon-length="large"
              style="text-align: center"
              class="tooltip-color"
            >
              <span class="color-circle-dot" style:background-color={item.color}
              ></span>
              <span>{item.name}</span>
              <span>{item.percent}%</span>
            </div>
          {/each}
        </ol>
      </div>
    </div>
    <div class="flex flex-col md:flex-row-reverse md:justify-around pt-16">
      <div>
        <div>
          <h3>Searches per weekday</h3>
          <Histogram data={weekData} labels={WEEKS_LABEL} />
        </div>
        <div>
          <h3>Searches per day of month</h3>
          <Histogram data={dateData} labels={DATES_LABEL} />
        </div>
        <div>
          <h3>Searches per hour (local time)</h3>
          <Histogram data={hourData} labels={HOURS_LABEL} />
        </div>
      </div>

      <div>
        <h3>Top searched crates</h3>
        <TopCratesChart data={topCratesData} />
      </div>
    </div>
  </div>
</div>
<ul class="hidden md:block filter-list">
  {#each yearList as year}
    <li
      class:selected={year === currentYear}
      on:click={() => handleChangeYear(year)}
    >
      {year}
    </li>
  {/each}
</ul>
