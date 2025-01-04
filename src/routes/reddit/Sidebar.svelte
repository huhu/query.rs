<script>
  import { onMount } from "svelte";
  import { ChevronDown, ChevronRight } from "lucide-svelte";

  // Props
  export let onDateSelect = (date) => {};
  export let onWeekSelect = (start, end) => {};
  export let onMonthSelect = (start, end) => {};
  export let onYearSelect = (year) => {};

  const viewOptions = [
    { id: "date", label: "By Date" },
    { id: "week", label: "By Week" },
    { id: "month", label: "By Month" },
    { id: "year", label: "By Year" },
  ];

  let selectedView = "week";
  let selectedId = "";
  let expandedYears = new Set();
  let expandedMonths = new Set();
  /**
   * @type {HTMLButtonElement}
   */
  let currentWeekElement;

  /**
   * @type {any[]}
   */
  let years = [];
  /**
   * @type {any[]}
   */
  let weeksByYear = [];

  // Constants for oldest data
  const OLDEST_DATE = new Date("2021-11-23T13:16:37");
  const OLDEST_YEAR = OLDEST_DATE.getFullYear();
  const OLDEST_MONTH = OLDEST_DATE.getMonth();
  const OLDEST_DAY = OLDEST_DATE.getDate();

  // Generate dates for past months and years
  function generateTimeStructure() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    years = [];
    weeksByYear = [];

    // Generate years from current year down to oldest year
    for (let year = currentYear; year >= OLDEST_YEAR; year--) {
      const yearData = { year, months: [] };

      // Determine month range for this year
      const startMonth = year === currentYear ? currentMonth : 11;
      const endMonth = year === OLDEST_YEAR ? OLDEST_MONTH : 0;

      for (let month = startMonth; month >= endMonth; month--) {
        const monthData = {
          month,
          monthName: new Date(year, month).toLocaleString("default", {
            month: "long",
          }),
          dates: [],
        };

        // Only add dates for date view
        if (selectedView === "date") {
          const lastDay = new Date(year, month + 1, 0).getDate();
          let startDay = lastDay;

          // Adjust start day for current month/year
          if (year === currentYear && month === currentMonth) {
            startDay = currentDate;
          }

          // Adjust for oldest month/year
          const endDay =
            year === OLDEST_YEAR && month === OLDEST_MONTH ? OLDEST_DAY : 1;

          for (let day = startDay; day >= endDay; day--) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            monthData.dates.push(dateStr);
          }
        }

        if (selectedView !== "date" || monthData.dates.length > 0) {
          yearData.months.push(monthData);
        }
      }

      if (yearData.months.length > 0) {
        years.push(yearData);
      }

      // Generate weeks for week view
      if (selectedView === "week") {
        const yearWeeks = { year, weeks: [] };
        const maxWeeks = year === currentYear ? getWeekNumber(now) : 52;

        for (let week = maxWeeks; week >= 1; week--) {
          const weekDates = getWeekDates(week, year);
          // Only add weeks that are after or include the oldest date
          if (weekDates.start >= OLDEST_DATE.toISOString().split("T")[0]) {
            yearWeeks.weeks.push({
              week,
              weekDates,
            });
          }
        }

        if (yearWeeks.weeks.length > 0) {
          weeksByYear.push(yearWeeks);
        }
      }
    }
  }

  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  function getWeekDates(weekNum, year) {
    const yearStart = new Date(year, 0, 1);
    const week1Start = new Date(year, 0, 1 + (1 - yearStart.getDay()));
    const weekStart = new Date(week1Start);
    weekStart.setDate(week1Start.getDate() + (weekNum - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      start: weekStart.toISOString().split("T")[0],
      end: weekEnd.toISOString().split("T")[0],
    };
  }

  function toggleYear(year) {
    if (expandedYears.has(year)) {
      expandedYears.delete(year);
    } else {
      expandedYears.add(year);
    }
    expandedYears = expandedYears;
  }

  function toggleMonth(yearMonth) {
    if (expandedMonths.has(yearMonth)) {
      expandedMonths.delete(yearMonth);
    } else {
      expandedMonths.add(yearMonth);
    }
    expandedMonths = expandedMonths;
  }

  function handleViewChange(event) {
    selectedView = event.target.value;
    expandedYears.clear();
    expandedMonths.clear();
    generateTimeStructure();

    if (years.length > 0) {
      const firstYear = years[0];
      expandedYears.add(firstYear.year);

      switch (selectedView) {
        case "date":
          if (firstYear.months.length > 0) {
            const firstMonth = firstYear.months[0];
            expandedMonths.add(`${firstYear.year}-${firstMonth.month}`);
            if (firstMonth.dates.length > 0) {
              selectedId = firstMonth.dates[0];
              onDateSelect(firstMonth.dates[0]);
            }
          }
          break;

        case "week":
          if (weeksByYear.length > 0 && weeksByYear[0].weeks.length > 0) {
            const firstWeek = weeksByYear[0].weeks[0];
            selectedId = `${firstYear.year}-${firstWeek.week}`;
            onWeekSelect(firstWeek.weekDates.start, firstWeek.weekDates.end);
          }
          break;

        case "month":
          if (firstYear.months.length > 0) {
            const firstMonth = firstYear.months[0];
            selectedId = `${firstYear.year}-${firstMonth.month}`;
            const startDate = new Date(firstYear.year, firstMonth.month, 1);
            const endDate = new Date(firstYear.year, firstMonth.month + 1, 0);
            onMonthSelect(
              startDate.toISOString().split("T")[0],
              endDate.toISOString().split("T")[0]
            );
          }
          break;

        case "year":
          selectedId = firstYear.year.toString();
          onYearSelect(firstYear.year.toString());
          break;
      }
    }
  }

  onMount(() => {
    generateTimeStructure();

    // Auto expand current year and select current week
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = getWeekNumber(now);
    expandedYears.add(currentYear);
    expandedYears = expandedYears;

    // Set initial selection for week view
    if (weeksByYear.length > 0) {
      const yearWeeks = weeksByYear.find((w) => w.year === currentYear);
      if (yearWeeks && yearWeeks.weeks.length > 0) {
        const currentWeekData =
          yearWeeks.weeks.find((w) => w.week === currentWeek) ||
          yearWeeks.weeks[0];
        selectedId = `${currentYear}-${currentWeekData.week}`;
        onWeekSelect(
          currentWeekData.weekDates.start,
          currentWeekData.weekDates.end
        );
      }
    }

    // Wait for DOM update then scroll to current week
    setTimeout(() => {
      if (currentWeekElement) {
        currentWeekElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  });
</script>

<div class="w-52">
  <div class="p-2">
    <select
      class="w-full p-2 border rounded-md mb-4"
      value={selectedView}
      on:change={handleViewChange}
    >
      {#each viewOptions as option}
        <option value={option.id}>{option.label}</option>
      {/each}
    </select>

    <div class="space-y-2">
      {#each years as { year, months }}
        <div class="border-b border-gray-100 last:border-0">
          <button
            class="flex items-center space-x-2 w-full p-2 hover:bg-gray-50 rounded-md"
            class:bg-blue-50={selectedView === "year" &&
              selectedId === year.toString()}
            on:click={() => {
              if (selectedView === "year") {
                selectedId = year.toString();
                onYearSelect(year.toString());
              } else {
                toggleYear(year);
              }
            }}
          >
            {#if selectedView !== "year"}
              {#if expandedYears.has(year)}
                <ChevronDown class="w-4 h-4" />
              {:else}
                <ChevronRight class="w-4 h-4" />
              {/if}
            {/if}
            <span class="font-medium">{year}</span>
          </button>

          {#if expandedYears.has(year)}
            {#if selectedView === "date" || selectedView === "month"}
              {#each months as { month, monthName, dates }}
                <div class="ml-4">
                  <button
                    class="flex items-center space-x-2 w-full p-2 hover:bg-gray-50 rounded-md"
                    class:bg-blue-50={selectedView === "month" &&
                      selectedId === `${year}-${month}`}
                    on:click={() => {
                      if (selectedView === "month") {
                        selectedId = `${year}-${month}`;
                        const lastDay = new Date(year, month + 1, 0);

                        // Format dates with correct month (add 1 to month when padding)
                        const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
                        const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay.getDate().toString().padStart(2, "0")}`;

                        onMonthSelect(startDate, endDate);
                      } else {
                        toggleMonth(`${year}-${month}`);
                      }
                    }}
                  >
                    {#if selectedView === "date"}
                      {#if expandedMonths.has(`${year}-${month}`)}
                        <ChevronDown class="w-4 h-4" />
                      {:else}
                        <ChevronRight class="w-4 h-4" />
                      {/if}
                    {/if}
                    <span>{monthName}</span>
                  </button>

                  {#if selectedView === "date" && expandedMonths.has(`${year}-${month}`)}
                    <div class="ml-6 space-y-1">
                      {#each dates as date}
                        <button
                          class="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm"
                          class:bg-blue-50={selectedView === "date" &&
                            selectedId === date}
                          on:click={() => {
                            selectedId = date;
                            onDateSelect(date);
                          }}
                        >
                          {date}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            {:else if selectedView === "week"}
              {#each weeksByYear.find((w) => w.year === year)?.weeks || [] as { week, weekDates }}
                <div class="ml-6">
                  <button
                    bind:this={currentWeekElement}
                    class="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm flex items-center justify-between"
                    class:bg-blue-50={selectedView === "week" &&
                      selectedId === `${year}-${week}`}
                    on:click={() => {
                      selectedId = `${year}-${week}`;
                      onWeekSelect(weekDates.start, weekDates.end);
                    }}
                  >
                    <span>Week {week}</span>
                    <span class="text-xs text-gray-500">
                      {weekDates.start.split("-").slice(1).join("-")} to {weekDates.end
                        .split("-")
                        .slice(1)
                        .join("-")}
                    </span>
                  </button>
                </div>
              {/each}
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
