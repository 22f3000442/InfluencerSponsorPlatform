export default {
    template: `
      <div class="profile-container">
        <div class="profile-card">
          <div class="card-body">
            <h1 class="text-center">Add New Campaign</h1>
            <form @submit.prevent="submitForm" class="edit-profile-container">
              <div class="form-group">
                <label for="name">Campaign Name</label>
                <input
                  v-model="formData.name"
                  type="text"
                  id="name"
                  class="form-control"
                  required
                />
              </div>
  
              <div class="form-group">
                <label for="description">Description</label>
                <textarea
                  v-model="formData.description"
                  id="description"
                  class="form-control"
                  required
                ></textarea>
              </div>
  
              <div class="form-group">
                <label for="start_date">Start Date</label>
                <input
                  v-model="formData.start_date"
                  type="date"
                  id="start_date"
                  class="form-control"
                  required
                />
              </div>
  
              <div class="form-group">
                <label for="end_date">End Date</label>
                <input
                  v-model="formData.end_date"
                  type="date"
                  id="end_date"
                  class="form-control"
                  required
                />
              </div>
  
              <div class="form-group">
                <label for="budget">Budget</label>
                <input
                  v-model="formData.budget"
                  type="number"
                  id="budget"
                  class="form-control"
                  required
                />
              </div>
  
              <div class="form-group">
                <label for="visibility">Visibility</label>
                <select
                  v-model="formData.visibility"
                  id="visibility"
                  class="form-control"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
  
              <div class="form-group">
                <label for="goals">Goals</label>
                <textarea
                  v-model="formData.goals"
                  id="goals"
                  class="form-control"
                ></textarea>
              </div>
  
              <button type="submit" class="btn btn-primary">
                Create Campaign
              </button>
            </form>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        formData: {
          name: '',
          description: '',
          start_date: '',
          end_date: '',
          budget: 0,
          visibility: 'public',
          goals: '',
        },
      };
    },
    methods: {
      async submitForm() {
        try {
          const response = await fetch(`${location.origin}/api/campaigns`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token,
            },
            body: JSON.stringify(this.formData),
          });
  
          if (!response.ok) {
            const error = await response.json();
            alert(`Error: ${error.message}`);
            return;
          }
  
          alert('Campaign successfully created!');
          this.$router.push('/campaigns'); // Redirect to the campaigns list page
        } catch (error) {
          console.error('Error creating campaign:', error);
          alert('Failed to create the campaign. Please try again.');
        }
      },
    },
  };
  