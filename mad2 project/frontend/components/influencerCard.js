export default {
  props: ['username', 'email', 'followers', 'category', 'niche', 'influencer_id'],
  template: `
  <div class="jumbotron p-4 border rounded shadow-lg my-3">
      <h2 @click="$router.push('/influencers/' + influencer_id)"> {{ username }}</h2>
     
      <p><strong>Email:</strong> {{ email }}</p>
    </div>
  `,
  
  };
  