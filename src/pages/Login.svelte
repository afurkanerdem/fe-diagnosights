<script lang="ts">
  
  import { loggedInUser } from '../stores/loggedInUser';
  import {push, pop, replace} from 'svelte-spa-router'

  let username = '';
  let password = '';
  let backend_url = import.meta.env.VITE_BACKEND_URL
  console.log('backend_url')
  console.log(backend_url)
  let errorMessage = '';

  async function handleSubmit(e: SubmitEvent) { 
    console.log('handleSubmit')
    try {
      errorMessage = ''; // Clear previous errors
      
      // Create URL-encoded string
      const urlEncodedData = new URLSearchParams();
      urlEncodedData.append('username', username);
      urlEncodedData.append('password', password);

      const response = await fetch(`/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlEncodedData.toString(),
      });
      
      if (!response.ok) {
        console.log('response not ok')
        console.log(response) 
        errorMessage = 'Invalid username or password';
        return;
      }
      
      const data = await response.json();
      loggedInUser.update(user => ({ ...user, username: data.username }));
      replace('/')

      
    } catch (error) {
      console.log('error')
      console.log(error)
      errorMessage = 'Invalid username or password';
      console.error('Login error:', error);
    }
  }
</script>
<div class="font-[sans-serif] bg-[#122023] md:h-screen">
  <div class="grid md:grid-cols-2 items-center gap-8 h-full">
    <div class="max-md:order-1 p-4">
      <img src="logo-transparent.png" class="lg:max-w-[80%] w-full h-full object-contain block mx-auto" alt="company logo" />
    </div>

    <div class="flex items-center md:p-8 p-6 bg-white md:rounded-tl-[55px] md:rounded-bl-[55px] h-full">
      <form class="max-w-lg w-full mx-auto" on:submit|preventDefault={handleSubmit}>
        <div class="mb-12">
          <h3 class="text-[#122023] text-4xl urbanist ">Sign in</h3>
        </div>

        <div>
          <div class="relative flex items-center">
            <input name="username" bind:value={username} type="text" required class="w-full text-sm border-b border-gray-300 focus:border-gray-800 px-2 py-3 outline-none" placeholder="Enter username" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" class="w-[18px] h-[18px] absolute right-2" viewBox="0 0 682.667 682.667">
              <defs>
                <clipPath id="a" clipPathUnits="userSpaceOnUse">
                  <path d="M0 512h512V0H0Z" data-original="#000000"></path>
                </clipPath>
              </defs>
              <g clip-path="url(#a)" transform="matrix(1.33 0 0 -1.33 0 682.667)">
                <path fill="none" stroke-miterlimit="10" stroke-width="40" d="M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z" data-original="#000000"></path>
                <path d="M472 274.9V107.999c0-11.027-8.972-20-20-20H60c-11.028 0-20 8.973-20 20V274.9L0 304.652V107.999c0-33.084 26.916-60 60-60h392c33.084 0 60 26.916 60 60v196.653Z" data-original="#000000"></path>
              </g>
            </svg>
          </div>
        </div>

        <div class="mt-8">
          <div class="relative flex items-center">
            <input name="password" bind:value={password} type="password" required class="w-full text-sm border-b border-gray-300 focus:border-gray-800 px-2 py-3 outline-none" placeholder="Enter password" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" class="w-[18px] h-[18px] absolute right-2 cursor-pointer" viewBox="0 0 128 128">
              <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z" data-original="#000000"></path>
            </svg>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4 mt-6">
          <div class="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label for="remember-me" class="text-gray-800 ml-3 block text-sm">
              Remember me
            </label>
          </div>
         
        </div>

        <div class="mt-12">
          <button type="submit" class="w-full py-3 px-6 text-sm urbanist tracking-wider rounded-full text-white bg-[#122023] hover:bg-green focus:outline-none">
            Sign in
          </button>
        </div>

        {#if errorMessage}
          <p class="error">{errorMessage}</p>
        {/if}
      </form>
    </div>
  </div>
</div>

<style>
  .error {
    color: red;
    margin-top: 0.5rem;
  }
</style>