<script>
  import { start, Omnibox } from "$lib/index.js";
  import { onMount } from "svelte";
  import "omnibox-js/omnibox.css";

  onMount(async () => {
    const omnibox = Omnibox.webpage({
      el: "#omnibox",
      icon: "/assets/icon.png",
      placeholder: `Search rust things instantly!`,
    });
    await start(omnibox);
  });
</script>

<div id="omnibox" style="width: 85%; margin: 20px auto;"></div>
