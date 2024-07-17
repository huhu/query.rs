<script>
  import { start, Omnibox } from "querylib";
  import { onMount } from "svelte";
  import Tour from "./Tour.svelte";
  import { page } from "$app/stores";

  /**
   * @type {Tour}
   */
  let tour;

  onMount(async () => {
    const omnibox = Omnibox.webpage({
      el: "#omnibox",
      icon: "/assets/icon.png",
      placeholder: `Search rust things instantly!`,
    });
    await start(omnibox);
    let query = $page.url.searchParams.get("q");
    if (query) {
      tour.triggerQuery(query);
    }
  });
</script>

<link rel="stylesheet" href="/css/omnibox.css" />
<div id="omnibox" class="w-full md:w-[85%] mx-[auto] my-[20px]"></div>
<Tour bind:this={tour} />
