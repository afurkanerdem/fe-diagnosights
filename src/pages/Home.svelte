<script>
    import { onMount } from "svelte";
    import { loggedInUser } from "../stores/loggedInUser";
    import { push, location, replace } from "svelte-spa-router";
    import Sidebar from "../components/layout/Sidebar.svelte";
    import PatientTable from "../components/sections/PatientTable.svelte";
    import PatientRecordUpload from "../components/sections/PatientRecordUpload.svelte";

    let backend_url = import.meta.env.VITE_BACKEND_URL;
    let currentView = "patient-data";

    // Now we actually use $location to make the statement reactive to route changes
    $: if ($location) {
        checkAuth();
        currentView = $location.replace("/", "") || "patient-data";
    }

    // Move the auth logic to a separate function
    async function checkAuth() {
        if (!$loggedInUser) {
            try {
                const response = await fetch(`/api/me`, {
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Unauthorized");
                }

                const userData = await response.json();
                loggedInUser.update((user) => ({
                    ...user,
                    username: userData.username,
                }));
            } catch (error) {
                replace("/login");
            }
        }
    }

    // Still keep onMount for initial load
    onMount(checkAuth);
</script>

<div class="relative bg-[#f7f6f9] h-full min-h-screen font-[sans-serif]">
    <div class="flex items-start">
        <Sidebar />
        <button
            id="toggle-sidebar"
            class="lg:hidden w-8 h-8 z-[100] fixed top-[36px] left-[10px] cursor-pointer bg-[#007bff] flex items-center justify-center rounded-full outline-none transition-all duration-500"
        >
            <!-- ... existing button SVG ... -->
        </button>

        <section class="main-content w-full px-8 py-6">
            {#if currentView === "upload-records"}
                <div
                    class="flex items-center justify-center h-[calc(100vh-100px)]"
                >
                    <PatientRecordUpload />
                </div>
            {:else}
                <PatientTable />
            {/if}
        </section>
    </div>
</div>
