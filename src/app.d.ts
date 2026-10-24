// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        interface Error { }
        interface Locals { }
        interface PageData {
            seo?: {
                title?: string;
                description?: string;
                canonical?: string;
                ogType?: string;
                image?: string;
                publishedTime?: string;
                author?: string;
            };
        }
        interface PageState { }
        interface Platform {
            env?: {
                DB?: {
                    prepare(sql: string): {
                        bind(...values: unknown[]): {
                            first<T = unknown>(): Promise<T | null>;
                            all<T = unknown>(): Promise<{ results?: T[] }>;
                        };
                    };
                };
            };
        }
    }
}

export { };
