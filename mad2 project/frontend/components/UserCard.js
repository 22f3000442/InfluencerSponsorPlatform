export default {
    props: ['username', 'email', 'role', 'user_id'],
    template: `
    <div class="jumbotron p-4 border rounded shadow-lg my-3">
        <h2 @click="navigateToUser">{{ username }}</h2>
        <p><strong>Email:</strong> {{ email }}</p>
        <p><strong>Role:</strong> {{ role }}</p>
      </div>
    `,
    methods: {
      navigateToUser() {
        this.$router.push(`/admin/users/${this.user_id}`); // Correct way to navigate
      }
    }
  };
  