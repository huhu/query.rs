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

<div class="article-page">
  <article>
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span aria-hidden="true">·</span>
      <a href="/posts/archive">Archive</a>
      <span aria-hidden="true">·</span>
      <a href="/reddit">Reader</a>
    </nav>

    <h1>{post.title}</h1>

    <div class="meta">
      <span class="chip">{post.score} points</span>
      {#if post.author}
        <a
          class="chip"
          href={`https://reddit.com/user/${encodeURIComponent(post.author)}`}
          rel="ugc noopener noreferrer"
        >{post.author}</a>
      {/if}
      {#if post.createdAtLabel}
        <time class="chip" datetime={post.publishedTime || undefined}>{post.createdAtLabel}</time>
      {/if}
      {#if post.numComments !== null}
        <span class="chip">{post.numComments} comments</span>
      {/if}
    </div>

    {#if post.redditUrl || post.externalUrl}
      <div class="actions">
        {#if post.redditUrl}
          <a href={post.redditUrl} rel="ugc noopener noreferrer">View on Reddit ↗</a>
        {/if}
        {#if post.externalUrl}
          <a href={post.externalUrl} rel="ugc noopener noreferrer">External link ↗</a>
        {/if}
      </div>
    {/if}

    {#if post.mediaUrl}
      <div class="media">
        {#if post.video}
          <!-- svelte-ignore a11y-media-has-caption -->
          <video controls>
            <source
              src={post.mediaUrl}
              type="video/{post.mediaUrl.split('.').pop().toLowerCase()}"
            />
            Your browser does not support the video tag.
          </video>
        {:else}
          <img src={post.mediaUrl} alt={post.title} />
        {/if}
      </div>
    {/if}

    {#if post.bodyHtml}
      <div class="prose">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -- markdown is escaped and URL-restricted before render -->
        {@html post.bodyHtml}
      </div>
    {:else if post.externalUrl}
      <p class="fallback">
        This r/rust thread points to
        <a href={post.externalUrl} rel="ugc noopener noreferrer">{post.externalUrl}</a>.
      </p>
    {/if}
  </article>
</div>

<style>
  .article-page {
    box-sizing: border-box;
    background: white;
    border-radius: 10px;
    margin-bottom: 50px;
    min-height: calc(100vh - 180px);
    padding: 1.75rem 1.25rem 3rem;
  }

  @media (min-width: 768px) {
    .article-page {
      padding: 2.75rem 2.5rem 3.5rem;
    }
  }

  article {
    max-width: 42rem;
    margin: 0 auto;
  }

  .crumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    color: #6b645b;
  }

  .crumbs a,
  .actions a,
  .fallback a,
  .meta a {
    text-decoration: none;
  }

  .crumbs a {
    padding: 0.2rem 0.45rem;
    border-radius: 6px;
    color: #3f3a34;
  }

  .crumbs a:hover,
  .actions a:hover,
  .meta a:hover {
    background: #f9bc2d46;
  }

  h1 {
    font-size: 1.85rem;
    line-height: 1.25;
    font-weight: 600;
    margin-bottom: 1.1rem;
    border-left: none;
    padding-left: 0;
  }

  @media (min-width: 768px) {
    h1 {
      font-size: 2.15rem;
    }
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin-bottom: 1.25rem;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    padding: 0.28rem 0.7rem;
    border-radius: 999px;
    background: #fcfaf6;
    border: 1px solid #f0e4c4;
    color: #3f3a34;
    font-size: 0.85rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .actions a {
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    background: #f9bc2d;
    color: #1f1c19;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .media {
    margin: 0 0 1.75rem;
    padding: 0.5rem;
    border-radius: 12px;
    background: #fcfaf6;
    border: 1px solid #f0e4c4;
    overflow: hidden;
  }

  .media img,
  .media video {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 8px;
  }

  .fallback {
    color: #3f3a34;
    line-height: 1.6;
  }

  .fallback a {
    color: #1f1c19;
    border-bottom: 1px solid #f9bc2d;
  }

  :global(.article-page .prose) {
    color: #1f2937;
    font-size: 1.05rem;
    line-height: 1.7;
  }

  :global(.article-page .prose h1) {
    border-left: none !important;
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 1.75rem;
    margin-bottom: 0.75rem;
    padding-left: 0;
  }

  :global(.article-page .prose h2) {
    font-size: 1.3rem;
    font-weight: 700;
    margin-top: 1.5rem;
    margin-bottom: 0.6rem;
  }

  :global(.article-page .prose h3) {
    font-size: 1.125rem;
    font-weight: 700;
    margin-top: 1.25rem;
    margin-bottom: 0.45rem;
  }

  :global(.article-page .prose p) {
    margin-top: 0.85rem;
    margin-bottom: 0.85rem;
  }

  :global(.article-page .prose a) {
    color: #1f1c19;
    text-decoration: none;
    border-bottom: 1px solid #f9bc2d;
  }

  :global(.article-page .prose a:hover) {
    background: #f9bc2d46;
  }

  :global(.article-page .prose ul) {
    list-style: disc;
    padding-left: 1.25rem;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }

  :global(.article-page .prose ol) {
    list-style: decimal;
    padding-left: 1.25rem;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
  }

  :global(.article-page .prose code) {
    background: #fcfaf6;
    padding: 0.125rem 0.3rem;
    border-radius: 0.25rem;
    font-size: 0.9em;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  :global(.article-page .prose pre) {
    background: #fcfaf6;
    border: 1px solid #f0e4c4;
    padding: 0.9rem 1rem;
    border-radius: 10px;
    margin-top: 1rem;
    margin-bottom: 1rem;
    overflow-x: auto;
  }

  :global(.article-page .prose pre code) {
    background: transparent;
    padding: 0;
  }

  :global(.article-page .prose blockquote) {
    border-left: 4px solid #f9bc2d;
    background: #fcfaf6;
    padding: 0.35rem 0 0.35rem 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
    color: #4b5563;
  }

  :global(.article-page .prose img) {
    max-width: 100%;
    height: auto;
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
    border-radius: 8px;
  }

  :global(.article-page .prose hr) {
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    border-color: #f0e4c4;
  }
</style>
