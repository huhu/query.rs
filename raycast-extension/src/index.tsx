import { ActionPanel, Action, List } from "@raycast/api";
import { useState, useEffect } from "react";
import { initHeadlessOmnibox } from "./headless.js";
import { HeadlessOmnibox } from "omnibox-js";

export default function Command() {
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [headless, setHeadless] = useState<HeadlessOmnibox | null>(null);

    useEffect(() => {
        async function initialize() {
            const headlessOmnibox = await initHeadlessOmnibox();
            setHeadless(headlessOmnibox);
            setIsLoading(false);
        }
        initialize();
    }, []);

    const handleSearch = async (text: string) => {
        if (!headless) return;

        setIsLoading(true);
        const { results } = await headless.search(text);
        setSearchResults(results.map(result => ({
            name: result.content,
            description: result.description,
            url: result.content
        })));
        setIsLoading(false);
    };

    return (
        <List
            isLoading={isLoading}
            onSearchTextChange={handleSearch}
            searchBarPlaceholder="Search..."
            throttle
        >
            {searchResults.map((searchResult) => (
                <SearchListItem key={searchResult.url} searchResult={searchResult} />
            ))}
            <List.EmptyView icon={{ source: "icon.png" }} title="Query.rs" description="A search engine for Rust"
                actions={
                    <ActionPanel>
                        <ActionPanel.Section>
                            <Action.OpenInBrowser title="Open in Browser" url={"https://query.rs"} />
                        </ActionPanel.Section>
                    </ActionPanel>
                } />
        </List>
    );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
    return (
        <List.Item
            title={searchResult.description}
            icon={{ source: "rust.png" }}
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
    description: string;
    url: string;
}
