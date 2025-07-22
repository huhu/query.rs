<script>
  import { page } from "$app/stores";
  import "../app.css";

  const menus = [
    {
      name: "Search",
      path: "/",
    },
    {
      name: "Reddit Posts 🔥",
      path: "/reddit",
    },
    {
      name: "GitHub",
      path: "https://github.com/huhu/query.rs",
    },
    {
      name: "Geddle",
      path: "https://geddle.com",
    },
  ];
</script>

<div class="flex-layout" style="flex-direction: column;">
  <div class="max-w-[1160px] w-full flex flex-col">
    <div class="flex flex-col md:flex-row md:justify-between items-center">
      <a href="/"
        ><img
          src="/assets/logo.svg"
          alt="logo"
          class="w-32 m-4"
          class:hidden={$page.url.pathname !== "/reddit"}
        />
      </a>
      <ul
        class="flex list-none flex-row justify-center overflow-auto md:self-end py-5 text-base md:text-xl"
      >
        {#each menus as menu}
          <li class="px-5 rounded-md hover:bg-[#f9bc2d46]">
            <a href={menu.path}>{menu.name}</a>
          </li>
        {/each}
      </ul>
    </div>
    <slot />
  </div>
  <footer class="pb-6 text-center px-4">
    © 2025 Query.rs, built by
    <a href="https://github.com/folyd" target="_blank">Folyd</a>
    with ❤️❤️, see <a href="/about">about</a> page to learn more.
  </footer>
</div>
