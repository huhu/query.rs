<script>
  import { marked } from "marked";
  import DOMPurify from "dompurify";

  export let post = null;

  function renderMarkdown(text) {
    if (!text) return "";
    // Convert markdown to HTML and sanitize it
    const html = marked.parse(text);
    return DOMPurify.sanitize(html);
  }

  // Configure marked options for Reddit-style markdown
  marked.use({
    breaks: true, // Convert line breaks to <br>
    gfm: true, // Enable GitHub Flavored Markdown
  });
</script>

{#if post}
  <div class="bg-white p-6 space-y-4">
    <div class="space-y-2">
      <h2 class="text-xl font-bold">{post.title}</h2>

      <div class="flex items-center gap-4 text-sm text-gray-600">
        <div class="flex items-center gap-1">
          <span role="img" aria-label="fire" class="text-orange-500">🔥</span>
          <span class="font-medium">{post.score} points</span>
        </div>
        <div>
          by <span class="font-medium">{post.author}</span>
        </div>
        <div>
          {post.createdAt}
        </div>
      </div>
    </div>

    {#if post.selftext}
      <div class="prose max-w-none">
        {@html renderMarkdown(post.selftext)}
      </div>
    {/if}

    <div class="flex items-center gap-4 text-sm">
      <div class="flex items-center gap-1">
        <span role="img" aria-label="comments">💬</span>
        <span>{post.numComments} comments</span>
      </div>

      <a
        href={`https://reddit.com${post.permalink}`}
        target="_blank"
        rel="noopener noreferrer"
        class="text-blue-500 hover:underline"
      >
        View on Reddit
      </a>

      {#if post.url && !post.url.includes("reddit.com")}
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-500 hover:underline"
        >
          External Link
        </a>
      {/if}
    </div>
  </div>
{:else}
  <div class="bg-white p-6 text-center text-gray-500">
    Select a post to view details
  </div>
{/if}

<style>
  /* Add styles for markdown content */
  :global(.prose) {
    @apply text-gray-800;
  }

  :global(.prose h1) {
    @apply text-2xl font-bold mt-6 mb-4;
  }

  :global(.prose h2) {
    @apply text-xl font-bold mt-5 mb-3;
  }

  :global(.prose h3) {
    @apply text-lg font-bold mt-4 mb-2;
  }

  :global(.prose p) {
    @apply my-3;
  }

  :global(.prose a) {
    @apply text-blue-500 hover:underline;
  }

  :global(.prose ul) {
    @apply list-disc pl-5 my-3;
  }

  :global(.prose ol) {
    @apply list-decimal pl-5 my-3;
  }

  :global(.prose code) {
    @apply bg-gray-100 px-1 py-0.5 rounded text-sm font-mono;
  }

  :global(.prose pre) {
    @apply bg-gray-100 p-3 rounded my-3 overflow-x-auto;
  }

  :global(.prose pre code) {
    @apply bg-transparent p-0;
  }

  :global(.prose blockquote) {
    @apply border-l-4 border-gray-200 pl-4 my-3 text-gray-600;
  }

  :global(.prose img) {
    @apply max-w-full h-auto my-3 rounded;
  }

  :global(.prose hr) {
    @apply my-6 border-gray-200;
  }
</style>
