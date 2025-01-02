<script>
  import "../app.css";

  const menus = [
    {
      name: "Search",
      path: "/",
    },
    {
      name: "Reddit Posts",
      path: "/reddit",
    },
    {
      name: "GitHub",
      path: "https://github.com/huhu/query.rs",
    },
  ];
</script>

<div class="flex-layout" style="flex-direction: column;">
  <div class="max-w-[1160px] w-full flex flex-col">
    <ul
      class="hidden list-none flex-row overflow-auto md:flex self-end py-5 text-base md:text-xl"
    >
      {#each menus as menu}
        <li class="px-5 rounded-md hover:bg-[#f9bc2d46]">
          <a href={menu.path}>{menu.name}</a>
        </li>
      {/each}
    </ul>
    <slot />
  </div>
  <footer class="pb-6 text-center px-4">
    © 2024 Query.rs, built by
    <a href="https://github.com/folyd" target="_blank">Folyd</a>
    with ❤️❤️, see <a href="/about">about</a> page to learn more.
  </footer>
</div>
