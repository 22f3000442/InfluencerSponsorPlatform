export default {
  template: `
    <div class="p-4">
      <h1>Request Details</h1>
      <p><strong>Influencer:</strong> {{ request.influencer.username }}</p>
      <p><strong>Email:</strong> {{ request.influencer.email }}</p>
      <p><strong>Campaign:</strong> {{ request.campaign.name }}</p>
      <p><strong>Requirements:</strong> {{ request.requirements }}</p>
      <p><strong>Budget:</strong> {{ request.campaign.budget }}</p>
      <p><strong>Payment:</strong> {{ request.payment_amount }}</p>
      <p><strong>Status:</strong> {{ request.status }}</p>

      <!-- Action Buttons based on Request Status -->
      <div>
        <!-- For Pending Requests -->
        <div v-if="request.status === 'pending'">
          <button class="btn btn-primary" @click="goToUpdateRequest">Update Request</button>
          <button class="btn btn-danger" @click="deleteRequest">Delete Request</button>
        </div>

        <!-- For Negotiating Requests -->
        <div v-if="request.status === 'negotiating'">
          <button class="btn btn-success" @click="acceptRequest">Accept Request</button>
          <button class="btn btn-danger" @click="rejectRequest">Reject Request</button>
          <button class="btn btn-danger" @click="deleteRequest">Delete Request</button>
        </div>

        <!-- For Accepted or Rejected Requests -->
        <div v-if="request.status === 'accepted' || request.status === 'rejected'">
          <button class="btn btn-danger" @click="deleteRequest">Delete Request</button>
        </div>
      </div>
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
    goToUpdateRequest() {
      this.$router.push({
        name: 'UpdateRequest',
        params: { requestId: this.request.id, request: this.request },
      });
    },
    async deleteRequest() {
      try {
        const res = await fetch(`/api/ad_requests/${this.request.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
        });
        if (res.ok) {
          alert('Request deleted successfully!');
          this.$router.push('/requests/sponsor'); // Redirect to sponsor's request page
        } else {
          const error = await res.json();
          alert(`Error: ${error.message}`);
        }
      } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while deleting the request.');
      }
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
          this.$router.push('/requests/sponsor'); // Redirect to sponsor's request page
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
