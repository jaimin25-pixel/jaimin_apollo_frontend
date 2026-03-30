<template>
  <div class="pharmacy-layout">
    <nav class="navbar">
      <div class="navbar-brand">
        <h1>Pharmacy Module</h1>
      </div>
      <div class="navbar-menu">
        <router-link to="/pharmacist" class="nav-link" active-class="active">
          Dashboard
        </router-link>
        <router-link to="/pharmacist/inventory" class="nav-link" active-class="active">
          Inventory
        </router-link>
        <router-link to="/pharmacist/partner-pharmacies" class="nav-link" active-class="active">
          Partners
        </router-link>
      </div>
      <div class="navbar-actions">
        <button @click="logout" class="btn btn-logout">Logout</button>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('apollo_token')
  localStorage.removeItem('apollo_user')
  localStorage.removeItem('access_token')
  router.push('/login')
}
</script>

<style scoped>
.pharmacy-layout {
  min-height: 100vh;
  background: #f5f5f5;
}

.navbar {
  background: white;
  border-bottom: 1px solid #ddd;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #007bff;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #007bff;
}

.nav-link.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

.navbar-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.btn-logout {
  background: #dc3545;
  color: white;
}

.btn-logout:hover {
  background: #c82333;
}
</style>
