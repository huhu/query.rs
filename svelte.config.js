import cloudflareAdapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
    preprocess: vitePreprocess(),
    kit: {
        adapter: cloudflareAdapter({
            routes: {
                include: ['/*'],
                exclude: ['<all>']
            },
            platformProxy: {
                configPath: 'wrangler.toml',
                environment: undefined,
                experimentalJsonConfig: false,
                persist: false
            }
        }),
    }
};
