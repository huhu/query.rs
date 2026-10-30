import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  THEME_META_COLOR,
  THEME_STORAGE_KEY,
  isThemePreference,
  resolveDark,
} from "./theme.js";

function channel(hex) {
  const n = parseInt(hex, 16) / 255;
  return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

function contrast(foreground, background) {
  const lum = (hex) => {
    const h = hex.slice(1);
    return (
      0.2126 * channel(h.slice(0, 2)) +
      0.7152 * channel(h.slice(2, 4)) +
      0.0722 * channel(h.slice(4, 6))
    );
  };
  const lighter = Math.max(lum(foreground), lum(background));
  const darker = Math.min(lum(foreground), lum(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function customProps(css, selector) {
  const match = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`));
  expect(match, selector).toBeTruthy();
  /** @type {Record<string, string>} */
  const props = {};
  for (const line of match[1].split(";")) {
    const token = line.match(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})(?![0-9a-fA-F])/);
    if (token) props[token[1]] = token[2].toLowerCase();
  }
  return props;
}

const css = readFileSync(new URL("../app.css", import.meta.url), "utf8");
const html = readFileSync(new URL("../app.html", import.meta.url), "utf8");
const light = customProps(css, ":root");
const dark = customProps(css, "html\\.dark");

describe("theme preference", () => {
  it("resolves system, light, and dark", () => {
    expect(resolveDark("system", true)).toBe(true);
    expect(resolveDark("system", false)).toBe(false);
    expect(resolveDark("dark", false)).toBe(true);
    expect(resolveDark("light", true)).toBe(false);
  });

  it("accepts only the three persisted values", () => {
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("auto")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});

describe("theme tokens", () => {
  it("keeps the light palette that the site already ships", () => {
    expect(light["--bg"]).toBe("#fcfaf6");
    expect(light["--surface"]).toBe("#ffffff");
    expect(light["--ink"]).toBe("#121212");
    expect(light["--primary"]).toBe("#f9bb2d");
    expect(light["--primary-ink"]).toBe("#1f1c19");
    expect(light["--line"]).toBe("#e5e7eb");
    expect(light["--line-warm"]).toBe("#f0e4c4");
    expect(light["--quiet"]).toBe("#6b645b");
    expect(light["--desc"]).toBe("#565656");
    expect(light["--chip-ink"]).toBe("#3f3a34");
    expect(light["--prose"]).toBe("#1f2937");
    expect(light["--link"]).toBe("#2563eb");
    expect(light["--band"]).toBe("#e6ecfd");
    expect(light["--band-ink"]).toBe("#2759e7");
    expect(light["--omnibox-bg"]).toBe("#ffffff");
    expect(light["--omnibox-border"]).toBe("#dfe1e5");
    expect(light["--omnibox-hover"]).toBe("#f2f2f2");
    expect(light["--omnibox-dim"]).toBe("#474747");
    expect(light["--omnibox-hint"]).toBe("#2559c9");
    expect(light["--omnibox-indicator"]).toBe("#3168cb");
    expect(light["--hover"]).toBe("#f5f3f1");
    expect(light["--remove"]).toBe("#dd4814");
  });

  it("keeps the first-paint script aligned with the tokens", () => {
    expect(html).toContain(THEME_STORAGE_KEY);
    expect(html).toContain(THEME_META_COLOR.light);
    expect(html).toContain(THEME_META_COLOR.dark);
    expect(light["--bg"]).toBe(THEME_META_COLOR.light);
    expect(dark["--bg"]).toBe(THEME_META_COLOR.dark);
  });

  it("meets contrast for dark text and controls", () => {
    const pairs = [
      ["--ink", "--bg", 4.5],
      ["--ink", "--surface", 4.5],
      ["--prose", "--surface", 4.5],
      ["--text-strong", "--surface", 4.5],
      ["--muted", "--surface", 4.5],
      ["--soft", "--surface", 4.5],
      ["--secondary", "--surface", 4.5],
      ["--label", "--surface", 4.5],
      ["--desc", "--surface", 4.5],
      ["--quiet", "--surface", 4.5],
      ["--quiet", "--bg", 4.5],
      ["--chip-ink", "--bg", 4.5],
      ["--link", "--surface", 4.5],
      ["--band-ink", "--band", 4.5],
      ["--ink", "--selected", 4.5],
      ["--danger", "--surface", 4.5],
      ["--danger", "--danger-soft", 4.5],
      ["--primary-ink", "--primary", 4.5],
      ["--fab-ink", "--fab", 4.5],
      ["--btn-secondary-text", "--btn-secondary", 4.5],
      ["--remove", "--surface", 4.5],
      ["--omnibox-dim", "--omnibox-bg", 4.5],
      ["--omnibox-hint", "--omnibox-bg", 4.5],
      ["--chart-axis", "--surface", 4.5],
      ["--bar-label", "--primary", 4.5],
      ["--line", "--surface", 3],
      ["--input-border", "--input-bg", 3],
      ["--omnibox-border", "--omnibox-bg", 3],
    ];

    for (const [foreground, background, minimum] of pairs) {
      const ratio = contrast(dark[foreground], dark[background]);
      expect(
        ratio,
        `${foreground} on ${background} is ${ratio.toFixed(2)}, need ${minimum}`
      ).toBeGreaterThanOrEqual(minimum);
    }
  });
});
