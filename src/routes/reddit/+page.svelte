<script>
  import RedditSidebar from "./RedditSidebar.svelte";
  import PostList from "./PostList.svelte";
  import PostDetail from "./PostDetail.svelte";
  import { onMount } from "svelte";

  let posts = [];
  let loading = false;
  let error = null;
  let selectedPost = null;

  async function fetchPosts(start, end) {
    loading = true;
    error = null;
    selectedPost = null;

    try {
      const params = new URLSearchParams({
        start,
        end: end || start,
      });

      const response = await fetch(`/posts?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      posts = await response.json();
    } catch (e) {
      error = e.message;
      posts = [];
    } finally {
      loading = false;
    }
  }

  function handleSelectPost(post) {
    selectedPost = post;
  }

  async function handleDateSelect(date) {
    await fetchPosts(date);
  }

  async function handleWeekSelect(weekNum, year) {
    const weekStart = new Date(year, 0, 1 + (weekNum - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const start = weekStart.toISOString().split("T")[0];
    const end = weekEnd.toISOString().split("T")[0];

    await fetchPosts(start, end);
  }

  onMount(async () => {
    const today = new Date().toISOString().split("T")[0];
    await fetchPosts(today);
  });
</script>

<div class="flex flex-row">
  <RedditSidebar
    onDateSelect={handleDateSelect}
    onWeekSelect={handleWeekSelect}
  />

  <div class="flex-1 max-w-xl">
    {#if loading}
      <div class="flex justify-center items-center h-32">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
        ></div>
      </div>
    {:else if error}
      <div class="p-4 text-red-500 bg-red-50">
        Error loading posts: {error}
      </div>
    {:else}
      <PostList
        {posts}
        onSelectPost={handleSelectPost}
        selectedPostId={selectedPost?.postId}
      />
    {/if}
  </div>

  <div class="flex-1 max-w-xl">
    <PostDetail post={selectedPost} />
  </div>
</div>
