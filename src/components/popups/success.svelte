<script lang="ts">
    export let message: String;
</script>
<div class="bg-white shadow-[0_3px_10px_-3px_rgba(6,81,237,0.3)] text-gray-800 flex items-center w-max max-w-sm p-6 rounded-md"
role="alert">
<svg xmlns="http://www.w3.org/2000/svg" class="w-[24px] shrink-0 fill-green-500 inline mr-4" viewBox="0 0 512 512">
    <ellipse cx="246" cy="246" data-original="#000" rx="246" ry="246" />
    <path class="fill-white"
        d="m235.472 392.08-121.04-94.296 34.416-44.168 74.328 57.904 122.672-177.016 46.032 31.888z"
        data-original="#000" />
</svg>
<span class="text-lg font-semibold tracking-wide">{message}</span>
</div>