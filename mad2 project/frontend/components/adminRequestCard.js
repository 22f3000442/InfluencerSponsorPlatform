export default {
  props: ['username', 'email', 'user_id'],
  template: `
    <div class="jumbotron p-4 border rounded shadow-lg my-3">
      <h2 class="text-blue-500 cursor-pointer">{{ username }}</h2>
      <p><strong>Email:</strong> {{ email }}</p>
      <button
        @click="approveUser"
        class="btn btn-warning mt-3"
      >
        Approve
      </button>
    </div>
  `,
  methods: {
    async approveUser() {
      try {
        // Approve user via API
        const res = await fetch(`${location.origin}/api/admin/approve-sponsor/${this.user_id}`, {
          method: 'POST',
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
          },
        });
        if (!res.ok) throw new Error('Failed to approve user');
        const data = await res.json();
        alert(data.message); // Display success message
        this.$emit('user-approved', this.user_id); // Notify parent about approval
      } catch (error) {
        console.error(error);
        alert('Error approving user.');
      }
    },
  },
};
