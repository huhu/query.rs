<script>
  import { onMount } from "svelte";
  import { init } from "echarts";
  import { CHART_COLOR, TOP_CRATE_LABEL } from "./stats";

   /**
    * @type {{name:string; value: number}[]}
    */
  export let data = [];

  /**
   * @type {HTMLElement}
   */
  let echartElement;

  /**
   * @type {any}
   */
  let elementChart;
  const option = {
    color: CHART_COLOR,
    xAxis: {
      position: 'top',
    },
    yAxis: {
      type: "category",
      data: TOP_CRATE_LABEL,
      inverse: true,

    },
    series: [
      {
        data,
        type: "bar",
        label: {
          show: true,
          color: '#000',
          formatter:(/** @type {{ data: {name:string} }} */ params) => params.data.name,
          verticalAlign: "middle",
          position: [10, '50%'],
          fontSize: 14,
        }
      },
    ],
    tooltip: {
      show:true,
      trigger: 'axis'
    }
  }

  $: {
    if(elementChart) {
      elementChart.setOption({
        series: [
          {
            data,
          }
        ]
      });
    }
  }

  onMount(async () => {
    elementChart = init(echartElement);
    elementChart.setOption(option);
  })
</script>

<div class="relative w-[340px] md:w-[460px] m-auto h-[1060px]" bind:this={echartElement}></div>
