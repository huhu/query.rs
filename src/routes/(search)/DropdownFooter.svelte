<script>
  /** @type {import("querylib").Render } */
  export let render;
  /** @type {{ curr: number; total: number; }} */
  export let pagination;

  function pageUp() {
    setTimeout(async () => {
      await render.pageUp();
    });
  }
  function pageDown() {
    setTimeout(async () => {
      await render.pageDown();
    });
  }
</script>

<div class="flex flex-row items-center bg-canvas py-2 px-4 text-[15px] text-ink">
  <button
    class="px-4 rounded-md hover:bg-brand-soft"
    class:text-soft={pagination.curr === 1}
    disabled={pagination.curr === 1}
    on:click={pageUp}
  >
    Prev
  </button>
  <button
    class="px-4 rounded-md hover:bg-brand-soft"
    class:text-soft={pagination.curr === pagination.total}
    disabled={pagination.curr === pagination.total}
    on:click={pageDown}
  >
    Next
  </button>
  <div class="px-2"><code>{pagination.curr}/{pagination.total}</code></div>
</div>
