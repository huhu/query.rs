<script>
  /**
   * @type {object[]}
   */
  export let posts = [];
  export let onSelectPost = (post) => {};
  export let selectedPostId = null;
  export let headerTitle = "";
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
            class="flex items-start px-4 py-2 hover:bg-gray-50 cursor-pointer"
            class:bg-blue-50={selectedPostId === post.postId}
            on:click={() => onSelectPost(post)}
          >
            <span class="text-gray-400 w-6">{i + 1}.</span>
            <div class="flex items-center gap-2 flex-wrap">
              <span class=" text-blue-500">
                {post.title}
                <span class="text-gray-500">🔥{post.score}</span>
              </span>
            </div>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</div>
