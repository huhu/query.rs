<script>
  import moment from "moment";
  import { renderCharts, renderYearList } from "./stats";
  import { onMount } from "svelte";

  const now = moment().valueOf();
  const yearAgo = moment().startOf("day").subtract(1, "year").valueOf();

  onMount(async () => {
    await renderCharts(now, yearAgo);
    await renderYearList();
  });
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
        <div class="pb-12">
          <h3>Searches per weekday</h3>
          <div class="chart-histogram-week" style="position: relative;"></div>
        </div>
        <div class="pb-12">
          <h3>Searches per day of month</h3>
          <div class="chart-histogram-date" style="position: relative;"></div>
        </div>
        <div class="pb-12">
          <h3>Searches per hour (local time)</h3>
          <div class="chart-histogram-hour" style="position: relative;"></div>
        </div>
      </div>

      <div>
        <h3>Top searched crates</h3>
        <div class="topCratesData relative box-border"></div>
      </div>
    </div>
  </div>
</div>
<ul class="hidden md:block filter-list"></ul>
