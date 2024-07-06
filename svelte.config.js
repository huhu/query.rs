import adapter from '@sveltejs/adapter-cloudflare';

export default {
    kit: {
        adapter: adapter({
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
        })
    }
};
