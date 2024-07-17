<script>
  import { start, Omnibox } from "querylib";
  import { onMount } from "svelte";
  import Tour from "./Tour.svelte";

  onMount(async () => {
    const omnibox = Omnibox.webpage({
      el: "#omnibox",
      icon: "/assets/icon.png",
      placeholder: `Search rust things instantly!`,
    });
    await start(omnibox);
  });
</script>

<link rel="stylesheet" href="/css/omnibox.css" />
<div id="omnibox" class="w-full md:w-[85%] mx-[auto] my-[20px]"></div>
<Tour />
