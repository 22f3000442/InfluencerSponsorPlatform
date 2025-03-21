import campaignCard from "../components/campaignCard.js";

export default {
    template: `
    <div class="p-4">
        <h1>Campaigns List</h1>

        <!-- Search Input -->
        <div class="mb-3">
            <input 
                type="text" 
                class="form-control" 
                placeholder="Search campaigns by name" 
                v-model="searchQuery"
            />
        </div>

        <!-- Filtered Campaign Cards -->
        <campaignCard 
            v-for="campaign in filteredCampaigns"
            :key="campaign.id"
            :name="campaign.name" 
            :start_date="campaign.start_date" 
            :end_date="campaign.end_date" 
            :sponsor_id="campaign.sponsor_id" 
            :campaign_id="campaign.id"
        />
    </div>
    `,
    data() {
        return {
            campaigns: [], // All campaigns fetched from API
            searchQuery: "", // Search query input by the user
        };
    },
    computed: {
        // Filter campaigns based on search query
        filteredCampaigns() {
            const lowerCaseQuery = this.searchQuery.toLowerCase();
            return this.campaigns.filter((campaign) =>
                campaign.name.toLowerCase().includes(lowerCaseQuery)
            );
        },
    },
    async mounted() {
        const res = await fetch(location.origin + "/api/campaigns", {
            headers: {
                "Authentication-Token": this.$store.state.auth_token,
            },
        });
        this.campaigns = await res.json();
    },
    components: {
        campaignCard,
    },
};
