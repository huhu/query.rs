<script>
  import RedditSidebar from "./Sidebar.svelte";
  import PostList from "./PostList.svelte";
  import PostDetail from "./PostDetail.svelte";
  import { Search } from "lucide-svelte";
  import { onMount } from "svelte";

  let posts = [];
  let loading = false;
  let error = null;
  let selectedPost = null;
  let headerTitle = "";
  let searchQuery = "";
  let isSearching = false;

  async function fetchPosts(start, end) {
    if (isSearching) return; // Don't fetch if we're in search mode

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
      posts = posts.map((post) => {
        return {
          ...post,
          title: formatTitle(post),
          createdAt: post.createdAt.replace("T", " "),
        };
      });

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

  async function performSearch(query) {
    loading = true;
    error = null;
    selectedPost = null;
    isSearching = true;

    try {
      const response = await fetch(
        `/posts/search?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      posts = await response.json();
      if (posts.length > 0) {
        selectedPost = posts[0];
      }
      headerTitle = `Search Results: "${query}" (${posts.length} results)`;
    } catch (e) {
      error = e.message;
      posts = [];
    } finally {
      loading = false;
    }
  }

  async function handleSearch(event) {
    if (event.key === "Enter" && searchQuery.trim()) {
      updateSearchParam(searchQuery.trim());
      await performSearch(searchQuery.trim());
    } else if (event.key === "Enter" && !searchQuery.trim()) {
      updateSearchParam("");
      isSearching = false;
      const today = new Date().toISOString().split("T")[0];
      await fetchPosts(today);
    }
  }

  function formatTitle(post) {
    let title = post.title
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");

    if (
      post.url.match(/\.(gif|jpe?g|png|mp4)$/i) &&
      title.indexOf("[Media]") === -1
    ) {
      title = `[Media] ${title}`;
    }
    return title;
  }

  function handleSelectPost(post) {
    selectedPost = post;
  }

  // Single date selection
  async function handleDateSelect(date) {
    isSearching = false;
    const selectedDate = new Date(date);
    headerTitle = `Top Posts on ${selectedDate.toLocaleDateString()}`;
    await fetchPosts(date);
  }

  // Week selection (start and end dates provided)
  async function handleWeekSelect(start, end) {
    isSearching = false;
    const startDate = new Date(start);
    const endDate = new Date(end);
    headerTitle = `Top Posts for Week ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    await fetchPosts(start, end);
  }

  // Month selection (start and end dates provided)
  async function handleMonthSelect(start, end) {
    isSearching = false;
    const [year, month] = start.split("-").map(Number);
    const startDate = new Date(year, month - 1); // Subtract 1 from month to convert to 0-based

    await fetchPosts(start, end);
    headerTitle = `Top ${posts.length} Posts in ${startDate.toLocaleString("default", { month: "long", year: "numeric" })}`;
  }

  // Year selection
  async function handleYearSelect(year) {
    isSearching = false;
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;
    headerTitle = `Top Posts in ${year}`;
    await fetchPosts(start, end);
  }

  function updateSearchParam(query) {
    const url = new URL(window.location);
    if (query) {
      url.searchParams.set("q", query);
    } else {
      url.searchParams.delete("q");
    }
    window.history.pushState({}, "", url);
  }

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get("q");

    if (queryParam) {
      searchQuery = queryParam;
      await performSearch(queryParam);
    } else {
      const today = new Date().toISOString().split("T")[0];
      await fetchPosts(today);
    }
  });
</script>

<div class="flex flex-row h-[80vh]">
  <div class="relative w-52 border-r border-gray-200">
    <div class="h-full p-2 overflow-y-auto pb-10">
      <div class="flex items-center relative">
        <input
          type="text"
          bind:value={searchQuery}
          on:keydown={handleSearch}
          placeholder="Search posts..."
          class="w-full p-1 px-2 border rounded-md"
        />
        <Search class="w-5 h-5 absolute right-3 text-gray-400" />
      </div>
      <RedditSidebar
        onDateSelect={handleDateSelect}
        onWeekSelect={handleWeekSelect}
        onMonthSelect={handleMonthSelect}
        onYearSelect={handleYearSelect}
      />
    </div>
    <div
      class="absolute bg-white bottom-0 left-0 right-0 p-2 text-xs text-gray-400 border-t"
    >
      Note: Only posts with score ≥ 50 are collected. Data cutoff: 2021-11-23
    </div>
  </div>

  <div
    class="flex-1 max-w-xl h-[80vh] overflow-y-auto border-r border-gray-200"
  >
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
        {headerTitle}
        onSelectPost={handleSelectPost}
        selectedPostId={selectedPost?.postId}
      />
    {/if}
  </div>

  <div class="flex-1 max-w-xl h-[80vh] overflow-y-auto">
    <PostDetail post={selectedPost} />
  </div>
</div>
