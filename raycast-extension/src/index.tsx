import { ActionPanel, Action, List, Image } from "@raycast/api";
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

    if (text.length === 0) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    const { results } = await headless.search(text);
    setSearchResults(
      results.map((result) => ({
        name: result.content,
        description: result.description,
        url: result.content,
      })),
    );
    setIsLoading(false);
  };

  return (
    <List isLoading={isLoading} onSearchTextChange={handleSearch} searchBarPlaceholder="Search..." throttle>
      {searchResults.map((searchResult) => (
        <SearchListItem key={searchResult.url} searchResult={searchResult} />
      ))}
      <List.EmptyView
        icon={{ source: "icon.png" }}
        title="Query.rs"
        description="A search engine for Rust"
        actions={
          <ActionPanel>
            <ActionPanel.Section>
              <Action.OpenInBrowser title="Open in Browser" url={"https://query.rs"} />
            </ActionPanel.Section>
          </ActionPanel>
        }
      />
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  return (
    <List.Item
      title={searchResult.description}
      icon={getIcon(searchResult.url)}
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

function getIcon(url: string): Image.ImageLike {
  if (url.startsWith("https://crates.io")) {
    return { source: "crate.png" };
  } else if (url.startsWith("https://doc.rust-lang.org")) {
    return { source: "rust.png" };
  } else if (url.startsWith("https://docs.rs")) {
    return { source: "docs.png" };
  } else {
    return { source: "icon.png" };
  }
}

interface SearchResult {
  description: string;
  url: string;
}
