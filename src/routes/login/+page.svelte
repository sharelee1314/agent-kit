<script lang="ts">
  import { goto } from '$app/navigation';
  import { api } from '$lib/api';
  
  let userName = '';
  let password = '';
  let loading = false;
  let error = '';

  async function handleSubmit() {
    if (!userName || !password) {
      error = '请填写用户名和密码';
      return;
    }

    loading = true;
    error = '';

    try {
      const result = await api.post('/api/auth/login', {
          userName,
          password
        }, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      
      });
     // 登录成功，保存token和用户信息
      localStorage.setItem('token', result.token);
      goto('/home');
    } catch (err) {
      error = err as string
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex justify-center items-center min-h-screen bg-gray-100">
  <form class="bg-white p-8 rounded-lg shadow-md w-full max-w-md" on:submit|preventDefault={handleSubmit}>
    <h2 class="text-2xl font-bold text-center mb-6">用户登录</h2>
    
    <!-- 错误提示 -->
    {#if error}
      <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    {/if}

    <div class="mb-6">
      <label for="username" class="block text-gray-700 font-medium mb-2">用户名</label>
      <input
        type="text"
        id="username"
        bind:value={userName}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="请输入用户名"
        disabled={loading}
      />
    </div>
    
    <div class="mb-6">
      <label for="password" class="block text-gray-700 font-medium mb-2">密码</label>
      <input
        type="password"
        id="password"
        bind:value={password}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="请输入密码"
        disabled={loading}
      />
    </div>
    
    <button
      type="submit"
      disabled={loading}
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? '登录中...' : '登录'}
    </button>
  </form>
</div>