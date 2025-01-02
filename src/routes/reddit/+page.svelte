<script>
  import RedditSidebar from "./RedditSidebar.svelte";
  import PostList from "./PostList.svelte";
  import { onMount } from 'svelte';

  let posts = [];
  let loading = false;
  let error = null;

  async function fetchPosts(start, end) {
    loading = true;
    error = null;
    
    try {
      const params = new URLSearchParams({
        start,
        end: end || start // if end is not provided, use start date (for single day view)
      });
      
      const response = await fetch(`/posts?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      posts = data.map(post => ({
        title: post.title,
        link: `https://reddit.com${post.permalink}`,
        score: post.score,
        hasMedia: post.url.match(/\.(gif|jpe?g|png|mp4)$/i) !== null,
        hasEmoji: false
      }));
    } catch (e) {
      error = e.message;
      posts = [];
    } finally {
      loading = false;
    }
  }

  async function handleDateSelect(date) {
    await fetchPosts(date);
  }

  async function handleWeekSelect(weekNum, year) {
    const weekStart = new Date(year, 0, 1 + (weekNum - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const start = weekStart.toISOString().split('T')[0];
    const end = weekEnd.toISOString().split('T')[0];
    
    await fetchPosts(start, end);
  }

  onMount(async () => {
    // Fetch today's posts by default
    const today = new Date().toISOString().split('T')[0];
    await fetchPosts(today);
  });
</script>

<div class="min-h-screen bg-gray-50">
  <div class="flex flex-row gap-4">
    <RedditSidebar 
      onDateSelect={handleDateSelect}
      onWeekSelect={handleWeekSelect}
    />
    
    <div class="flex-1">
      {#if loading}
        <div class="flex justify-center items-center h-32">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      {:else if error}
        <div class="p-4 text-red-500 bg-red-50 rounded-lg">
          Error loading posts: {error}
        </div>
      {:else}
        <PostList {posts} />
      {/if}
    </div>
  </div>
</div>
