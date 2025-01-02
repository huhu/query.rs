<script>
    /**
     * @type {object[]}
     */
    export let posts = [];
  
    /**
     * @param {object} post
     */
    function formatTitle(post) {
      let title = post.title;
      if (post.hasMedia) {
        title = `[Media] ${title}`;
      }
      return title;
    }
  </script>
  
  <div class="p-6 rounded-lg bg-white shadow-sm">
    {#if posts.length === 0}
      <div class="text-center text-gray-500 py-8">
        No posts found for this period
      </div>
    {:else}
      <ol class="space-y-4">
        {#each posts as post, i}
          <li class="flex items-start gap-2">
            <span class="text-gray-700 font-medium">{i + 1}.</span>
            <div class="flex items-center gap-2 flex-wrap">
              <a 
                href={post.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                class="text-blue-500 hover:underline font-medium"
              >
                {formatTitle(post)}
              </a>
  
              {#if post.hasEmoji}
                <span role="img" aria-label="party">🎉</span>
              {/if}
  
              <div class="flex items-center gap-1">
                <span role="img" aria-label="fire" class="text-orange-500">🔥</span>
                <span class="font-medium">{post.score}</span>
              </div>
            </div>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
