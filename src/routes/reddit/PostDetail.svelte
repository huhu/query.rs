<script>
  export let post = null;

  function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }
</script>

{#if post}
  <div class="bg-white rounded-lg shadow-sm p-6 space-y-4">
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
          {formatDate(post.createdAt)}
        </div>
      </div>
    </div>

    {#if post.selftext}
      <div class="prose max-w-none">
        {post.selftext}
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
  <div class="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
    Select a post to view details
  </div>
{/if}
