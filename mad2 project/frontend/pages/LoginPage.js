export default {
    template : `
    <div class="login-container">
        <div class="card">
            <div class="card-body">
                <h3 class="text-center mb-4">Login</h3>
                <div class="form-group">
                    <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Username" 
                        v-model="username" 
                    />
                </div>
                <div class="form-group">
                    <input 
                        type="password" 
                        class="form-control" 
                        placeholder="Password" 
                        v-model="password" 
                    />
                </div>
                <button 
                    class="btn btn-primary btn-block" 
                    @click="submitLogin"
                >
                    Login
                </button>
            </div>
        </div>
    </div>

    `,
    data(){
        return {
            username : null,
            password : null,
        } 
    },
    methods: {
        async submitLogin() {
            try {
                const res = await fetch(location.origin + '/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: this.username, password: this.password }),
                });
                
                if (res.ok) {
                    console.log('Login successful');
                    const data = await res.json();
                    console.log(data);
    
                    // Save user data in localStorage
                    localStorage.setItem('user', JSON.stringify(data));
                    
                    // Commit the user data to Vuex store
                    this.$store.commit('setUser', data);
    
                    // Redirect based on the user's role
                    const userRole = data.role; // Assuming `data` has a `role` property
                    if (userRole === 'sponsor' ) {
                        this.$router.push('/campaigns');
                    } else if (userRole === 'influencer') {
                        this.$router.push('/requests/influencer');
                    } else if (userRole === 'admin') {
                        this.$router.push('/admin-requests');
                    }
                    else {
                        console.error('Unknown role:', userRole);
                        alert('Invalid user role!');
                    }
                } else {
                    console.error('Login failed', await res.text());
                    alert('Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred. Please try again later.');
            }
        },
    }
    
}