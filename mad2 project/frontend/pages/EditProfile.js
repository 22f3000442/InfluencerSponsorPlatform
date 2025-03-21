export default {
    template: `
      <div class="profile-container">
        <div class="profile-card">
          <div class="card-body">
            <h2>{{ hasProfile ? 'Edit Profile' : 'Create Profile' }}</h2>
            <form @submit.prevent="submitForm" class="edit-profile-container">
              <div class="form-group">
                <label for="followers">Followers</label>
                <input
                  v-model="formData.followers"
                  type="number"
                  id="followers"
                  required
                  class="form-control"
                />
              </div>
  
              <div class="form-group">
                <label for="category">Category</label>
                <input
                  v-model="formData.category"
                  type="text"
                  id="category"
                  required
                  class="form-control"
                />
              </div>
  
              <div class="form-group">
                <label for="niche">Niche</label>
                <input
                  v-model="formData.niche"
                  type="text"
                  id="niche"
                  required
                  class="form-control"
                />
              </div>
  
              <button
                type="submit"
                class="btn btn-primary"
              >
                {{ hasProfile ? 'Save Changes' : 'Create Profile' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        formData: {
          followers: '',
          category: '',
          niche: '',
        },
        hasProfile: false,
      };
    },
    async mounted() {
      try {
        const res = await fetch(`${location.origin}/api/influencers/${this.$store.state.user_id}`, {
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
          },
        });
  
        if (res.ok) {
          const profile = await res.json();
          this.formData = profile;
          this.hasProfile = true;
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    },
    methods: {
      async submitForm() {
        const method = this.hasProfile ? 'PUT' : 'POST';
        const endpoint = this.hasProfile
          ? `${location.origin}/api/influencers/${this.$store.state.user_id}`
          : `${location.origin}/api/influencers`;
  
        try {
          const response = await fetch(endpoint, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token,
            },
            body: JSON.stringify(this.formData),
          });
  
          if (response.ok) {
            alert(`${this.hasProfile ? 'Profile updated' : 'Profile created'} successfully!`);
          } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
          }
        } catch (error) {
          console.error('Error submitting profile:', error);
          alert('Failed to save the profile. Please try again.');
        }
      },
    },
  };
  