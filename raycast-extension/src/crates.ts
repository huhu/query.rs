import fetch from "node-fetch";

export async function searchCrates(query: string): Promise<any[]> {
  try {
    const response = await fetch(`https://crates.io/api/v1/crates?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Query.rs Raycast Extension",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.crates || [];
  } catch (error) {
    console.error("Error searching crates:", error);
    return [];
  }
}
