<script>
  import { postPath } from "$lib/reddit-post.js";

  /**
   * @type {object[]}
   */
  export let posts = [];
  export let onSelectPost = () => {};
  export let selectedPostId = null;
  export let headerTitle = "";

  function openInReader(event, post) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    onSelectPost(post);
  }
</script>

<div class="relative">
  {#if headerTitle}
    <h2
      class=" font-semibold text-[#2759e7] p-3 bg-[#e6ecfd] sticky top-0 z-10"
    >
      {headerTitle}
    </h2>
  {/if}
  <div class="overflow-y-scroll">
    {#if posts.length === 0}
      <div class="text-center text-gray-500 py-4">
        No posts found for this period
      </div>
    {:else}
      <ol class="space-y-1">
        {#each posts as post, i}
          <li
            class="flex items-start px-4 py-2 hover:bg-gray-50"
            class:bg-blue-50={selectedPostId === post.postId}
          >
            <span class="text-gray-400 w-6">{i + 1}.</span>
            <div class="flex items-start gap-2 flex-wrap">
              <a
                href={postPath(post)}
                class="text-[#121212] no-underline hover:no-underline visited:text-[#121212] visited:no-underline"
                on:click={(event) => openInReader(event, post)}
              >
                {post.title}
                <span class="text-gray-500">🔥{post.score}</span>
              </a>
              <a
                href={postPath(post)}
                class="text-xs text-gray-400 hover:text-blue-600 hover:underline"
              >
                page
              </a>
            </div>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</div>
