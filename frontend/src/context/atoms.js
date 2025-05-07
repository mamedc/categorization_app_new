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
// --- Initial Balance ---
export const refreshInitialBalanceAtom = atom(0);

export const initialBalanceAtom = atom(
    // Read function
    async (get) => {
        get(refreshInitialBalanceAtom);
        try {
            const res = await fetch(BASE_URL + "/settings/initial_balance", { method: "GET" });
            if (!res.ok) {
                if (res.status === 404) {
                    console.log("Initial balance setting not found, defaulting to 0.");
                    return 0; // Return 0 directly
                }
                const errorData = await res.json().catch(() => ({ error: "Failed to parse error response" }));
                throw new Error(errorData.error || errorData.description || `HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            // Use parseFloat and handle potential NaN
            const balance = parseFloat(data.value);
            return isNaN(balance) ? 0 : balance;
        } catch (error) {
            console.error("Error fetching initial balance:", error);
            return 0; // Fallback to 0 on any error
        }
    },
    // Write function
    async (get, set, newBalance) => {
        try {
            const response = await fetch(BASE_URL + '/settings/initial_balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value: String(newBalance) }), // Send as string
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
                throw new Error(errorData.error || errorData.description || `HTTP error! status: ${response.status}`);
            }

            // Refresh this atom on success
            set(refreshInitialBalanceAtom, c => c + 1);

            // Also refresh final running balance as initial balance affects it
            set(refreshFinalRunningBalanceAtom, c => c + 1);

        } catch (error) {
            console.error("Error saving initial balance via atom:", error);
            throw error; // Re-throw for component handling
        }
    }
);

export const ldbInitialBalanceAtom = loadable(initialBalanceAtom);


// --- Final Running Balance ---
export const refreshFinalRunningBalanceAtom = atom(0);

export const finalRunningBalanceAtom = atom(
    // Read function
    async (get) => {
        get(refreshFinalRunningBalanceAtom); // Depend on its own refresh trigger
        // Also depend on initial balance refresh, as initial balance affects final balance
        get(refreshInitialBalanceAtom);
        // Also depend on transaction refresh, as transactions affect final balance
        get(refreshTransactionsAtom);

        try {
            // Fetch the specific setting
            const res = await fetch(BASE_URL + "/settings/final_running_balance", { method: "GET" });
            if (!res.ok) {
                if (res.status === 404) {
                    console.log("Final running balance setting not found, defaulting to 0.");
                    return 0; // Return 0 directly
                }
                const errorData = await res.json().catch(() => ({ error: "Failed to parse error response" }));
                throw new Error(errorData.error || errorData.description || `HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            // Use parseFloat and handle potential NaN
            const balance = parseFloat(data.value);
            return isNaN(balance) ? 0 : balance;
        } catch (error) {
            console.error("Error fetching final running balance:", error);
            return 0; // Fallback to 0 on any error
        }
    },
    // Write function
    async (get, set, newBalance) => {
        // Only update if the new balance is a valid number
        if (typeof newBalance !== 'number' || isNaN(newBalance)) {
            console.warn("Attempted to save invalid final running balance:", newBalance);
            return; // Or throw an error if preferred
        }

        try {
            const response = await fetch(BASE_URL + '/settings/final_running_balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Ensure the value sent is a string representation of the number
                body: JSON.stringify({ value: String(newBalance.toFixed(2)) }), // Send as string, formatted
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
                throw new Error(errorData.error || errorData.description || `HTTP error! status: ${response.status}`);
            }

            // Refresh this atom on success
            set(refreshFinalRunningBalanceAtom, c => c + 1);

        } catch (error) {
            console.error("Error saving final running balance via atom:", error);
            // Decide if this error should be surfaced to the user (e.g., via toast)
            // For now, we just log it, as it happens in the background from TransactionGrid
            // throw error; // Re-throwing might cause issues if TransactionGrid doesn't catch it
        }
    }
);

// Loadable version for UI states
export const ldbFinalRunningBalanceAtom = loadable(finalRunningBalanceAtom);