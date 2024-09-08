import { useFetch } from "@raycast/utils";

export function useCrateSearch(query: string) {
    const { data, isLoading, error } = useFetch<CratesResponse>(
        `https://crates.io/api/v1/crates?q=${encodeURIComponent(query)}`,
        {
            method: "GET",
        }
    );

    return {
        crates: data?.crates ?? [],
        isLoading,
        error,
    };
}

// Define the types for the API response
interface CratesResponse {
    crates: Crate[];
    meta: {
        total: number;
    };
}

interface Crate {
    id: string;
    name: string;
    description: string;
}