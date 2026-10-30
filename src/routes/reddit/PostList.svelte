<script>
  import { hasDiscussionBody, postPath } from "$lib/reddit-post.js";

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
      class="font-semibold text-band-ink p-3 bg-band sticky top-0 z-10"
    >
      {headerTitle}
    </h2>
  {/if}
  <div class="overflow-y-scroll">
    {#if posts.length === 0}
      <div class="text-center text-muted py-4">
        No posts found for this period
      </div>
    {:else}
      <ol class="space-y-1">
        {#each posts as post, i}
          <li
            class="flex items-start px-4 py-2 hover:bg-wash"
            class:bg-selected={selectedPostId === post.postId}
          >
            <span class="text-soft w-6">{i + 1}.</span>
            <a
              href={hasDiscussionBody(post.selftext) ? postPath(post) : undefined}
              class="text-ink no-underline hover:no-underline visited:text-ink visited:no-underline"
              on:click={(event) => openInReader(event, post)}
            >
              {post.title}
              <span class="text-muted">🔥{post.score}</span>
            </a>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</div>
