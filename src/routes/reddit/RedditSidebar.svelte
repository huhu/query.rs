<script>
  import { onMount } from 'svelte';
  import { ChevronDown, ChevronRight } from 'lucide-svelte';

  // Props
  export let onDateSelect = (date) => {};
  export let onWeekSelect = (weekNum, year) => {};
  export let onMonthSelect = (year, month) => {};
  export let onYearSelect = (year) => {};
  
  const viewOptions = [
    { id: 'date', label: 'By Date' },
    { id: 'week', label: 'By Week' },
    { id: 'month', label: 'By Month' },
    { id: 'year', label: 'By Year' }
  ];
  
  let selectedView = 'date';
  let expandedYears = new Set();
  let expandedMonths = new Set();
  
  // Store structure
  let years = [];
  let weeksByYear = [];
  
  // Generate dates for past months and years
  function generateTimeStructure() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    
    years = [];
    weeksByYear = [];
    
    // Start with current year
    let yearCount = 3; // Show 3 years
    let year = currentYear;
    
    while (yearCount > 0) {
      const yearData = { year, months: [] };
      
      // Determine month range for this year
      const startMonth = (year === currentYear) ? currentMonth : 11;
      
      for (let month = startMonth; month >= 0; month--) {
        const monthData = {
          month,
          monthName: new Date(year, month).toLocaleString('default', { month: 'long' }),
          dates: []
        };
        
        // Only add dates for date view
        if (selectedView === 'date') {
          const lastDay = new Date(year, month + 1, 0).getDate();
          const startDay = (year === currentYear && month === currentMonth) ? currentDate : lastDay;
          
          for (let day = startDay; day >= 1; day--) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            monthData.dates.push(dateStr);
          }
        }
        
        if (selectedView !== 'date' || monthData.dates.length > 0) {
          yearData.months.push(monthData);
        }
      }
      
      if (yearData.months.length > 0) {
        years.push(yearData);
      }
      
      // Generate weeks for week view
      if (selectedView === 'week') {
        const yearWeeks = { year, weeks: [] };
        const maxWeeks = year === currentYear ? getWeekNumber(now) : 52;
        
        for (let week = maxWeeks; week >= 1; week--) {
          yearWeeks.weeks.push({
            week,
            weekDates: getWeekDates(week, year)
          });
        }
        
        weeksByYear.push(yearWeeks);
      }
      
      year--;
      yearCount--;
    }
  }
  
  function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }
  
  function getWeekDates(weekNum, year) {
    const yearStart = new Date(year, 0, 1);
    const week1Start = new Date(year, 0, 1 + (1 - yearStart.getDay()));
    const weekStart = new Date(week1Start);
    weekStart.setDate(week1Start.getDate() + (weekNum - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      start: weekStart.toISOString().split('T')[0],
      end: weekEnd.toISOString().split('T')[0]
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
  }

  function handleMonthClick(year, month) {
    if (selectedView === 'month') {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      onMonthSelect(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
    }
  }

  function handleYearClick(year) {
    if (selectedView === 'year') {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      onYearSelect(startDate, endDate);
    }
  }
  
  onMount(() => {
    generateTimeStructure();
  });

  $: if (selectedView) {
    generateTimeStructure();
  }
</script>

<div class="w-64 bg-white border-r border-gray-200 min-h-screen">
  <div class="p-4">
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
            on:click={() => {
              if (selectedView === 'year') {
                handleYearClick(year);
              } else {
                toggleYear(year);
              }
            }}
          >
            {#if selectedView !== 'year'}
              {#if expandedYears.has(year)}
                <ChevronDown class="w-4 h-4" />
              {:else}
                <ChevronRight class="w-4 h-4" />
              {/if}
            {/if}
            <span class="font-medium">{year}</span>
          </button>
          
          {#if expandedYears.has(year)}
            {#if selectedView === 'date' || selectedView === 'month'}
              {#each months as { month, monthName, dates }}
                <div class="ml-4">
                  <button
                    class="flex items-center space-x-2 w-full p-2 hover:bg-gray-50 rounded-md"
                    on:click={() => {
                      if (selectedView === 'month') {
                        handleMonthClick(year, month);
                      } else {
                        toggleMonth(`${year}-${month}`);
                      }
                    }}
                  >
                    {#if selectedView === 'date'}
                      {#if expandedMonths.has(`${year}-${month}`)}
                        <ChevronDown class="w-4 h-4" />
                      {:else}
                        <ChevronRight class="w-4 h-4" />
                      {/if}
                    {/if}
                    <span>{monthName}</span>
                  </button>
                  
                  {#if selectedView === 'date' && expandedMonths.has(`${year}-${month}`)}
                    <div class="ml-6 space-y-1">
                      {#each dates as date}
                        <button
                          class="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm"
                          on:click={() => onDateSelect(date)}
                        >
                          {date}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            {:else if selectedView === 'week'}
              {#each weeksByYear.find(w => w.year === year)?.weeks || [] as { week, weekDates }}
                <div class="ml-6">
                  <button
                    class="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm flex items-center justify-between"
                    on:click={() => onWeekSelect(weekDates.start, weekDates.end)}
                  >
                    <span>Week {week}</span>
                    <span class="text-xs text-gray-500">
                      {weekDates.start} to {weekDates.end}
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