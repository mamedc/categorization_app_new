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
