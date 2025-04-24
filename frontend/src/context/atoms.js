import { atom, useAtom } from "jotai";
import { loadable } from "jotai/utils";
import { BASE_URL } from "../App";


export const counterAtom = atom(0);


// Example derived state
export const doubledCounterAtom = atom((get) => get(counterAtom) * 2);


// Async atom
export const asyncUserAtom = atom(async () => {
    const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
    return response.json();
});
export const loadableUserAtom = loadable(asyncUserAtom);




// Fetch Tag Groups
export const tagGroupsAtom = atom(async () => {
    //const [_, setIsLoadTagGroups] = useAtom(isLoadTagGroups);
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