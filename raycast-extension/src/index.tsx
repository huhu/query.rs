import { ActionPanel, Action, List } from "@raycast/api";
import { useState, useEffect } from "react";
import { HeadlessOmnibox } from "omnibox-js";
import DescShardManager from "../../lib/search/docs/desc-shard.js";
import DocSearch from "../../lib/search/docs/base.js";
import searchIndex from "../../lib/index/std-docs.js";
import stdDescShards from "../../lib/index/desc-shards/std.js";

const RESULTS_PER_PAGE = 20;

async function initHeadlessOmnibox() {
    let stdSearcher = new DocSearch(
        "std",
        searchIndex,
        "https://doc.rust-lang.org/",
        await DescShardManager.create(stdDescShards),
    );
    const headless = new HeadlessOmnibox({
        onSearch: async (query) => {
            return await stdSearcher.search(query);
        },
        onFormat: formatDoc,
        onAppend: async (query) => {
            return [{
                content: await stdSearcher.getSearchUrl(query),
                description: `Search Rust docs ${query} on https://doc.rust-lang.org/`,
            }];
        },
    });
    return headless;
}

function formatDoc(index, doc) {
    let content = doc.href;
    let description = doc.displayPath + `${doc.name}`;
    if (doc.desc) {
        description += ` - ${doc.desc}`;
    }

    return { content, description };
}

export default function Command() {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [headless, setHeadless] = useState<HeadlessOmnibox | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        async function initialize() {
            const initializedHeadless = await initHeadlessOmnibox();
            setHeadless(initializedHeadless);
            setIsLoading(false);
        }
        initialize();
    }, []);

    const handleSearch = async (text: string) => {
        if (!headless) return;

        setIsLoading(true);
        setSearchText(text);
        setPage(1);
        const { results } = await headless.search(text);
        setSearchResults(results.slice(0, RESULTS_PER_PAGE).map(result => ({
            name: result.content,
            description: result.description,
            url: result.content
        })));
        setIsLoading(false);
    };

    const loadMore = async () => {
        if (!headless) return;

        const nextPage = page + 1;
        const results = await headless.search(searchText);
        const newResults = results.slice((nextPage - 1) * RESULTS_PER_PAGE, nextPage * RESULTS_PER_PAGE)
            .map(result => ({
                name: result.content,
                description: result.description,
                url: result.content
            }));
        setSearchResults(prevResults => [...prevResults, ...newResults]);
        setPage(nextPage);
    };

    return (
        <List
            isLoading={isLoading}
            onSearchTextChange={handleSearch}
            searchBarPlaceholder="Search..."
            throttle
        >
            <List.Section title="Results" subtitle={searchResults.length + ""}>
                {searchResults.map((searchResult) => (
                    <SearchListItem key={searchResult.name} searchResult={searchResult} />
                ))}
            </List.Section>
            {searchResults.length % RESULTS_PER_PAGE === 0 && (
                <List.Item
                    title="Load More"
                    actions={
                        <ActionPanel>
                            <Action title="Load More" onAction={loadMore} />
                        </ActionPanel>
                    }
                />
            )}
        </List>
    );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
    return (
        <List.Item
            title={searchResult.url}
            subtitle={searchResult.description}
            actions={
                <ActionPanel>
                    <ActionPanel.Section>
                        <Action.OpenInBrowser title="Open in Browser" url={searchResult.url} />
                    </ActionPanel.Section>
                </ActionPanel>
            }
        />
    );
}

interface SearchResult {
    //   name: string;
    description?: string;
    url: string;
}
