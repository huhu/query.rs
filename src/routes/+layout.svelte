<script>
  import { page } from "$app/stores";
  import "../app.css";

  $: seo = $page.data.seo ?? {};
  $: title = seo.title || "Query.rs";
  $: description = seo.description || "A search engine for Rust";
  $: canonical = seo.canonical || `https://query.rs${$page.url.pathname}`;
  $: ogType = seo.ogType || "website";
  $: image = seo.image || "https://query.rs/og.png";
  $: showLogo =
    $page.url.pathname === "/reddit" || $page.url.pathname.startsWith("/posts/");

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

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta property="og:site_name" content="Query.rs" />
  <meta property="og:type" content={ogType} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={image} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
  {#if seo.publishedTime}
    <meta property="article:published_time" content={seo.publishedTime} />
  {/if}
  {#if seo.author}
    <meta property="article:author" content={seo.author} />
  {/if}
</svelte:head>

<div class="flex-layout" style="flex-direction: column;">
  <div class="max-w-[1160px] w-full flex flex-col">
    <div class="flex flex-col md:flex-row md:justify-between items-center">
      <a href="/"
        ><img
          src="/assets/logo.svg"
          alt="logo"
          class="w-32 m-4"
          class:hidden={!showLogo}
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
    with ❤️❤️, see <a href="/about">about</a> page to learn more ·
    <a href="https://meiguo.app" target="_blank">meiguo.app</a>
  </footer>
</div>
