/**
 * Read a theme token after CSS has applied the active palette.
 * @param {string} name
 */
function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Push chart chrome (axes, calendar, bar labels) to an ECharts instance.
 * Series colors stay put; only the frame around them follows the theme.
 * @param {{ setOption: (option: object) => void }} chart
 * @param {"cartesian" | "bars" | "calendar"} kind
 */
export function paintChart(chart, kind) {
  if (kind === "cartesian") {
    chart.setOption({
      xAxis: {
        axisLabel: { color: token("--chart-axis") },
        axisLine: { lineStyle: { color: token("--chart-split") } },
      },
      yAxis: {
        axisLabel: { color: token("--chart-axis") },
        splitLine: { lineStyle: { color: token("--chart-split") } },
      },
    });
    return;
  }

  if (kind === "bars") {
    chart.setOption({
      xAxis: {
        axisLabel: { color: token("--chart-axis") },
        splitLine: { lineStyle: { color: token("--chart-split") } },
      },
      yAxis: {
        axisLabel: { color: token("--chart-axis") },
      },
      series: [{ label: { color: token("--bar-label") } }],
    });
    return;
  }

  chart.setOption({
    visualMap: { textStyle: { color: token("--chart-axis") } },
    calendar: {
      itemStyle: {
        color: token("--chart-cell"),
        borderColor: token("--chart-cell-border"),
        borderWidth: 3,
      },
      dayLabel: {
        color: token("--chart-axis"),
        nameMap: ["", "M", "", "W", "", "F", ""],
      },
      monthLabel: { color: token("--chart-axis") },
    },
  });
}

/**
 * @param {() => void} paint
 */
export function watchTheme(paint) {
  const onChange = () => paint();
  window.addEventListener("themechange", onChange);
  return () => window.removeEventListener("themechange", onChange);
}
