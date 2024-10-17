<script>
  import { start, Omnibox } from "querylib";
  import { onMount } from "svelte";
  import DropdownFooter from "./DropdownFooter.svelte";
  import Tour from "./Tour.svelte";
  import { page } from "$app/stores";
  import { onNavigate } from "$app/navigation";

  /**
   * @type {Omnibox}
   */
  let omnibox;
  /**
   * @type {HTMLElement}
   */
  let omniboxRender;
  /**
   * @type {Tour}
   */
  let tour;

  onNavigate((navigation) => {
    if (navigation.from?.route.id === navigation.to?.route.id) {
      // Ignore the same route navigation
      return;
    }

    if (omnibox) {
      // Clear event listeners, otherwise, when switch route back,
      // onMount() would call again, led to strange behaviors
      // due to multiple event listeners have been registered.
      omnibox.render.clearListeners();
    }
  });

  onMount(async () => {
    omnibox = Omnibox.webpage({
      element: omniboxRender,
      icon: "/assets/icon.png",
      onFooter: (
        /** @type {import("querylib").Render } */ render,
        /** @type {{ curr: number; total: number; }} */ pagination
      ) => {
        let footer = document.createElement("div");
        new DropdownFooter({
          target: footer,
          props: {
            render,
            pagination,
          },
        });
        return footer;
      },
    });
    await start(omnibox);
    let query = $page.url.searchParams.get("q");
    if (query) {
      tour.triggerQuery(query);
    }
  });
</script>

<div class="relative w-full md:w-[80%] mx-[auto] my-[20px]">
  <div
    bind:this={omniboxRender}
    class="omn-container dark:bg-darkBgPrimary dark:text-darkTextPrimary"
  >
    <textarea
      class="omn-input dark:bg-darkBgPrimary"
      autocapitalize="off"
      autocomplete="off"
      autocorrect="off"
      maxlength="2048"
      role="combobox"
      rows="1"
      style="resize:none"
      spellcheck="false"
      placeholder="Search rust things instantly!"
      autofocus
    />
    <div class="omn-clear">
      <svg
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="@apply dark:fill-white"
      >
        <path
          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        ></path>
      </svg>
    </div>
    <div class="omn-search-icon">
      <svg
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        class="dark:fill-[#ffffff]"
      >
        <path
          d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        >
        </path>
      </svg>
    </div>
  </div>
</div>
<Tour bind:this={tour} />
<div class="text-center mt-6 md:mt-10 mx-auto text-wrap dark:text-darkTextPrimary">
  Love query.rs?
  <a
    class="dark:text-darkTextPrimary dark:visited:text-darkTextPrimary"
    href="https://github.com/huhu/query.rs">Star us on GitHub</a
  >, or
  <a class="dark:text-darkTextPrimary" href="https://discord.gg/rPWWBqxBhp"
    >Join our Discord!</a
  >
</div>
