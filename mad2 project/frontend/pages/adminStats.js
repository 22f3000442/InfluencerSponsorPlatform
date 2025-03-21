export default {
  data() {
    return {
      stats: {
        active_sponsors: 0,
        active_influencers: 0,
        public_campaigns: 0,
        private_campaigns: 0,
        pending_ad_requests: 0,
        accepted_ad_requests: 0,
        rejected_ad_requests: 0,
        flagged_influencers: 0,
        flagged_sponsors: 0,
      }
    };
  },
  async mounted() {
    try {
      const res = await fetch(`${location.origin}/api/admin/stats`, {
        headers: {
          'Authentication-Token': this.$store.state.auth_token,
        }
      });

      if (res.ok) {
        const data = await res.json();
        this.stats = data;
      } else {
        console.error("Error fetching dashboard data.");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  },
  template: `
    <div class="p-4">
      <h1>Platform Stats</h1>

      <div class="stats">
      <div class="jumbotron p-4 border rounded shadow-lg my-3">
          <h4>Active Sponsors: {{ stats.active_sponsors }}</h4>
          <h4>Active Influencers: {{ stats.active_influencers }}</h4>
        </div>

        <div class="jumbotron p-4 border rounded shadow-lg my-3">
          <h4>Public Campaigns: {{ stats.public_campaigns }}</h4>
          <h4>Private Campaigns: {{ stats.private_campaigns }}</h4>
        </div>

        <div class="jumbotron p-4 border rounded shadow-lg my-3">
          <h4>Pending Ad Requests: {{ stats.pending_ad_requests }}</h4>
          <h4>Accepted Ad Requests: {{ stats.accepted_ad_requests }}</h4>
          <h4>Rejected Ad Requests: {{ stats.rejected_ad_requests }}</h4>
        </div>

        <div class="jumbotron p-4 border rounded shadow-lg my-3">
          <h4>Flagged Influencers: {{ stats.flagged_influencers }}</h4>
          <h4>Flagged Sponsors: {{ stats.flagged_sponsors }}</h4>
        </div>
      </div>
    </div>
  `
};
