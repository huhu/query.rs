<script>
  import { hasDiscussionBody, isMediaUrl, postPath, renderMarkdown } from "$lib/reddit-post.js";

  export let post = null;
</script>

{#if post}
  <div class="reader bg-surface divide-y divide-line-subtle">
    <!-- Header section -->
    <div class=" p-4 space-y-4">
      <!-- Title and metadata -->
      <div class="space-y-3">
        <div class="text-2xl font-bold">{post.title}</div>

        <div class="flex justify-between items-center gap-x-4 gap-y-2 text-sm">
          <div class="flex items-center gap-1.5">
            <span role="img" aria-label="fire" class="text-orange-500">🔥</span>
            <span class="font-medium">{post.score} points</span>
          </div>
          <div class="text-secondary">
            by <a
              href={`https://reddit.com/user/${post.author}`}
              target="_blank"
              rel="ugc noopener noreferrer"
              class="font-medium text-link hover:underline">{post.author}</a
            >
          </div>
          <div class="text-muted">
            {post.createdAt}
          </div>
        </div>
      </div>

      <!-- Links -->
      <div class="flex flex-wrap gap-3 text-sm">
        {#if hasDiscussionBody(post.selftext)}
          <a
            href={postPath(post)}
            class="inline-flex items-center gap-1.5 text-secondary hover:text-link"
          >
            <span>Open page</span>
          </a>
        {/if}
        <a
          href={`https://reddit.com${post.permalink}`}
          target="_blank"
          rel="ugc noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-secondary hover:text-link"
        >
          <span>View on Reddit <span class="text-xs">↗</span></span>
        </a>
        {#if post.url && !post.url.includes("reddit.com")}
          <a
            href={post.url}
            target="_blank"
            rel="ugc noopener noreferrer"
            class="inline-flex items-center gap-1.5 text-secondary hover:text-link"
          >
            <span>External Link <span class="text-xs">↗</span></span>
          </a>
        {/if}
      </div>
    </div>

    <!-- Media content -->
    {#if post.url && isMediaUrl(post.url)}
      <div class="p-4">
        <div class="rounded-lg overflow-hidden bg-wash">
          {#if post.url.match(/\.(mp4|webm)$/i)}
            <video controls class="w-full">
              <source
                src={post.url}
                type="video/{post.url.split('.').pop().toLowerCase()}"
              />
              Your browser does not support the video tag.
            </video>
          {:else}
            <img src={post.url} alt="Post content" class="w-full h-auto" />
          {/if}
        </div>
      </div>
    {/if}

    <!-- Text content -->
    {#if post.selftext}
      <div class="p-4 max-w-none">
        {@html renderMarkdown(post.selftext)}
      </div>
    {/if}

    <!-- Footer -->
    <div class="p-4">
      <div class="flex items-center gap-3 text-sm text-secondary">
        {#if post.numComments !== null}
          <div class="flex items-center gap-1.5">
            <span role="img" aria-label="comments">💬</span>
            <span>{post.numComments} comments</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center h-full text-muted">
    Select a post to view details
  </div>
{/if}

<style>
  /* Add styles for markdown content */
  :global(.reader) {
    @apply text-prose;
  }

  :global(.reader h1) {
    border-left: none !important;
    @apply text-2xl font-bold mt-6 mb-4;
  }

  :global(.reader h2) {
    @apply text-xl font-bold mt-5 mb-3;
  }

  :global(.reader h3) {
    @apply text-lg font-bold mt-4 mb-2;
  }

  :global(.reader p) {
    @apply my-3;
  }

  :global(.reader a) {
    color: var(--link);
  }

  :global(.reader a:hover) {
    text-decoration: underline;
  }

  :global(.reader ul) {
    @apply list-disc pl-5 my-3;
  }

  :global(.reader ol) {
    @apply list-decimal pl-5 my-3;
  }

  :global(.reader code),
  :global(.reader pre) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  :global(.reader code) {
    @apply bg-code px-1 py-0.5 rounded text-sm;
  }

  :global(.reader pre) {
    @apply bg-code border border-line-subtle p-3 rounded my-3 overflow-x-auto;
  }

  :global(.reader pre code) {
    @apply bg-transparent p-0;
  }

  :global(.reader blockquote) {
    @apply border-l-4 border-line pl-4 my-3 text-secondary;
  }

  :global(.reader img) {
    @apply max-w-full h-auto my-3 rounded;
  }

  :global(.reader hr) {
    @apply my-6 border-line;
  }
</style>
