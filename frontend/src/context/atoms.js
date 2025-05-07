// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\context\atoms.js
// atoms.js

import { atom, useAtom } from "jotai";
import { loadable } from "jotai/utils";
import { BASE_URL } from "../App";


// --- Examples ---
export const counterAtom = atom(0);

// Example derived state
export const doubledCounterAtom = atom((get) => get(counterAtom) * 2);

// Async atom
export const asyncUserAtom = atom(async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
    return response.json();
});
export const loadableUserAtom = loadable(asyncUserAtom);
// --- End of Examples ---



// Fetch Tag Groups
export const refreshTagGroupsAtom = atom(0);

export const tagGroupsAtom = atom(async (get) => {
    get(refreshTagGroupsAtom); // Now dependent on the refresh trigger
    try {
        const res = await fetch(BASE_URL + "/tag-groups", { method: "GET" });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Failed to fetch tag groups");
        };
        if (!Array.isArray(data)) {
            console.error("Fetched data is not an array:", data);
            return [];
        };
        const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
        return sortedData;

    } catch (error) {
        console.error("Error fetching tag groups:", error);
        return [];
    };
});

export const ldbTagGroupsAtom = loadable(tagGroupsAtom);

// Setected Tag Group
export const selectedTagGroupId = atom(null);
export const isSelectedTagGroup = atom((get) => get(selectedTagGroupId) !== null);

// Setected Tag from Group
export const selectedTagId = atom(null);
export const isSelectedTag = atom((get) => get(selectedTagId) !== null);



// Fetch Transactions
export const refreshTransactionsAtom = atom(0);

export const transactionsAtom = atom(async (get) => {
    get(refreshTransactionsAtom);
    try {
        const res = await fetch(BASE_URL + "/transactions");
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Failed to fetch tag groups");
        };
        if (!Array.isArray(data)) {
            console.error("Fetched data is not an array:", data);
            return [];
        };
        return data;

    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    };
});

export const ldbTransactionsAtom = loadable(transactionsAtom);

// Setected Transaction
export const selectedTransaction = atom(null);
export const isSelectedTransaction = atom((get) => get(selectedTransaction) !== null);

// App Settings
// Initial balance atom (defaulting to 0 for now)
export const refreshInitialBalanceAtom = atom(0);

export const initialBalanceAtom = atom(
    // **Read function (getter)**: Fetches the value, depends on the refresh atom
    async (get) => {
        get(refreshInitialBalanceAtom); // Depend on the refresh trigger
        try {
            const res = await fetch(BASE_URL + "/settings/initial_balance", { method: "GET" });
            if (!res.ok) {
                if (res.status === 404) {
                    console.log("Initial balance setting not found, defaulting to 0.");
                    return 0;
                }
                const errorData = await res.json().catch(() => ({ error: "Failed to parse error response" }));
                throw new Error(errorData.error || errorData.description || `HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            const balance = parseFloat(data.value);
            return isNaN(balance) ? 0 : balance;

        } catch (error) {
            console.error("Error fetching initial balance:", error);
            return 0; // Fallback to 0
        }
    },
    // **Write function (setter)**: Handles the update logic
    async (get, set, newBalance) => {
        // 1. Perform the API call to update the backend
        try {
            const response = await fetch(BASE_URL + '/settings/initial_balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Ensure the value sent is a string representation of the number
                body: JSON.stringify({ value: String(newBalance) }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Throw an error to be caught by the component calling the setter
                throw new Error(errorData.error || errorData.description || `HTTP error! status: ${response.status}`);
            }

            // 2. On successful backend update, trigger a refresh of this atom
            set(refreshInitialBalanceAtom, c => c + 1);

            // Optional: Return the successful response data if needed
            // return await response.json();

        } catch (error) {
            console.error("Error saving initial balance via atom:", error);
            // Re-throw the error so the component can handle UI feedback (e.g., error toast)
            throw error;
        }
    }
);

// Loadable version remains useful for handling loading state in the UI
export const ldbInitialBalanceAtom = loadable(initialBalanceAtom);