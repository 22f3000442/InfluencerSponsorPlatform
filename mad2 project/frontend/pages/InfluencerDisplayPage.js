import EditProfile from '../pages/EditProfile.js'; // Adjust path as needed

export default {
    props: ['id'], // id comes from the route parameter
    template: `
     <div class="profile-container p-4">
        <div class="card profile-card">
            <div class="card-body">
                <h1 class="text-center">{{ influencer.username }}</h1>
                <p><strong>Email:</strong> {{ influencer.email }}</p>
                <p><strong>Followers:</strong> {{ influencer.followers }}</p>
                <p><strong>Category:</strong> {{ influencer.category }}</p>
                <p><strong>Niche:</strong> {{ influencer.niche }}</p>
            </div>
            <div class="card-footer text-center">
                <button
                    v-if="isLoggedInInfluencer"
                    @click="isEditing = !isEditing"
                    class="btn btn-secondary"
                >
                    {{ isEditing ? "Cancel Edit" : "Edit Profile" }}
                </button>
                
                <button
                    v-if="isLoggedInSponsor"
                    @click="navigateToRequestForm"
                    class="btn btn-success mt-3"
                >
                    Request Collaboration
                </button>
            </div>
        </div>

        <div class="edit-profile-container mt-4" v-if="isEditing">
            <EditProfile
                :initialProfile="influencer"
                @profile-updated="updateProfile"
            />
        </div>
    </div>
    `,
    data() {
        return {
            influencer: {}, // To store fetched influencer details
            isEditing: false, // Track if the edit form is being shown
        };
    },
    computed: {
        // Check if the logged-in user is the same as the displayed influencer
        isLoggedInInfluencer() {
            return (
                this.$store.state.role === 'influencer' &&
                this.$store.state.user_id === Number(this.id)
            );
        },
        // Check if the logged-in user is a sponsor
        isLoggedInSponsor() {
            return this.$store.state.role === 'sponsor';
        },
    },
    async mounted() {
        await this.fetchInfluencerDetails();
    },
    methods: {
        async fetchInfluencerDetails() {
            try {
                const response = await fetch(
                    `${location.origin}/api/influencers/${this.id}`,
                    {
                        headers: {
                            'Authentication-Token': this.$store.state.auth_token,
                        },
                    }
                );

                if (response.ok) {
                    this.influencer = await response.json();
                } else {
                    console.error('Failed to fetch influencer details');
                }
            } catch (error) {
                console.error('Error fetching influencer details:', error);
            }
        },
        updateProfile(updatedProfile) {
            // Update the displayed details after editing
            this.influencer = updatedProfile;
            this.isEditing = false;
        },
        navigateToRequestForm() {
            // Navigate to the collaboration request creation form
            this.$router.push({
                name: 'CreateRequest',
                params: { influencerId: Number(this.id) },
            });
        },
    },
    components: {
        EditProfile,
    },
};
