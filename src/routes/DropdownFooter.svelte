<script>
  /** @type {import("querylib").Render } */
  export let render;
  /** @type {{ curr: number; total: number; }} */
  export let pagination;

  function pageUp() {
    setTimeout(() => {
      render.pageUp();
    });
  }
  function pageDown() {
    setTimeout(() => {
      render.pageDown();
    });
  }
</script>

<div class="flex flex-row items-center bg-[#fcfaf6] py-2 px-4 text-[15px]">
  <button
    class="px-4 rounded-md hover:bg-[#f9bc2d46]"
    class:text-gray-400={pagination.curr === 1}
    disabled={pagination.curr === 1}
    on:click={pageUp}
  >
    Prev
  </button>
  <button
    class="px-4 rounded-md hover:bg-[#f9bc2d46]"
    class:text-gray-400={pagination.curr === pagination.total}
    disabled={pagination.curr === pagination.total}
    on:click={pageDown}
  >
    Next
  </button>
  <div class="px-2"><code>{pagination.curr}/{pagination.total}</code></div>
</div>
