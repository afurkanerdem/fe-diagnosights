<script lang="ts">
    import Success from '../popups/success.svelte';
    import Fail from '../popups/fail.svelte';

    let showSuccess = false;
    let showFail = false;
    let message = '';
    async function handleFileUpload(event: Event) {
       
        const input = event.target as HTMLInputElement;
        if (!input.files) return;
        const file = input.files[0];
       
        if (!file) return;
  
      // Validate file type
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (!validTypes.includes(file.type)) {
        message = 'Please upload only .xlsx or .xls files';
        showFail = true;
        return;
      }
  
      // Create FormData and append file
      const formData = new FormData();
      formData.append('files', file);
  
      try {
        const response = await fetch('/api/uploadLabRecords', {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - browser will set it automatically with boundary
        });
  
      
        if (!response.ok) {
          alert(`Upload failed: ${response.statusText}`);
          message = 'Wrong formatted file!';
          showFail = true;  // Notify user of the error
          showSuccess = false
          return; // Exit the function if the upload fails
        }
         message = 'Upload successful!';
         showSuccess = true; // Notify user of successful upload
         showFail = false
      } catch (error) {
        console.error('Upload error:', error);
        message = 'An error occurred while uploading the file.'; // Notify user of the error
        showFail = true;
        showSuccess = false;
      }
    }
  </script>
<!-- Toast Notifications Container -->
<div class="fixed top-4 right-4 z-50">
    {#if showSuccess}
        <Success message={message} />
    {:else if showFail}
        <Fail message={message} />
    {/if}
</div>
<label for="uploadFile1"
      class="bg-white text-center rounded w-full max-w-sm min-h-[180px] py-4 px-4 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 mx-auto font-[sans-serif]">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 mb-3 fill-gray-400" viewBox="0 0 24 24">
        <path
          d="M22 13a1 1 0 0 0-1 1v4.213A2.79 2.79 0 0 1 18.213 21H5.787A2.79 2.79 0 0 1 3 18.213V14a1 1 0 0 0-2 0v4.213A4.792 4.792 0 0 0 5.787 23h12.426A4.792 4.792 0 0 0 23 18.213V14a1 1 0 0 0-1-1Z"
          data-original="#000000" />
        <path
          d="M6.707 8.707 11 4.414V17a1 1 0 0 0 2 0V4.414l4.293 4.293a1 1 0 0 0 1.414-1.414l-6-6a1 1 0 0 0-1.414 0l-6 6a1 1 0 0 0 1.414 1.414Z"
          data-original="#000000" />
      </svg>
      <p class="text-gray-400 font-semibold text-sm">Drag & Drop or <span class="text-[#007bff]">Choose file</span> to
        upload</p>
      <input type="file" id='uploadFile1' class="hidden"  accept=".xlsx,.xls"   on:change={handleFileUpload}/>
      <p class="text-xs text-gray-400 mt-2">.xlsx and .xls files are allowed</p>
    </label>