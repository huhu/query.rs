import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    build: {
        rollupOptions: {
            // Vite bundles external dependencies
            // https://github.com/vitejs/vite/discussions/14813
            external: [
                "querylib.js"
            ]
        }
    },
    plugins: [sveltekit()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}']
    }
});
