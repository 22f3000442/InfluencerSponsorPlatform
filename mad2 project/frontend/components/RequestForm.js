export default {
  props: {
    isCreating: { type: Boolean, default: false },
    isUpdating: { type: Boolean, default: false },
    isNegotiating: { type: Boolean, default: false },
    request: { type: Object, default: null },
    influencerId: { type: Number, required: false }, // Only required for creation
  },
  template: `
<div class="profile-container p-4">
  <div class="profile-card">
     <div class="card-body">
      <h1>{{ formTitle }}</h1>
      <form @submit.prevent="handleSubmit">
        <!-- Campaign Selection (Only for creation) -->
        <div v-if="isCreating">
          <label for="campaign"><strong>Select Campaign:</strong></label>
          <select v-model="selectedCampaign" id="campaign" required>
            <option v-for="campaign in campaigns" :key="campaign.id" :value="campaign.id">
              {{ campaign.name }} (Budget: {{ campaign.budget }} )
            </option>
          </select>
        </div>

        <!-- Campaign Info (Read-Only for Negotiation) -->
        <div v-if="isUpdating || isNegotiating">
          <p><strong>Campaign:</strong> {{ request?.campaign?.name || "N/A" }}</p>
        </div>

        <!-- Requirements Section -->
        <div>
          <label for="requirements"><strong>Requirements:</strong></label>
          <textarea
            id="requirements"
            v-model="requirements"
            :readonly="isNegotiating || isStatusLocked"
          ></textarea>
        </div>

        <!-- Payment Section -->
        <div>
          <label for="payment"><strong>Payment Amount:</strong></label>
          <input
            id="payment"
            type="number"
            v-model="paymentAmount"
            :readonly="isStatusLocked"
            required
          />
        </div>
      

        <!-- Status Section (Editable Only for Negotiating) -->
        <div v-if="isUpdating">
          <label for="status"><strong>Status:</strong></label>
          <select v-model="status" id="status" :disabled="!canUpdateStatus">
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="negotiating">Negotiating</option>
          </select>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn btn-primary mt-3">
          {{ submitButtonText }}
        </button>
      </form>

      <div v-else>
        <p class="text-danger">You cannot modify this request.</p>
      </div>
    </div>
    </div>
    </div>
  `,
  data() {
    return {
      campaigns: [], // Available campaigns (only for creation)
      selectedCampaign: this.request?.campaign_id || null,
      requirements: this.request?.requirements || "",
      paymentAmount: this.request?.payment_amount || 0,
      status: this.request?.status || "pending", // Pre-filled status
    };
  },
  computed: {
    formTitle() {
      if (this.isCreating) return "Create New Collaboration Request";
      if (this.isUpdating) return "Update Collaboration Request";
      if (this.isNegotiating) return "Negotiate Payment for Request";
      return "";
    },
    submitButtonText() {
      if (this.isCreating) return "Create Request";
      if (this.isUpdating) return "Update Request";
      if (this.isNegotiating) return "Submit Negotiation";
      return "";
    },
    // Sponsor can only update payment and requirements for pending requests
    isStatusLocked() {
      
      return (
        !this.isNegotiating && 
        (this.request?.status === "accepted" || this.request?.status === "rejected")
      );
    },
    // Sponsor can only change the status for negotiating requests
    canUpdateRequirements() {
      return this.isUpdating && this.request?.status === "pending";
    },
    // If request is negotiating, status can be updated to accepted or rejected
    canUpdateStatus() {
      return this.isUpdating && this.request?.status === "negotiating";
    },
  },
  async mounted() {
    if (this.isCreating) {
      // Fetch campaigns only for creating a new request
      const res = await fetch('/api/campaigns', {
        headers: { 'Authentication-Token': this.$store.state.auth_token },
      });
      this.campaigns = await res.json();
    }

    if (this.isUpdating) {
      // Ensure status and other fields are set correctly for updates
      this.status = this.request?.status || "pending";
      this.requirements = this.request?.requirements || "";
      this.paymentAmount = this.request?.payment_amount || 0;
    }
  },
  methods: {
    async handleSubmit() {
      let endpoint = "";
      let method = "";
      const payload = {
        influencer_id: this.influencerId,
        campaign_id: this.selectedCampaign,
        requirements: this.requirements,
        payment_amount: this.paymentAmount,
        status: this.status,
      };

      if (this.isCreating) {
        endpoint = "/api/ad_requests";
        method = "POST";
      } else if (this.isUpdating) {
        endpoint = `/api/ad_requests/${this.request.id}`;
        method = "PUT";
      } else if (this.isNegotiating) {
        payload.status = "negotiating";
        endpoint = `/api/ad_requests/${this.request.id}`;
        method = "PUT";
      }

      try {
        const res = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          alert(
            this.isCreating
              ? "Request created successfully!"
              : "Request updated successfully!"
          );

          // Redirect based on user role
          if (this.isNegotiating) {
            this.$router.push("/requests/influencer"); // Redirect influencer
          } else {
            this.$router.push("/requests/sponsor"); // Redirect sponsor
          }
        } else {
          const error = await res.json();
          alert(`Error: ${error.message}`);
        }
      } catch (err) {
        console.error("Error:", err);
        alert("An error occurred while processing the request.");
      }
    },
  },
};
