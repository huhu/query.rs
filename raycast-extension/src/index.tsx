import { ActionPanel, Action, List, Image } from "@raycast/api";
import { useState, useEffect } from "react";
import { initHeadlessOmnibox } from "./headless.js";
import { HeadlessOmnibox } from "omnibox-js";

type SearchType = { id: string; name: string, prefixQueryEvent: string };

function SearchTypeDropdown(props: { searchTypes: SearchType[]; onSearchTypeChange: (newValue: string) => void }) {
  const { searchTypes, onSearchTypeChange } = props;
  return (
    <List.Dropdown
      tooltip="Select Search Type"
      storeValue={true}
      onChange={(newValue) => {
        onSearchTypeChange(newValue);
      }}
    >
      <List.Dropdown.Section>
        {searchTypes.map((searchType) => (
          <List.Dropdown.Item key={searchType.id} title={searchType.name} value={searchType.prefixQueryEvent} />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [prefixQueryEvent, setPrefixQueryEvent] = useState("");
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
    setSearchText(text);

    if (!headless) return;

    if (text.length === 0) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    const { results } = await headless.search(prefixQueryEvent + text);
    // Remove pagination tip from the first result
    const paginationTipRegex = /\s\|\sPage\s\[\d+\/\d+\],\sappend\s'.+?'\sto\s?page\sdown/;
    if (results.length > 0) {
      results[0].description = results[0].description.replace(paginationTipRegex, "");
    }
    setSearchResults(
      results.map((result) => ({
        name: result.content,
        description: result.description,
        url: result.content,
      })),
    );
    setIsLoading(false);
  };

  const searchTypes: SearchType[] = [
    { id: "1", name: "Std", prefixQueryEvent: "" },
    { id: "2", name: "Docs", prefixQueryEvent: "!" },
    { id: "3", name: "Crates", prefixQueryEvent: "!!" },
    { id: "4", name: "Repository", prefixQueryEvent: "!!!" },
  ];
  const onSearchTypeChange = (newValue: string) => {
    setPrefixQueryEvent(newValue);
    handleSearch(searchText);
  };

  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={handleSearch}
      searchBarPlaceholder="Search..."
      searchBarAccessory={<SearchTypeDropdown searchTypes={searchTypes} onSearchTypeChange={onSearchTypeChange} />}
      throttle
    >
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
