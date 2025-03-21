import RequestCard from "../components/RequestCard.js";

export default {
  components: {
    RequestCard,
  },
  template: `
    <div class="p-4">

      <!-- Pending Requests -->
      <div v-if="pendingRequests.length">
        <h2>Pending Requests</h2>
        <div v-for="request in pendingRequests" :key="request.id">
          <RequestCard :request="request" :isSponsor="false" />
        </div>
      </div>

      <!-- Negotiated Requests -->
      <div v-if="negotiatedRequests.length">
        <h2>Negotiated Requests</h2>
        <div v-for="request in negotiatedRequests" :key="request.id">
          <RequestCard :request="request" :isSponsor="false" />
        </div>
      </div>

      <!-- Accepted Requests -->
      <div v-if="acceptedRequests.length">
        <h2>Accepted Requests</h2>
        <div v-for="request in acceptedRequests" :key="request.id">
          <RequestCard :request="request" :isSponsor="false" />
        </div>
      </div>

      <!-- Rejected Requests -->
      <div v-if="rejectedRequests.length">
        <h2>Rejected Requests</h2>
        <div v-for="request in rejectedRequests" :key="request.id">
          <RequestCard :request="request" :isSponsor="false" />
        </div>
      </div>

      <!-- Message if No Requests -->
      <div v-if="!requests.length">
        <p>No requests available.</p>
      </div>
    </div>
  `,
  data() {
    return {
      requests: [], // All requests fetched from the API
    };
  },
  computed: {
    pendingRequests() {
      return this.requests.filter((request) => request.status === "pending");
    },
    negotiatedRequests() {
      return this.requests.filter((request) => request.status === "negotiating");
    },
    acceptedRequests() {
      return this.requests.filter((request) => request.status === "accepted");
    },
    rejectedRequests() {
      return this.requests.filter((request) => request.status === "rejected");
    },
  },
  async mounted() {
    const res = await fetch('/api/ad_requests', {
      headers: { 'Authentication-Token': this.$store.state.auth_token },
    });
    this.requests = await res.json();
  },
};
