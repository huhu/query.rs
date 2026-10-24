import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

// Kit decides Svelte 4 vs 5 by testing `onMount.toString()` against
// `/function \w+\(\) \{\}/`. Vite's SSR esbuild transpile (target node18.13)
// and the Cloudflare adapter's esbuild bundle reprint that empty function
// onto two lines, the check fails, and uncompiled `$state` throws during
// prerender. This app is Svelte 4, so force the legacy branch.
const legacyDetector =
    /const is_legacy =\s*[\w$]+\.toString\(\)\.includes\((['"])\$\$\1\)\s*\|\|\s*\/function \\w\+\\\(\\\) \\{\\\}\/\.test\([\w$]+\.toString\(\)\)/;

function forceSvelte4Legacy() {
    return {
        name: 'force-svelte4-legacy',
        renderChunk(code) {
            if (!legacyDetector.test(code)) return null;
            return code.replace(legacyDetector, 'const is_legacy = true');
        }
    };
}

export default defineConfig({
    plugins: [sveltekit(), forceSvelte4Legacy()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    },
    server: {
        fs: {
            allow: ['..'],
        },
    },
});
