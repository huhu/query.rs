import staticAdapter from '@sveltejs/adapter-static';
import cloudflareAdapter from '@sveltejs/adapter-cloudflare';

let config;

if (process.env.EXTENSION_MODE === 'true') {
    config = {
        kit: {
            adapter: staticAdapter({
                // default options are shown. On some platforms
                // these options are set automatically — see below
                fallback: "index.html",
            })
        }
    };
} else {
    config = {
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
            })
        }
    };
}

export default config;