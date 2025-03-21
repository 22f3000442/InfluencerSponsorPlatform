export default {
    props: ['name', 'sponsor_id', 'start_date', 'end_date', 'campaign_id'],
    template: `
    <div class="jumbotron p-4 border rounded shadow-lg my-3">
        <h2 @click="$router.push('/campaigns/' + campaign_id)"> {{name}} </h2>
        <p> Sponsor Id: {{sponsor_id}} </p>
        <hr>
        <p> Start Date: {{formattedStartDate}}</p>
        <p> End Date: {{formattedEndDate}}</p>
    </div>
    `,
    computed: {
        formattedStartDate() {
            return new Date(this.start_date).toLocaleString();
        },
        formattedEndDate() {
            return new Date(this.end_date).toLocaleString();
        },
    }
}
