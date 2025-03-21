import influencerCard from "../components/influencerCard.js";

export default {
  template: `
    <div class="p-4">
      <h1>Influencer List</h1>

      <!-- Search Input -->
      <div class="mb-3">
        <input 
          type="text" 
          class="form-control" 
          placeholder="Search influencers" 
          v-model="searchQuery"
        />
      </div>

      <!-- Filtered Influencer Cards -->
      <div v-for="influencer in filteredInfluencers" :key="influencer.id" class="mb-4">
        <influencerCard 
          :username="influencer.username"
          :email="influencer.email"
          :followers="influencer.followers"
          :category="influencer.category"
          :niche="influencer.niche"
          :influencer_id="influencer.id"
        />
        <!-- Request Button (only visible to sponsors) -->
        <button 
          v-if="isSponsor" 
          class="btn btn-primary mt-2"
          @click="goToRequestForm(influencer.id)"
        >
          Request Collaboration
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      influencers: [], // All influencers fetched from API
      searchQuery: "", // Search query input by the user
      isSponsor: false, // Tracks if the user has the sponsor role
    };
  },
  computed: {
    // Filter influencers based on search query
    filteredInfluencers() {
      const query = this.searchQuery.toLowerCase();
      return this.influencers.filter((influencer) => 
        influencer.username.toLowerCase().includes(query)
      );
    },
  },
  async mounted() {
    try {
      // Fetch influencers
      const res = await fetch(location.origin + '/api/influencers', {
        headers: {
          'Authentication-Token': this.$store.state.auth_token,
        },
      });
      this.influencers = await res.json();

      // Fetch user roles (adjust API endpoint as necessary)
      const userRes = await fetch(location.origin + '/api/user', {
        headers: {
          'Authentication-Token': this.$store.state.auth_token,
        },
      });
      const user = await userRes.json();
      this.isSponsor = user.roles.includes('sponsor');
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  },
  methods: {
    goToRequestForm(influencerId) {
      // Navigate to the request form page with the influencer ID
      this.$router.push({ name: 'CreateRequest', params: { influencerId } });
    },
  },
  components: {
    influencerCard,
  },
};
