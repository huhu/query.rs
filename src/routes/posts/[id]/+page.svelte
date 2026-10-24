<script>
  import { jsonLd } from "$lib/reddit-post.js";

  /** @type {import('./$types').PageData} */
  export let data;

  $: post = data.post;
  $: seo = data.seo;
  const jsonLdClose = "<" + "/script>";
  $: structuredData = jsonLd({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: seo.description,
    datePublished: post.publishedTime || undefined,
    author: post.author
      ? { "@type": "Person", name: post.author }
      : undefined,
    url: seo.canonical,
    mainEntityOfPage: seo.canonical,
    image: seo.image,
    publisher: {
      "@type": "Organization",
      name: "Query.rs",
      url: "https://query.rs",
    },
  });
  $: jsonLdScript =
    '<script type="application/ld+json">' + structuredData + jsonLdClose;
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD is produced by JSON.stringify -->
  {@html jsonLdScript}
</svelte:head>

<div
  class="box-border bg-[white] relative rounded-[10px] mb-[50px] min-h-[calc(100vh_-_180px)]"
>
  <article class="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
    <p class="mb-4 text-sm">
      <a href="/reddit" class="text-blue-600 hover:underline">Reddit posts</a>
    </p>

    <h1 class="mb-4">{post.title}</h1>

    <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
      <div>
        <span role="img" aria-label="fire">🔥</span>
        <span class="font-medium text-gray-800">{post.score} points</span>
      </div>
      {#if post.author}
        <div>
          by <a
            href={`https://reddit.com/user/${encodeURIComponent(post.author)}`}
            rel="noopener noreferrer"
            class="font-medium text-blue-600 hover:underline">{post.author}</a
          >
        </div>
      {/if}
      {#if post.createdAtLabel}
        <time datetime={post.publishedTime || undefined}>{post.createdAtLabel}</time>
      {/if}
    </div>

    <div class="flex flex-wrap gap-3 text-sm mb-4">
      {#if post.redditUrl}
        <a
          href={post.redditUrl}
          rel="noopener noreferrer"
          class="text-gray-600 hover:text-blue-600"
        >
          View on Reddit <span class="text-xs">↗</span>
        </a>
      {/if}
      {#if post.externalUrl}
        <a
          href={post.externalUrl}
          rel="noopener noreferrer"
          class="text-gray-600 hover:text-blue-600"
        >
          External link <span class="text-xs">↗</span>
        </a>
      {/if}
    </div>

    {#if post.mediaUrl}
      <div class="mb-4 rounded-lg overflow-hidden bg-gray-50">
        {#if post.video}
          <!-- svelte-ignore a11y-media-has-caption -->
          <video controls class="w-full">
            <source
              src={post.mediaUrl}
              type="video/{post.mediaUrl.split('.').pop().toLowerCase()}"
            />
            Your browser does not support the video tag.
          </video>
        {:else}
          <img src={post.mediaUrl} alt={post.title} class="w-full h-auto" />
        {/if}
      </div>
    {/if}

    {#if post.bodyHtml}
      <div class="prose prose-sm max-w-none">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- markdown is escaped and URL-restricted before render -->
        {@html post.bodyHtml}
      </div>
    {:else if post.externalUrl}
      <p class="text-gray-700">
        This r/rust thread points to
        <a href={post.externalUrl} rel="noopener noreferrer" class="text-blue-600 hover:underline"
          >{post.externalUrl}</a
        >.
      </p>
    {/if}

    {#if post.numComments !== null}
      <p class="mt-6 text-sm text-gray-600">
        <span role="img" aria-label="comments">💬</span>
        {post.numComments} comments
      </p>
    {/if}
  </article>
</div>

<style>
  :global(.prose) {
    color: #1f2937;
  }

  :global(.prose h1) {
    border-left: none !important;
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  :global(.prose h2) {
    font-size: 1.25rem;
    font-weight: 700;
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
  }

  :global(.prose h3) {
    font-size: 1.125rem;
    font-weight: 700;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  :global(.prose p) {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }

  :global(.prose a) {
    color: #3b82f6;
  }

  :global(.prose a:hover) {
    text-decoration: underline;
  }

  :global(.prose ul) {
    list-style: disc;
    padding-left: 1.25rem;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }

  :global(.prose ol) {
    list-style: decimal;
    padding-left: 1.25rem;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }

  :global(.prose code) {
    background: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  :global(.prose pre) {
    background: #f3f4f6;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    overflow-x: auto;
  }

  :global(.prose pre code) {
    background: transparent;
    padding: 0;
  }

  :global(.prose blockquote) {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    color: #4b5563;
  }

  :global(.prose img) {
    max-width: 100%;
    height: auto;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    border-radius: 0.25rem;
  }

  :global(.prose hr) {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    border-color: #e5e7eb;
  }
</style>
