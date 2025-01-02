<script>
  import { onMount } from 'svelte';
  import { ChevronDown, ChevronRight, Calendar, Clock } from 'lucide-svelte';

  // Props
  export let onDateSelect = (date) => {};
  export let onWeekSelect = (weekNum, year) => {};
  
  let selectedTab = 'date'; // 'date' or 'week'
  let expandedYears = new Set();
  let expandedMonths = new Set();
  
  // Store structure for dates and weeks
  let years = [];
  let weeksByYear = [];
  
  // Generate dates for past months and years
  function generateDates() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Start with current year
    let yearCount = 3; // Number of years to show
    let year = currentYear;
    
    while (yearCount > 0) {
      const yearData = { year, months: [] };
      
      // Determine month range for this year
      const startMonth = (year === currentYear) ? currentMonth : 11;
      
      for (let month = startMonth; month >= 0; month--) {
        // Skip future months in current year
        if (year === currentYear && month > currentMonth) continue;
        
        const monthData = {
          month,
          monthName: new Date(year, month).toLocaleString('default', { month: 'long' }),
          dates: []
        };
        
        // Determine the range of days to process
        const lastDay = new Date(year, month + 1, 0).getDate();
        const startDay = (year === currentYear && month === currentMonth) ? now.getDate() : lastDay;
        
        for (let day = startDay; day >= 1; day--) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          monthData.dates.push(dateStr);
        }
        
        if (monthData.dates.length > 0) {
          yearData.months.push(monthData);
        }
      }
      
      if (yearData.months.length > 0) {
        years.push(yearData);
      }
      
      year--;
      yearCount--;
    }
  }
  
  // Generate weeks grouped by year
  function generateWeeks() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Generate for current and previous year
    for (let year = currentYear; year >= currentYear - 2; year--) {
      const yearData = { 
        year,
        weeks: []
      };
      
      // For current year, only include up to current week
      const maxWeeks = year === currentYear ? getWeekNumber(now) : 52;
      
      for (let week = maxWeeks; week >= 1; week--) {
        yearData.weeks.push({
          week,
          weekDates: getWeekDates(week, year)
        });
      }
      
      weeksByYear.push(yearData);
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
    // Get the first day of the year
    const yearStart = new Date(year, 0, 1);
    // Get the first day of week 1
    const week1Start = new Date(year, 0, 1 + (1 - yearStart.getDay()));
    // Calculate the start of the requested week
    const weekStart = new Date(week1Start);
    weekStart.setDate(week1Start.getDate() + (weekNum - 1) * 7);
    // Calculate the end of the week
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
    expandedYears = expandedYears; // trigger reactivity
  }
  
  function toggleMonth(yearMonth) {
    if (expandedMonths.has(yearMonth)) {
      expandedMonths.delete(yearMonth);
    } else {
      expandedMonths.add(yearMonth);
    }
    expandedMonths = expandedMonths; // trigger reactivity
  }
  
  onMount(() => {
    generateDates();
    generateWeeks();
  });
</script>

<div class="w-64 bg-white border-r border-gray-200 min-h-screen">
  <div class="p-4">
    <div class="flex space-x-4 mb-4">
      <button
        class={`flex items-center space-x-1 px-3 py-2 rounded-md ${selectedTab === 'date' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
        on:click={() => selectedTab = 'date'}
      >
        <Calendar class="w-4 h-4" />
        <span>By Date</span>
      </button>
      
      <button
        class={`flex items-center space-x-1 px-3 py-2 rounded-md ${selectedTab === 'week' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
        on:click={() => selectedTab = 'week'}
      >
        <Clock class="w-4 h-4" />
        <span>By Week</span>
      </button>
    </div>
    
    {#if selectedTab === 'date'}
      <div class="space-y-2">
        {#each years as { year, months }}
          <div class="border-b border-gray-100 last:border-0">
            <button
              class="flex items-center space-x-2 w-full p-2 hover:bg-gray-50 rounded-md"
              on:click={() => toggleYear(year)}
            >
              {#if expandedYears.has(year)}
                <ChevronDown class="w-4 h-4" />
              {:else}
                <ChevronRight class="w-4 h-4" />
              {/if}
              <span class="font-medium">{year}</span>
            </button>
            
            {#if expandedYears.has(year)}
              {#each months as { month, monthName, dates }}
                <div class="ml-4">
                  <button
                    class="flex items-center space-x-2 w-full p-2 hover:bg-gray-50 rounded-md"
                    on:click={() => toggleMonth(`${year}-${month}`)}
                  >
                    {#if expandedMonths.has(`${year}-${month}`)}
                      <ChevronDown class="w-4 h-4" />
                    {:else}
                      <ChevronRight class="w-4 h-4" />
                    {/if}
                    <span>{monthName}</span>
                  </button>
                  
                  {#if expandedMonths.has(`${year}-${month}`)}
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
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="space-y-2">
        {#each weeksByYear as { year, weeks }}
          <div class="border-b border-gray-100 last:border-0">
            <button
              class="flex items-center space-x-2 w-full p-2 hover:bg-gray-50 rounded-md"
              on:click={() => toggleYear(year)}
            >
              {#if expandedYears.has(year)}
                <ChevronDown class="w-4 h-4" />
              {:else}
                <ChevronRight class="w-4 h-4" />
              {/if}
              <span class="font-medium">{year}</span>
            </button>
            
            {#if expandedYears.has(year)}
              <div class="ml-6 space-y-1">
                {#each weeks as { week, weekDates }}
                  <button
                    class="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm flex items-center justify-between"
                    on:click={() => onWeekSelect(week, year)}
                  >
                    <span>Week {week}</span>
                    <span class="text-xs text-gray-500">
                      {weekDates.start} to {weekDates.end}
                    </span>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
