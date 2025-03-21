
import fetch from "node-fetch";

export async function suggest(query: string): Promise<any[]> {
  try {
    const response = await fetch(`https://query.rs/suggest/${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Query.rs Raycast Extension",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const suggestions = data[1] || [];

    const formattedSuggestions = suggestions.map(item => {
      const [name, url] = item.split(' - ');
      return { name, url };
    }).filter(suggestion => suggestion.url);

    return formattedSuggestions;
  } catch (error) {
    console.error("Error query suggestions:", error);
    return [];
  }
}
