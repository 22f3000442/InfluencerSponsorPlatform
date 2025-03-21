export default {
  props: ['id'],
  template: `
    <div class="p-4" v-if="campaign && campaign.name">
      <h1>{{ campaign.name }}</h1>
      <p>{{ campaign.description }}</p>
      <p>Budget: {{ campaign.budget }}</p>
      <p>Goal: {{ campaign.goals }}</p>
      <p>Sponsor Id: {{ campaign.sponsor_id }}</p>
      <p>Start Date: {{ formattedStartDate }}</p>
      <p>End Date: {{ formattedEndDate }}</p>

      <!-- Conditionally show the Delete button for Sponsors -->
      <button 
        v-if="isSponsor" 
        @click="deleteCampaign" 
        class="btn btn-danger mt-3"
      >
        Delete Campaign
      </button>

      <!-- Request button visible only to Influencers -->
      <button 
        v-if="isInfluencer" 
        @click="createRequest" 
        class="btn btn-primary mt-3"
      >
        Request to Collaborate
      </button>

      <!-- Admin-only button to delete campaign -->
      <button 
        v-if="isAdmin" 
        @click="deleteCampaign" 
        class="btn btn-warning mt-3"
      >
        Remove Campaign
      </button>
    </div>
  `,
  data() {
    return {
      campaign: {},
    };
  },
  computed: {
    formattedStartDate() {
      return this.campaign.start_date
        ? new Date(this.campaign.start_date).toLocaleString()
        : '';
    },
    formattedEndDate() {
      return this.campaign.end_date
        ? new Date(this.campaign.end_date).toLocaleString()
        : '';
    },
    isSponsor() {
      return this.$store.state.user_id === this.campaign.sponsor_id;
    },
    isInfluencer() {
      return this.$store.state.role === 'influencer';
    },
    isAdmin() {
      return this.$store.state.role === 'admin';
    },
  },
  async mounted() {
    try {
      const res = await fetch(`${location.origin}/api/campaigns/${this.id}`, {
        headers: { 'Authentication-Token': this.$store.state.auth_token },
      });
      if (res.ok) {
        this.campaign = await res.json();
      } else {
        alert('Failed to fetch campaign details.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('An error occurred while fetching the campaign.');
    }
  },
  methods: {
    async deleteCampaign() {
      if (confirm('Are you sure you want to delete this campaign?')) {
        try {
          const res = await fetch(`${location.origin}/api/campaigns/${this.id}`, {
            method: 'DELETE',
            headers: { 'Authentication-Token': this.$store.state.auth_token },
          });
          if (res.ok) {
            alert('Campaign deleted successfully.');
            this.$router.push('/campaigns');
          } else {
            const error = await res.json();
            alert(`Error: ${error.message}`);
          }
        } catch (err) {
          console.error('Error:', err);
          alert('An error occurred while deleting the campaign.');
        }
      }
    }
    ,
    async createRequest() {
      try {
        const requestPayload = {
          campaign_id: this.campaign.id,
          sponsor_id: this.campaign.sponsor_id,
          influencer_id: this.$store.state.user_id,
          status: 'pending',
        };
        const res = await fetch(`${location.origin}/api/ad_requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify(requestPayload),
        });
        if (res.ok) {
          alert('Request created successfully.');
        } else {
          const error = await res.json();
          alert(`Error: ${error.message}`);
        }
      } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while creating the request.');
      }
    },
  },
};
