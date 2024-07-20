<script>
  import moment from "moment";
  import {
    renderCharts,
    getHistogramEchartDatas,
    WEEKS_LABEL,
    DATES_LABEL,
    HOURS_LABEL,
    getYearList,
  } from "./stats";
  import { onMount } from "svelte";
  import Histogram from "./HistogramChart.svelte";

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
   * 
   * @param {number} now
   * @param {number} yearAgo
   */
  async function getEchartData(now, yearAgo) {
    const { weeksArr, dateArr, hourArr } = await getHistogramEchartDatas(now, yearAgo);
    weekData = weeksArr;
    dateData = dateArr;
    hourData = hourArr;
    await renderCharts(now, yearAgo, moment(yearAgo).format('YYYY'));
  }

   /**
    * 
    * @param {number} y
    */
  function handleChangeYear(y){
    currentYear = y;
    const year = moment(String(y));
    const now = year.endOf('year').valueOf();
    const yearAgo = year.startOf('year').valueOf();
    getEchartData(now, yearAgo);
  };

  onMount(async () => {
    const now = moment().valueOf();
    const yearAgo = moment().startOf("day").subtract(1, "year").valueOf();

    await renderCharts(now, yearAgo);
    const list = await getYearList(currentYear);
    yearList = list;
    getEchartData(now, yearAgo);
  })
</script>

<link rel="stylesheet" href="/css/charts.css" />
<div class="flex flex-col items-center m-auto w-full">
  <div class="flex-layout flex-col">
    <div class="chart-heatmap hidden md:block"></div>
  </div>
  <div class="search-time w-full text-center text-xl">
    <b>0</b> searches in <b>the last year</b>, approximately saved
    <b>0 seconds</b>.
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
    <div class="py-12">
      <div class="search-stats-graph h-[8px] flex"></div>
      <div class="search-stats-text p-2">
        <ol class="flex justify-around flex-wrap"></ol>
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
        <div class="topCratesData relative box-border"></div>
      </div>
    </div>
  </div>
</div>
<ul class="hidden md:block filter-list">
  {#each yearList as item}
    <li class:selected={item === currentYear} on:click={() => handleChangeYear(item)}>{item}</li>
  {/each}
</ul>
