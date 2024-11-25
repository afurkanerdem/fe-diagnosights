import { writable } from 'svelte/store';
interface UserData {
    username: string;

    // ... other user properties
}

export const loggedInUser = writable<UserData | null>(null);
