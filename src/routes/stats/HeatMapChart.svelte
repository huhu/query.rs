<script>
  import {onMount} from 'svelte';
  import { init } from "echarts";
  import dayjs from 'dayjs';
  /**
   * @type {number[]}
  */
  export let dateRange = [];

  /**
   * @type {(string | number)[][]} 
  */
  export let data = [];

  /**
   * @type {HTMLElement}
  */
  let chartElement;

  /**
   * @type {any}
  */
  let elementChart;

  const option = {
    tooltip: {
      show: true,
      confine: true,
      formatter: (/** @type {{ color:string; data: any }} */ params) => {
        return `<div><strong>${params.data[1]}</strong> searches on 
          ${dayjs(params.data[0]).format('ddd, MMM D YYYY')}</div>`
      }
    },
    visualMap: {
      type: "piecewise",
      calculable: false,
      orient: "horizontal",
      right: 0,
      bottom: 0,
      pieces: [
        { min: 1, max: 2, color: '#ffdd2b' },
        { min: 3, max: 6, color: '#f6a405' },
        { min: 7, max: 11, color: '#f56b04' },
        { gte: 12, color: '#f40703' }
      ]
    },
    calendar: {
      top: 30,
      left: 20,
      bottom: 30,
      right: 0,
      range: dateRange,
      yearLabel: { show: false },
      cellSize: 'auto',
      orient: 'horizontal',
      splitLine: false,
      itemStyle: {
        color: '#f4f7f7',
        borderColor: '#ffffff',
        borderWidth: 3,
      },
      dayLabel: {
        nameMap: ['', 'M', '', 'W', '', 'F', '']
      } 
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: [],
      }
    ]
  };

  $: {
    if(elementChart) {
      elementChart.setOption({
        calendar: {
          range: dateRange,
        },
        series: [
          {
            data,
          }
        ]
      })
    }
  }

  onMount(() => {
    elementChart = init(chartElement);
    elementChart.setOption(option);
  })

</script>

<div class="w-[820px] h-[160px] m-auto" bind:this={chartElement}></div>