<script>
  /**
   * @type {object[]}
   */
  export let posts = [];
  export let onSelectPost = (post) => {};
  export let selectedPostId = null;

  function formatTitle(post) {
    let title = post.title;
    if (post.url.match(/\.(gif|jpe?g|png|mp4)$/i)) {
      title = `[Media] ${title}`;
    }
    return title;
  }
</script>

<div class="p-6 overflow-y-scroll">
  {#if posts.length === 0}
    <div class="text-center text-gray-500 py-8">
      No posts found for this period
    </div>
  {:else}
    <ol class="space-y-4">
      {#each posts as post, i}
        <li
          class="flex items-start gap-2 p-2 hover:bg-gray-50 cursor-pointer"
          class:bg-blue-50={selectedPostId === post.postId}
          on:click={() => onSelectPost(post)}
        >
          <span class="text-gray-700 font-medium">{i + 1}.</span>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-blue-500 font-medium">
              {formatTitle(post)}
            </span>

            <div class="flex items-center gap-1">
              <span role="img" aria-label="fire" class="text-orange-500"
                >🔥</span
              >
              <span class="font-medium">{post.score}</span>
            </div>
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</div>
