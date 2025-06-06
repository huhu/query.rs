<script>
  import { marked } from "marked";
  import DOMPurify from "dompurify";

  export let post = null;

  function renderMarkdown(text) {
    if (!text) return "";
    // Replace \n with actual newlines before parsing markdown
    const processedText = text
      .replace(/\\n/g, "\n")
      .replace(/\\\"/g, "\"")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    // Convert markdown to HTML and sanitize it
    const html = marked.parse(processedText);
    return DOMPurify.sanitize(html);
  }

  function isMediaUrl(url) {
    if (!url) return false;
    return (
      /\.(jpg|jpeg|png|gif|webp|mp4|webm)$/i.test(url) ||
      url.includes("i.imgur.com") ||
      url.includes("i.redd.it")
    );
  }

  // Configure marked options for Reddit-style markdown
  marked.use({
    breaks: true, // Convert line breaks to <br>
    gfm: true, // Enable GitHub Flavored Markdown
  });
</script>

{#if post}
  <div class="bg-white divide-y divide-gray-100 prose">
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
          <div class="text-gray-600">
            by <a
              href={`https://reddit.com/user/${post.author}`}
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium text-blue-600 hover:underline">{post.author}</a
            >
          </div>
          <div class="text-gray-500">
            {post.createdAt}
          </div>
        </div>
      </div>

      <!-- Links -->
      <div class="flex flex-wrap gap-3 text-sm">
        <a
          href={`https://reddit.com${post.permalink}`}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-gray-600 hover:text-blue-600"
        >
          <span>View on Reddit <span class="text-xs">↗</span></span>
        </a>
        {#if post.url && !post.url.includes("reddit.com")}
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 text-gray-600 hover:text-blue-600"
          >
            <span>External Link <span class="text-xs">↗</span></span>
          </a>
        {/if}
      </div>
    </div>

    <!-- Media content -->
    {#if post.url && isMediaUrl(post.url)}
      <div class="p-4">
        <div class="rounded-lg overflow-hidden bg-gray-50">
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
      <div class="p-4 prose prose-sm max-w-none">
        {@html renderMarkdown(post.selftext)}
      </div>
    {/if}

    <!-- Footer -->
    <div class="p-4">
      <div class="flex items-center gap-3 text-sm text-gray-600">
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
  <div class="flex items-center justify-center h-full text-gray-500">
    Select a post to view details
  </div>
{/if}

<style>
  /* Add styles for markdown content */
  :global(.prose) {
    @apply text-gray-800;
  }

  :global(.prose h1) {
    border-left: none !important;
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
