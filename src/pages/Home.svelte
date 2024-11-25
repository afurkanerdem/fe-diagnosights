<script>
    import { onMount } from 'svelte';
    import { loggedInUser } from '../stores/loggedInUser';
    import { push, location, replace } from 'svelte-spa-router';
    
    let backend_url = import.meta.env.VITE_BACKEND_URL

    // Now we actually use $location to make the statement reactive to route changes
    $: if ($location) {
        checkAuth();
    }

    // Move the auth logic to a separate function
    async function checkAuth() {
        if (!$loggedInUser) {
            try {
                const response = await fetch(`/api/me`, {
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('Unauthorized');
                }
                
                const userData = await response.json();
                loggedInUser.update(user => ({ ...user, username: userData.username }));
            } catch (error) {
                replace('/login');
            }
        }
    }

    // Still keep onMount for initial load
    onMount(checkAuth);
</script>

<h1>Hello world!</h1>
<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
<p>
    This template is pre-configured with svlete-spa-router for routing.<br/>
    Visit the <a href="https://github.com/ItalyPaleAle/svelte-spa-router">documentation for the router</a> to learn more.
</p>

<style>
	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}
</style>

