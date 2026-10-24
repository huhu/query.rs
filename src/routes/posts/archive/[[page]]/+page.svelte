<script>
  /** @type {import('./$types').PageData} */
  export let data;

  $: heading = data.page === 1 ? "Reddit posts" : `Reddit posts, page ${data.page}`;
</script>

<svelte:head>
  {#if data.prev}
    <link rel="prev" href={data.prev} />
  {/if}
  {#if data.next}
    <link rel="next" href={data.next} />
  {/if}
</svelte:head>

<div
  class="box-border bg-[white] relative rounded-[10px] mb-[50px] min-h-[calc(100vh_-_180px)]"
>
  <div class="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
    <p class="mb-4 text-sm">
      <a href="/reddit" class="text-blue-600 hover:underline">Reader</a>
    </p>

    <h1 class="mb-6">{heading}</h1>

    {#if data.posts.length === 0}
      <p class="text-gray-600">No posts yet.</p>
    {:else}
      <ol class="divide-y divide-gray-100">
        {#each data.posts as post}
          <li class="py-3">
            <a href={post.href} class="text-blue-700 hover:underline">{post.title}</a>
            <p class="mt-1 text-sm text-gray-500">
              {post.score} points{#if post.createdAtLabel}
                · {post.createdAtLabel}{/if}
            </p>
          </li>
        {/each}
      </ol>
    {/if}

    {#if data.pageCount > 1}
      <nav class="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" aria-label="Pagination">
        {#if data.prev}
          <a href={data.prev} rel="prev" class="text-blue-600 hover:underline">Previous</a>
        {/if}
        {#each data.pageLinks as link, i}
          {#if i > 0 && link.page > data.pageLinks[i - 1].page + 1}
            <span aria-hidden="true">…</span>
          {/if}
          {#if link.page === data.page}
            <span aria-current="page" class="font-medium text-gray-900">{link.page}</span>
          {:else}
            <a href={link.href} class="text-blue-600 hover:underline">{link.page}</a>
          {/if}
        {/each}
        {#if data.next}
          <a href={data.next} rel="next" class="text-blue-600 hover:underline">Next</a>
        {/if}
      </nav>
    {/if}
  </div>
</div>
