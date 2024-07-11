import cloudflareAdapter from '@sveltejs/adapter-cloudflare';

export default {
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
