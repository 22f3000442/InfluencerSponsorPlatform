export default {
    template: ` 
    <div>
      <!-- Navbar Container -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <!-- Home Link -->
          <router-link to="/" class="navbar-brand">Home</router-link>
  
          <!-- Navbar Links -->
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              
              <!-- If the user is not logged in -->
              <li class="nav-item" v-if="!$store.state.loggedIn">
                <router-link to="/login" class="nav-link">Login</router-link>
              </li>
              <li class="nav-item" v-if="!$store.state.loggedIn">
                <router-link to="/register/sponsor" class="nav-link">Sponsor Register</router-link>
              </li>
              <li class="nav-item" v-if="!$store.state.loggedIn">
                <router-link to="/register/influencer" class="nav-link">Influencer Register</router-link>
              </li>
  
              <!-- Admin Routes -->
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'admin'">
                <router-link to="/admin-dashboard" class="nav-link">Admin Dashboard</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'admin'">
                <router-link to="/campaigns" class="nav-link">Campaigns</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'admin'">
                <router-link to="/admin-requests" class="nav-link">Requests</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'admin'">
                <router-link to="/admin-stats" class="nav-link">Stats</router-link>
              </li>
  
              <!-- Sponsor Routes -->
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'sponsor'">
                <router-link to="/sponsor-dashboard" class="nav-link">Sponsor Dashboard</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'sponsor'">
                <router-link to="/add-campaign" class="nav-link">Add Campaign</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'sponsor'">
                <router-link to="/campaigns" class="nav-link">Campaigns</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'sponsor'">
                <router-link to="/influencers" class="nav-link">Find Influencers</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'sponsor'">
                <router-link to="/requests/sponsor" class="nav-link">Requests</router-link>
              </li>
  
              <!-- Influencer Routes -->
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'influencer'">
                <router-link to="/feed" class="nav-link">Campaigns</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'influencer'">
                <router-link to="/requests/influencer" class="nav-link">Requests</router-link>
              </li>
              <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'influencer'">
                <router-link :to="'/influencers/' + $store.state.user_id" class="nav-link">My Profile</router-link>
              </li>
              </ul>
  
              <!-- Logout Button -->
        
          <ul class="navbar-nav ms-auto">
            <li class="nav-item" v-if="$store.state.loggedIn">
              <button class="btn custom-logout-btn" @click="$store.commit('logout')">Logout</button>
            </li>
          </ul>
          </div>
        </div>
      </nav>
    </div>
    `
  };
  