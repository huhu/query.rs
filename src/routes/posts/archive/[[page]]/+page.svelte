<script>
  /** @type {import('./$types').PageData} */
  export let data;

  $: heading = data.page === 1 ? "Archive" : `Archive, page ${data.page}`;
</script>

<svelte:head>
  {#if data.prev}
    <link rel="prev" href={data.prev} />
  {/if}
  {#if data.next}
    <link rel="next" href={data.next} />
  {/if}
</svelte:head>

<div class="archive">
  <header class="archive-header">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span aria-hidden="true">·</span>
      <a href="/reddit">Reader</a>
    </nav>
    <h1>{heading}</h1>
    <p class="subtitle">r/rust discussions on Query.rs</p>
  </header>

  {#if data.posts.length === 0}
    <p class="empty">No posts yet.</p>
  {:else}
    <ol class="posts">
      {#each data.posts as post}
        <li>
          <a href={post.href}>
            <span class="title">{post.title}</span>
            <span class="meta">
              <span>{post.score} points</span>
              {#if post.createdAtLabel}
                <span aria-hidden="true">·</span>
                <time>{post.createdAtLabel}</time>
              {/if}
              {#if post.author}
                <span aria-hidden="true">·</span>
                <span>{post.author}</span>
              {/if}
            </span>
          </a>
        </li>
      {/each}
    </ol>
  {/if}

  {#if data.pageCount > 1}
    <nav class="pager" aria-label="Pagination">
      {#if data.prev}
        <a href={data.prev} rel="prev" class="step">Previous</a>
      {/if}
      <span class="pages">
        {#each data.pageLinks as link, i}
          {#if i > 0 && link.page > data.pageLinks[i - 1].page + 1}
            <span class="gap" aria-hidden="true">…</span>
          {/if}
          {#if link.page === data.page}
            <span aria-current="page" class="page current">{link.page}</span>
          {:else}
            <a href={link.href} class="page">{link.page}</a>
          {/if}
        {/each}
      </span>
      {#if data.next}
        <a href={data.next} rel="next" class="step">Next</a>
      {/if}
    </nav>
  {/if}
</div>

<style>
  .archive {
    box-sizing: border-box;
    background: white;
    border-radius: 10px;
    margin-bottom: 50px;
    min-height: calc(100vh - 180px);
    padding: 1.75rem 1.25rem 2.5rem;
  }

  @media (min-width: 768px) {
    .archive {
      padding: 2.5rem 2.75rem 3rem;
    }
  }

  .archive-header {
    max-width: 46rem;
    margin: 0 auto 1.5rem;
  }

  .crumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: #6b645b;
  }

  .crumbs a {
    padding: 0.2rem 0.45rem;
    border-radius: 6px;
    color: #3f3a34;
    text-decoration: none;
  }

  .crumbs a:hover {
    background: #f9bc2d46;
  }

  h1 {
    border-left: none;
    padding-left: 0;
  }

  .subtitle {
    margin-top: 0.75rem;
    color: #6b645b;
    font-size: 1rem;
  }

  .empty {
    max-width: 46rem;
    margin: 0 auto;
    color: #6b645b;
  }

  .posts {
    list-style: none;
    max-width: 46rem;
    margin: 0 auto;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .posts a {
    display: block;
    padding: 0.9rem 1rem;
    border-radius: 10px;
    background: #fcfaf6;
    border: 1px solid transparent;
    text-decoration: none;
    color: inherit;
  }

  .posts a:hover {
    background: #fff;
    border-color: #f9bc2d;
  }

  .title {
    display: block;
    font-size: 1.05rem;
    font-weight: 500;
    line-height: 1.4;
    color: #1f1c19;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.45rem;
    margin-top: 0.4rem;
    font-size: 0.85rem;
    color: #6b645b;
  }

  .pager {
    max-width: 46rem;
    margin: 1.75rem auto 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .pages {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
  }

  .step,
  .page {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.25rem;
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
    border: 1px solid #f0e4c4;
    background: #fcfaf6;
    color: #3f3a34;
    text-decoration: none;
    font-size: 0.875rem;
  }

  .step:hover,
  a.page:hover {
    background: #f9bc2d46;
    border-color: #f9bc2d;
  }

  .current {
    background: #f9bc2d;
    border-color: #f9bc2d;
    font-weight: 600;
  }

  .gap {
    color: #6b645b;
    padding: 0 0.15rem;
  }
</style>
