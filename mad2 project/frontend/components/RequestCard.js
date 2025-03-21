export default {
  props: ['request', 'isSponsor'],
  template: `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Request ID: {{ request.id }}</h5>
        <p><strong>Campaign:</strong> {{ request.campaign.name }}</p>
        <p><strong>Status:</strong> {{ request.status }}</p>
        <p><strong>Payment:</strong> {{ request.payment_amount }}</p>

        <!-- View Details Button -->
        <button class="btn btn-primary" @click="viewDetails">
          View Details
        </button>
      </div>
    </div>
  `,
  methods: {
    viewDetails() {
      const routeName = this.isSponsor ? 'SponsorRequestDetails' : 'InfluencerRequestDetails';
      this.$router.push({ name: routeName, params: { requestId: this.request.id } });
    },
  },
};
