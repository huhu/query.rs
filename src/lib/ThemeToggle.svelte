<script>
  import { onMount, tick } from "svelte";
  import { Check, Moon, Sun } from "lucide-svelte";
  import {
    THEME_STORAGE_KEY,
    applyTheme,
    readStoredTheme,
    systemPrefersDark,
  } from "./theme.js";

  /** @type {{ id: "light" | "dark" | "system", label: string }[]} */
  const options = [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "system", label: "System" },
  ];

  let open = false;
  let preference = "system";
  let dark = false;
  /** @type {HTMLButtonElement} */
  let trigger;
  /** @type {HTMLDivElement} */
  let menu;

  /**
   * @param {"system" | "light" | "dark"} pref
   */
  function sync(pref) {
    preference = pref;
    dark = applyTheme(pref, systemPrefersDark());
  }

  /**
   * @param {"system" | "light" | "dark"} pref
   */
  function choose(pref) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch {
      /* Storage can throw in private mode; the choice still applies. */
    }
    sync(pref);
    open = false;
    trigger?.focus();
  }

  async function toggleMenu() {
    open = !open;
    if (!open) return;
    await tick();
    const current = menu?.querySelector('[aria-checked="true"]');
    if (current instanceof HTMLElement) current.focus();
  }

  /** @param {MouseEvent} event */
  function onWindowClick(event) {
    if (!open) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (trigger?.contains(target) || menu?.contains(target)) return;
    open = false;
  }

  /** @param {KeyboardEvent} event */
  function onWindowKeydown(event) {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      open = false;
      trigger?.focus();
    }
  }

  /** @param {KeyboardEvent} event */
  function onMenuKeydown(event) {
    if (!menu) return;
    const items = [...menu.querySelectorAll('[role="menuitemradio"]')];
    const index = items.indexOf(document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = items[(index + 1) % items.length];
      if (next instanceof HTMLElement) next.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = items[(index - 1 + items.length) % items.length];
      if (next instanceof HTMLElement) next.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      const next = items[0];
      if (next instanceof HTMLElement) next.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      const next = items[items.length - 1];
      if (next instanceof HTMLElement) next.focus();
    }
  }

  $: label =
    preference === "system"
      ? `Color theme: system, currently ${dark ? "dark" : "light"}. Choose light, dark, or system.`
      : `Color theme: ${preference}. Choose light, dark, or system.`;

  onMount(() => {
    sync(readStoredTheme());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      if (preference === "system") sync("system");
    };
    mq.addEventListener("change", onScheme);
    return () => mq.removeEventListener("change", onScheme);
  });
</script>

<svelte:window on:click={onWindowClick} on:keydown={onWindowKeydown} />

<div class="theme">
  <button
    bind:this={trigger}
    type="button"
    class="theme-toggle"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls="theme-menu"
    aria-label={label}
    title={preference === "system" ? "Theme: system" : `Theme: ${preference}`}
    on:click|stopPropagation={toggleMenu}
  >
    <span class="icon-sun" aria-hidden="true"><Sun size={18} /></span>
    <span class="icon-moon" aria-hidden="true"><Moon size={18} /></span>
    <span class="system-mark" aria-hidden="true"></span>
  </button>

  {#if open}
    <div
      bind:this={menu}
      id="theme-menu"
      class="theme-menu"
      role="menu"
      tabindex="-1"
      aria-label="Color theme"
      on:click|stopPropagation
      on:keydown={onMenuKeydown}
    >
      {#each options as option}
        <button
          type="button"
          role="menuitemradio"
          aria-checked={preference === option.id}
          on:click={() => choose(option.id)}
        >
          <span class="check" aria-hidden="true">
            {#if preference === option.id}
              <Check size={16} />
            {/if}
          </span>
          <span>{option.label}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .theme {
    position: relative;
  }

  .theme-toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    margin-right: 0.25rem;
    border-radius: 0.375rem;
    color: var(--ink);
  }

  .theme-toggle:hover,
  .theme-toggle[aria-expanded="true"] {
    background: var(--brand-soft);
  }

  .theme-toggle:focus-visible,
  .theme-menu button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .icon-sun,
  .icon-moon {
    display: inline-flex;
  }

  .icon-moon {
    display: none;
  }

  :global(html.dark) .icon-sun {
    display: none;
  }

  :global(html.dark) .icon-moon {
    display: inline-flex;
  }

  .system-mark {
    display: none;
    position: absolute;
    right: 0.35rem;
    bottom: 0.35rem;
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 999px;
    background: var(--primary);
    box-shadow: 0 0 0 2px var(--bg);
  }

  :global(html[data-theme="system"]) .system-mark {
    display: block;
  }

  .theme-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 0.35rem);
    z-index: 60;
    min-width: 11rem;
    padding: 0.35rem;
    border-radius: 0.75rem;
    border: 1px solid var(--line);
    background: var(--surface);
    box-shadow: var(--menu-shadow);
  }

  .theme-menu button {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.45rem 0.6rem;
    border-radius: 0.5rem;
    text-align: left;
    font-size: 0.95rem;
    color: var(--ink);
  }

  .theme-menu button:hover,
  .theme-menu button[aria-checked="true"] {
    background: var(--brand-soft);
  }

  .check {
    display: inline-flex;
    width: 1rem;
    height: 1rem;
    color: var(--text-strong);
  }
</style>
