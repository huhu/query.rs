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
      // Select the first post by default if available
      if (posts.length > 0) {
        selectedPost = posts[0];
      }
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

  // Single date selection
  async function handleDateSelect(date) {
    await fetchPosts(date);
  }

  // Week selection (start and end dates provided)
  async function handleWeekSelect(start, end) {
    await fetchPosts(start, end);
  }

  // Month selection (start and end dates provided)
  async function handleMonthSelect(start, end) {
    await fetchPosts(start, end);
  }

  // Year selection (start and end dates provided)
  async function handleYearSelect(start, end) {
    await fetchPosts(start, end);
  }

  onMount(async () => {
    const today = new Date().toISOString().split("T")[0];
    await fetchPosts(today);
  });
</script>

<div class="flex flex-row h-[80vh]">
  <div class="h-[80vh] overflow-y-auto">
    <RedditSidebar
      onDateSelect={handleDateSelect}
      onWeekSelect={handleWeekSelect}
      onMonthSelect={handleMonthSelect}
      onYearSelect={handleYearSelect}
    />
  </div>

  <div class="flex-1 max-w-xl h-[80vh] overflow-y-auto">
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

  <div class="flex-1 max-w-xl h-[80vh] overflow-y-auto">
    <PostDetail post={selectedPost} />
  </div>
</div>
