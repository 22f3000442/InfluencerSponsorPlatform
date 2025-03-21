import adminRequestCard from '../components/adminRequestCard.js';

export default {
  components: { adminRequestCard },
  template: `
    <div class="p-4">
      <h1 class="text-xl font-bold mb-4">Sponsor Requests</h1>
      <div v-if="pendingUsers.length">
        <admin-request-card
          v-for="user in pendingUsers"
          :key="user.id"
          :username="user.username"
          :email="user.email"
          :user_id="user.id"
         
        />
      </div>
      <p v-else class="text-gray-500">No pending sponsor requests.</p>
    </div>
  `,
  data() {
    return {
      pendingUsers: [],
    };
  },
  async mounted() {
    try {
      // Fetch pending sponsors
      const res = await fetch(`${location.origin}/api/admin/pending-sponsors`, {
        headers: {
          'Authentication-Token': this.$store.state.auth_token,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch pending sponsors');
      const data = await res.json();
      this.pendingUsers = data; // Assign pending users
    } catch (error) {
      console.error(error);
      alert('Error fetching pending requests.');
    }
  }
};
