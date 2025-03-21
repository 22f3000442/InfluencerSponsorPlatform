export default {
    template: `
      <div class="p-4">
        <h1>Request Details (Influencer)</h1>
        <p><strong>Request ID:</strong> {{ request.id }}</p>
        <p><strong>Sponsor:</strong> {{ request.sponsor.username }}</p>
        <p><strong>Email:</strong> {{ request.sponsor.email }}</p>
        <p><strong>Campaign:</strong> {{ request.campaign.name }}</p>
        <p><strong>Description:</strong> {{ request.campaign.description }}</p>
        <p><strong>Goals:</strong> {{ request.campaign.goals }}</p>
        <p><strong>Budget:</strong> {{ request.campaign.budget }}</p>
        <p><strong>Requirements:</strong> {{ request.requirements }}</p>
        <p><strong>Payment:</strong> {{ request.payment_amount }}</p>
        <p><strong>Status:</strong> {{ request.status }}</p>
  
        <!-- Action Buttons for Pending Requests -->
        <div v-if="request.status === 'pending'">
          <button class="btn btn-warning" @click="negotiateRequest">Negotiate</button>
          <button class="btn btn-success" @click="acceptRequest">Accept</button>
          <button class="btn btn-danger" @click="rejectRequest">Reject</button>
        </div>
        <p v-else class="text-muted">
          Actions are not available for {{ request.status }} requests.
        </p>
      </div>
    `,
    data() {
      return {
        request: null,
      };
    },
    async mounted() {
      const res = await fetch(`/api/ad_requests/${this.$route.params.requestId}`, {
        headers: { 'Authentication-Token': this.$store.state.auth_token },
      });
      this.request = await res.json();
    },
    methods: {
      async negotiateRequest() {
        this.$router.push({ name: 'UpdateRequestNegotiation', params: { request: this.request } });
      },
      async acceptRequest() {
        await this.updateRequestStatus('accepted');
      },
      async rejectRequest() {
        await this.updateRequestStatus('rejected');
      },
      async updateRequestStatus(status) {
        try {
          const res = await fetch(`/api/ad_requests/${this.request.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token,
            },
            body: JSON.stringify({ status }),
          });
          if (res.ok) {
            alert(`Request ${status} successfully!`);
            this.$router.push('/requests/influencer');
          } else {
            const error = await res.json();
            alert(`Error: ${error.message}`);
          }
        } catch (err) {
          console.error('Error:', err);
          alert('An error occurred while updating the request status.');
        }
      },
    },
  };
  