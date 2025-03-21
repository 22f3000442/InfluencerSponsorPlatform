export const Home = {
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1 class="hero-title">Welcome to Influencer Engagement & Sponsorship Coordination Platform </h1>
        <p class="hero-description">
          Connect with top influencers and sponsors to create impactful campaigns and grow your reach!
        </p>
        <button class="cta-button" @click="navigateToCampaigns">
          Explore Campaigns
        </button>
      </div>
      <div class="features-section">
        <div class="feature">
          <i class="fas fa-user-friends feature-icon"></i>
          <h3>Collaborate</h3>
          <p>Find the perfect influencer or sponsor for your needs.</p>
        </div>
        <div class="feature">
          <i class="fas fa-chart-line feature-icon"></i>
          <h3>Grow</h3>
          <p>Boost your brand with data-driven campaigns.</p>
        </div>
        <div class="feature">
          <i class="fas fa-shield-alt feature-icon"></i>
          <h3>Secure</h3>
          <p>Experience safe and seamless transactions.</p>
        </div>
      </div>
    </div>
  `,
  methods: {
    navigateToCampaigns() {
      this.$router.push("/campaigns");
    },
  },
};
