export default {
  data() {
    return {
      user: null, // To store user details
      isLoading: true, // Track loading state
    };
  },
  methods: {
    async fetchUser() {
      try {
        const response = await fetch(`/api/admin/users/${this.$route.params.id}`, {
          headers: { 'Authentication-Token': this.$store.state.auth_token },
        });

        if (response.ok) {
          this.user = await response.json();
        } else {
          console.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        this.isLoading = false; // Ensure loading state is updated
      }
    },
    async flagUser() {
      try {
        await fetch(`/api/user/${this.user.id}/flag`, {
          method: 'POST',
          headers: { 'Authentication-Token': this.$store.state.auth_token },
        });
        alert(`${this.user.username || "User"} has been flagged.`);
      } catch (error) {
        console.error("Error flagging user:", error);
      }
    },
  },
  mounted() {
    this.fetchUser();
  },
  template: `
    <div class="p-4">
      <h2 v-if="isLoading">Loading...</h2>
      <div v-else-if="user">
        <h2>{{ user.username || "Unknown User" }} ({{ user.role || "No Role Assigned" }})</h2>
        <p><strong>Email:</strong> {{ user.email || "Not Provided" }}</p>
        <p v-if="user.role === 'sponsor'"><strong>Campaigns:</strong> {{ user.campaigns || "No Campaigns Available" }}</p>
        <p v-if="user.role === 'influencer'">
          <strong>Followers:</strong> {{ user.followers || "N/A" }} <br />
          <strong>Category:</strong> {{ user.category || "Not Specified" }} <br />
          <strong>Niche:</strong> {{ user.niche || "Not Specified" }}
        </p>
        <button @click="flagUser" class="btn btn-danger mt-3">Flag User</button>
      </div>
      <div v-else>
        <h2>User Not Found</h2>
        <p>The user you are looking for does not exist or could not be retrieved.</p>
      </div>
    </div>
  `,
};
