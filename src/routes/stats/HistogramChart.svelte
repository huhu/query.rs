<script>
  import { onMount } from "svelte";
  import { init } from "echarts";
  import { CHART_COLOR } from "./stats";

  /**
   * @type {number[]}
   */
  export let data = [];

  /**
   * @type {string[] | number[]}
   */
  export let labels = [];

  /**
   * @type {HTMLElement}
   */
  let echartElement

  /**
   * @type {any}
   */
  let elementChart;
  const option = {
    color: CHART_COLOR,
    xAxis: {
      type: "category",
      data: labels,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data,
        type: "bar",
      },
    ],
    tooltip: {
      show:true,
      trigger: 'axis'
    }
  }

  $: {
      elementChart && elementChart.setOption({
        xAxis: {
          type: "category",
          data: labels,
        },
        series: [
          {
            data,
            type: "bar",
          }
        ]
      });
  }

  onMount(() => {
    elementChart = init(echartElement);
    elementChart.setOption(option);
  })
</script>

<div class="relative h-[320px] w-[380px] md:w-[460px] m-auto" bind:this={echartElement}></div>
