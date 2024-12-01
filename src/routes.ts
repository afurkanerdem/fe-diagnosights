import Home from './pages/Home.svelte';
import Login from './pages/Login.svelte';
import NotFound from './pages/NotFound.svelte';

export default {
    '/': Home,
    '/patient-data': Home,
    '/upload-records':Home,
    '/login': Login,
    // The catch-all route must always be last
    '*': NotFound
};
