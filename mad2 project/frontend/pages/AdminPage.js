import UserCard from '../components/UserCard.js';

export default {
  components: {
    UserCard, // Register here
  },
  data() {
    return {
      users: [],
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await fetch('/api/admin/users', {
            headers : {
                'Authentication-Token' : this.$store.state.auth_token
            }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        this.users = await response.json();
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
  template: `
    <div>
      <h1>All Users</h1>
      <div v-for="user in users" :key="user.id">
        <UserCard 
        :username="user.username" 
        :email="user.email" 
        :role="user.role"
        :user_id="user.id"  
        />
    
      </div>
    </div>
  `,
};
