<script>
  import { onMount } from "svelte";
  import { init } from "echarts";
  import { CHART_COLOR } from "./stats";

   /**
    * @type {{label:string, name:string; value: number}[]}
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
      data,
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
        yAxis: {
          data: data.map((item) => item.label),
        },
        series: [
          {
            data,
          }
        ]
      });
      elementChart.resize({
        height: 800 / 15 * data.length + 100,
      });
    }
  }

  onMount(async () => {
    elementChart = init(echartElement);
    elementChart.setOption(option);
  })
</script>

<div class="relative w-[340px] md:w-[460px] m-auto" bind:this={echartElement}></div>
