<script>
  import { onMount } from 'svelte';
  import { login, signup, logout, isLoggedIn, getCurrentUser } from './lib/pocketbase.js';

  let email = 'ruvido@gmail.com';
  let password = 'solemio77';
  let passwordConfirm = '';
  let user = null;
  let loggedIn = false;
  let loading = false;
  let error = '';
  let showSignup = false;

  onMount(() => {
    loggedIn = isLoggedIn();
    if (loggedIn) {
      user = getCurrentUser();
    }
  });

  async function handleLogin() {
    loading = true;
    error = '';
    
    const result = await login(email, password);
    
    if (result.success) {
      loggedIn = true;
      user = result.user;
    } else {
      error = result.error;
    }
    
    loading = false;
  }

  async function handleSignup() {
    if (password !== passwordConfirm) {
      error = 'Passwords do not match';
      return;
    }

    loading = true;
    error = '';
    
    const result = await signup(email, password, passwordConfirm);
    
    if (result.success) {
      loggedIn = true;
      user = result.user;
    } else {
      error = result.error;
    }
    
    loading = false;
  }

  function handleLogout() {
    logout();
    loggedIn = false;
    user = null;
  }

  function toggleSignup() {
    showSignup = !showSignup;
    error = '';
    // Clear signup form when switching
    if (showSignup) {
      email = '';
      password = '';
      passwordConfirm = '';
    } else {
      email = 'ruvido@gmail.com';
      password = 'solemio77';
    }
  }

</script>

<main>
  <h1>🚀 DisciploKit - Minimal Setup</h1>
  
  
  {#if loggedIn}
    <div class="dashboard">
      <h2>✅ Welcome, {user?.email}!</h2>
      
      <div class="user-info">
        <div class="info-card">
          <h3>👤 Profile</h3>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> <span class="role role-{user?.role}">{user?.role}</span></p>
          <p><strong>ID:</strong> {user?.id}</p>
          <p><strong>Verified:</strong> {user?.verified ? '✅ Yes' : '❌ No'}</p>
        </div>
        
        {#if user?.role === 'admin'}
          <div class="info-card admin-panel">
            <h3>⚡ Admin Panel</h3>
            <p>You have administrator privileges</p>
            <button class="admin-btn">Manage Users</button>
            <button class="admin-btn">System Settings</button>
          </div>
        {:else if user?.role === 'moderator'}
          <div class="info-card moderator-panel">
            <h3>🛡️ Moderator Panel</h3>
            <p>You have moderator privileges</p>
            <button class="mod-btn">Moderate Content</button>
          </div>
        {:else}
          <div class="info-card member-panel">
            <h3>📝 Member Dashboard</h3>
            <p>Welcome to DisciploKit!</p>
            <button class="member-btn">My Profile</button>
          </div>
        {/if}
      </div>
      
      <button class="logout-btn" on:click={handleLogout}>🚪 Logout</button>
    </div>
  {:else}
    <div class="auth-container">
      <div class="auth-tabs">
        <button 
          class="tab {!showSignup ? 'active' : ''}" 
          on:click={toggleSignup}
          disabled={loading}
        >
          Login
        </button>
        <button 
          class="tab {showSignup ? 'active' : ''}" 
          on:click={toggleSignup}
          disabled={loading}
        >
          Sign Up
        </button>
      </div>

      {#if !showSignup}
        <div class="auth-form">
          <h2>🔐 Login</h2>
          <form on:submit|preventDefault={handleLogin}>
            <input 
              bind:value={email} 
              type="email" 
              placeholder="Email"
              disabled={loading}
              required
            />
            <input 
              bind:value={password} 
              type="password" 
              placeholder="Password"
              disabled={loading}
              required
            />
            <button type="submit" disabled={loading} class="auth-btn">
              {loading ? '🔄 Logging in...' : '🚀 Login'}
            </button>
          </form>
        </div>
      {:else}
        <div class="auth-form">
          <h2>📝 Create Account</h2>
          <form on:submit|preventDefault={handleSignup}>
            <input 
              bind:value={email} 
              type="email" 
              placeholder="Email"
              disabled={loading}
              required
            />
            <input 
              bind:value={password} 
              type="password" 
              placeholder="Password"
              disabled={loading}
              required
            />
            <input 
              bind:value={passwordConfirm} 
              type="password" 
              placeholder="Confirm Password"
              disabled={loading}
              required
            />
            <button type="submit" disabled={loading} class="auth-btn">
              {loading ? '🔄 Creating account...' : '✨ Sign Up'}
            </button>
          </form>
          <p class="signup-note">New users get 'member' role by default</p>
        </div>
      {/if}
      
      {#if error}
        <p class="error">❌ {error}</p>
      {/if}
    </div>
  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
  }

  h1 {
    text-align: center;
    color: white;
    margin-bottom: 2rem;
    font-size: 2.5rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  /* Auth Container */
  .auth-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    overflow: hidden;
    margin-top: 2rem;
  }

  .auth-tabs {
    display: flex;
    background: #f8f9fa;
  }

  .tab {
    flex: 1;
    padding: 1rem 2rem;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s ease;
    color: #666;
  }

  .tab.active {
    background: white;
    color: #007acc;
    font-weight: 600;
  }

  .auth-form {
    padding: 2rem;
  }

  .auth-form h2 {
    margin-bottom: 1.5rem;
    color: #333;
    text-align: center;
  }

  /* Dashboard */
  .dashboard {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    margin-top: 2rem;
  }

  .dashboard h2 {
    color: #333;
    margin-bottom: 2rem;
    text-align: center;
  }

  .user-info {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .info-card {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    border-left: 4px solid #007acc;
  }

  .info-card h3 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  .info-card p {
    margin: 0.5rem 0;
    color: #666;
  }

  .role {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .role-admin {
    background: #ff4757;
    color: white;
  }

  .role-moderator {
    background: #ffa502;
    color: white;
  }

  .role-member {
    background: #2ed573;
    color: white;
  }

  /* Role-specific panels */
  .admin-panel {
    border-left-color: #ff4757;
    background: linear-gradient(135deg, #ffecef, #fff);
  }

  .moderator-panel {
    border-left-color: #ffa502;
    background: linear-gradient(135deg, #fff5e6, #fff);
  }

  .member-panel {
    border-left-color: #2ed573;
    background: linear-gradient(135deg, #edfff4, #fff);
  }

  /* Inputs */
  input {
    width: 100%;
    padding: 0.75rem 1rem;
    margin: 0.5rem 0;
    border: 2px solid #e1e8ed;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  input:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
  }

  /* Buttons */
  .auth-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #007acc, #0056b3);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    margin-top: 1rem;
    transition: all 0.3s ease;
  }

  .auth-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
  }

  .auth-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .logout-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #ff4757;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
  }

  .admin-btn, .mod-btn, .member-btn {
    padding: 0.5rem 1rem;
    margin: 0.5rem 0.5rem 0 0;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .admin-btn {
    background: #ff4757;
    color: white;
  }

  .mod-btn {
    background: #ffa502;
    color: white;
  }

  .member-btn {
    background: #2ed573;
    color: white;
  }

  .admin-btn:hover, .mod-btn:hover, .member-btn:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  /* Error message */
  .error {
    color: #ff4757;
    margin-top: 1rem;
    text-align: center;
    font-weight: 500;
  }

  .signup-note {
    text-align: center;
    color: #666;
    font-size: 0.875rem;
    margin-top: 1rem;
    font-style: italic;
  }

  /* Responsive */
  @media (min-width: 768px) {
    .user-info {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>