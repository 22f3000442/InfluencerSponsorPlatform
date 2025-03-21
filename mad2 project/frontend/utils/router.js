import campaignListPage from "../pages/campaignListPage.js";
import LoginPage from "../pages/LoginPage.js";
import InfluencerRegisterPage from "../pages/InfluencerRegisterPage.js";
import SponsorRegisterPage from "../pages/SponsorRegisterPage.js";
import campaignDisplayPage from "../pages/campaignDisplayPage.js";
import InfluencerDisplayPage from "../pages/InfluencerDisplayPage.js";
import store from './store.js'
import AdminPage from "../pages/AdminPage.js";
import sponsorDashboardPage from "../pages/sponsorDashboardPage.js";
import FeedPage from "../pages/FeedPage.js";
import AddCampaignPage from "../pages/AddCampaignPage.js";
import InfluencerListPage from "../pages/InfluencerListPage.js";
import EditProfile from "../pages/EditProfile.js";
import RequestForm from "../components/RequestForm.js";
import adminRequestsPage from "../pages/adminRequestsPage.js";
import InfluencerRequestsPage from "../pages/InfluencerRequestsPage.js";
import SponsorRequestsPage from "../pages/SponsorRequestsPage.js";
import SponsorRequestDetails from "../pages/SponsorRequestDetails.js";
import InfluencerRequestDetails from "../pages/InfluencerRequestDetails.js";
import AdminUserDetails from "../pages/AdminUserDetails.js";
import adminStats from "../pages/adminStats.js";
import { Home } from "./Home.js";



const routes = [
    {path : '/', component : Home},
    {path : '/login', component : LoginPage},
    {path : '/register/sponsor', component : SponsorRegisterPage},
    {path : '/register/influencer', component : InfluencerRegisterPage},
    {path : '/campaigns', component : campaignListPage, meta : {requiresLogin : true}},
    {path : '/feed', component : FeedPage, meta : {requiresLogin : true}},
    {path : '/campaigns/:id', component : campaignDisplayPage, props : true, meta : {requiresLogin : true}},
    {path : '/admin/users/:id', component : AdminUserDetails, props : true, meta : {requiresLogin : true}},
    {path : '/influencers/:id', component : InfluencerDisplayPage, props : true, meta : {requiresLogin : true}},
    {path : '/admin-dashboard', component : AdminPage, props : true, meta : {requiresLogin : true, role : "admin"}},
    {path : '/admin-stats', component : adminStats, props : true, meta : {requiresLogin : true, role : "admin"}},
    {path : '/admin-requests', component : adminRequestsPage, props : true, meta : {requiresLogin : true, role : "admin"}},
    {path : '/sponsor-dashboard', component : sponsorDashboardPage, props : true, meta : {requiresLogin : true, role : "sponsor"}},
    {path : '/add-campaign', component: AddCampaignPage, meta: { requiresLogin: true, role: "sponsor" } },
    {path : '/influencers', component: InfluencerListPage, meta: { requiresLogin: true, roles: ["sponsor", "admin"]} },
    {path : '/edit-profile', component: EditProfile, meta: { requiresLogin: true, role: "influencer" } },
    { path: '/requests/sponsor', component: SponsorRequestsPage, meta: { requiresLogin: true, role: "sponsor" } },
    { path: '/requests/influencer', component: InfluencerRequestsPage, meta: { requiresLogin: true, role: "influencer" } },
    {
        path: '/requests/create/:influencerId',
        name: 'CreateRequest',
        component: RequestForm,
        props: (route) => ({
          influencerId: parseInt(route.params.influencerId),
          isCreating: true
        }),
        meta: { requiresLogin: true, role: "sponsor" }
      },
      {
        path: '/requests/update/:requestId',
        name: 'UpdateRequest',
        component: RequestForm,
        props: (route) => ({
          request: route.params.request,
          isUpdating: true,
        }),
        meta: { requiresLogin: true, role: "sponsor" },
      },
      {
        path: '/requests/negotiate/:requestId',
        name: 'UpdateRequestNegotiation',
        component: RequestForm,
        props: (route) => ({
          request: route.params.request,
          isNegotiating: true,
        }),
        meta: { requiresLogin: true, role: "influencer" },
      },

      {
        path: '/sponsor/requests/details/:requestId',
        name: 'SponsorRequestDetails',
        component: SponsorRequestDetails,
        props: true,
        meta: { requiresLogin: true, role: "sponsor" },
      },

      {
        path: '/influencer/requests/details/:requestId',
        name: 'InfluencerRequestDetails',
        component: InfluencerRequestDetails,
        props: true,
        meta: { requiresLogin: true, role: "influencer" },
      },
      
      
]

const router = new VueRouter({
    routes
})

router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresLogin)){
        if (!store.state.loggedIn){
            next({path : '/login'});
        } else if (to.meta.role && to.meta.role !==store.state.role){
            alert('role not authorized')
            next({path : '/'});
        } else{
            next();
        }
    } else {
        next();
    }
})

export default router;