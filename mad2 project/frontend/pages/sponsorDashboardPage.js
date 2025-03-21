export default {
    template: `
    <div class="p-4">
        <h1>Welcome to the Sponsor Dashboard</h1>
        <button @click="createCSV" class="btn btn-primary">Export Campaigns as CSV</button>
        <p v-if="loading">Generating CSV... Please wait.</p>
    </div>
    `,
    data() {
        return {
            loading: false, // Indicates if the CSV generation is in progress
        };
    },
    methods: {
        async createCSV() {
            this.loading = true;

            // Start CSV creation
            const res = await fetch(location.origin + '/create-csv', {
                headers: {
                    'Authentication-Token': this.$store.state.auth_token,
                },
            });

            if (!res.ok) {
                console.error('Failed to start CSV creation');
                this.loading = false;
                return;
            }

            const { task_id } = await res.json();

            // Poll for task completion
            const interval = setInterval(async () => {
                const res = await fetch(`${location.origin}/get-csv/${task_id}`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (res.ok) {
                    console.log('CSV is ready');
                    // Download CSV
                    window.open(`${location.origin}/get-csv/${task_id}`);
                    clearInterval(interval);
                    this.loading = false;
                }
            }, 2000); // Poll every 2 seconds
        },
    },
};
