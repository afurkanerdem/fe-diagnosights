<script lang="ts">
    export let message: String;
</script>
<div class="bg-white shadow-[0_3px_10px_-3px_rgba(6,81,237,0.3)] text-gray-800 flex items-center w-max max-w-sm p-6 rounded-md"
role="alert">
<svg xmlns="http://www.w3.org/2000/svg" class="w-[24px] shrink-0 fill-red-500 inline mr-4" viewBox="0 0 32 32">
    <path
        d="M16 1a15 15 0 1 0 15 15A15 15 0 0 0 16 1zm6.36 20L21 22.36l-5-4.95-4.95 4.95L9.64 21l4.95-5-4.95-4.95 1.41-1.41L16 14.59l5-4.95 1.41 1.41-5 4.95z"
        data-original="#ea2d3f" />
</svg>
<span class="text-lg font-semibold tracking-wide">{message}</span>
</div>