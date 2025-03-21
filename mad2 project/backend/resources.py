from flask import jsonify, request, current_app as app
from datetime import datetime
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, current_user
from backend.models import *

cache = app.cache
api = Api(prefix = '/api')



pending_sponsor_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
}

class PendingSponsorsAPI(Resource):
    @auth_required('token')  # Admin-only access
    @marshal_with(pending_sponsor_fields)  # Automatically formats the response
    def get(self):
        try:
            pending_users = User.query.join(User.roles).filter(
                Role.name == 'sponsor', User.active == False
            ).all()

            return pending_users
        except Exception as e:
            app.logger.error(f"Error fetching pending sponsors: {e}")
            return {'message': 'Internal server error'}, 500




class ApproveSponsorAPI(Resource):
    @auth_required('token')  # Ensure admin-only access
    def post(self, user_id):
        user = User.query.get(user_id)

        if not user:
            return {'message': 'User not found'}, 404

        if 'sponsor' not in [role.name for role in user.roles]:
            return {'message': 'User is not a sponsor'}, 400

        try:
            user.active = True
            db.session.commit()
            return {'message': f'{user.username} approved successfully!'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error approving user: {str(e)}'}, 500


campaign_fields = {
    'id' : fields.Integer,
    'name' : fields.String,
    'description' : fields.String,
    'start_date' : fields.DateTime,
    'end_date' : fields.DateTime,
    'budget' : fields.Float,
    'visibility': fields.String,
    'goals' : fields.String,
    'sponsor_id' : fields.Integer,
    'sponsor.email' : fields.String,
    
}

class CampaignAPI(Resource):
    @marshal_with(campaign_fields)
    @auth_required('token')
    @cache.memoize(timeout=5)
    def get(self, campaign_id):
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return {"message": "not found"}, 404
        return campaign

    @auth_required('token')
    def delete(self, campaign_id):
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return {"message": "not found"}, 404
        # Check if the logged-in user is the sponsor
        if campaign.sponsor_id == current_user.id or 'admin' in [role.name for role in current_user.roles]:
            db.session.delete(campaign)
            db.session.commit()
            return {"message": "Campaign deleted successfully."}, 200
        else:
            return {"message": "Unauthorized action"}, 403
      


class CampaignListAPI(Resource):
    @marshal_with(campaign_fields)
    @auth_required('token')
    @cache.cached(timeout=5, key_prefix="campaign_list")
    def get(self):
        # Check if the current user has the 'admin' role
        if any(role.name == 'admin' for role in current_user.roles):
            # Admin sees all campaigns
            campaigns = Campaign.query.all()
        else:
            # Sponsor sees only their own campaigns
            campaigns = Campaign.query.filter_by(sponsor_id=current_user.id).all()
        return campaigns



    @auth_required('token')
    def post(self):
        data = request.get_json()
        name = data.get("name")
        description = data.get("description")
        start_date = datetime.strptime(data.get("start_date"), '%Y-%m-%d')
        end_date =datetime.strptime(data.get("end_date"), '%Y-%m-%d')
        budget = data.get("budget")
        visibility = data.get("visibility", "public")
        goals = data.get("goals")

        campaign = Campaign(name =  name, description = description, start_date = start_date, end_date = end_date, budget = budget,visibility = visibility, goals = goals, sponsor_id = current_user.id)
        db.session.add(campaign)
        db.session.commit()
        return jsonify({"message" : "campaign created"})

influencer_list_fields = {
    'id' : fields.Integer,
    'username' : fields.String,
    'email' : fields.String,
    'followers' : fields.Integer,
    'category' : fields.String,
    'niche' : fields.String,
    }

class InfluencerListAPI(Resource):
    
    @marshal_with(influencer_list_fields)
    def get(self):
        query = request.args.get('query')

        if query:
            influencers = User.query.join(User.roles).filter(
                Role.name == 'influencer',
                User.active == True,
                User.email.ilike(f'%{query}%')
            ).all()
        else :
            influencers = User.query.join(User.roles).filter(Role.name == 'influencer', User.active == True).all()
        
        return influencers



    
    
    @auth_required('token')
    def post(self):
        """Create or update an influencer profile."""
        try:
            data = request.get_json()
            category = data.get("category")
            niche = data.get("niche")
            followers = data.get("followers")

            # Validate required fields
            if not category or not niche or not followers:
                return {"message": "Missing required fields: 'category', 'niche', or 'followers'"}, 400

            # Check if the profile already exists
            profile = InfluencerProfile.query.filter_by(user_id=current_user.id).first()

            if profile:
                # Update existing profile
                profile.category = category
                profile.niche = niche
                profile.followers = followers
            else:
                # Create new profile
                profile = InfluencerProfile(
                    user_id=current_user.id,
                    category=category,
                    niche=niche,
                    followers=followers
                )
                db.session.add(profile)

            db.session.commit()
            return {"message": "Influencer profile saved successfully"}, 200

        except Exception as e:
            app.logger.error(f"Error saving influencer profile: {str(e)}")
            return {"message": "An error occurred on the server"}, 500


influencers_fields  = {
    'id' : fields.Integer,
    'username' : fields.String,
    'email' : fields.String,
    'followers' : fields.Integer,
    'category' : fields.String,
    'niche' : fields.String,
    'campaigns' : fields.List(fields.Nested(campaign_fields))
}

class InfluencerAPI(Resource):
    @marshal_with(influencers_fields)
    def get(self, influencer_id):
        influencer = User.query.get(influencer_id)
        if not influencer:
            return {'message': 'Influencer not found'}, 404

        # Fetch the influencer profile
        profile = InfluencerProfile.query.filter_by(user_id=influencer.id).first()
        if not profile:
            return {'message': 'Influencer profile not found'}, 404

        return {
            'id': influencer.id,
            'username': influencer.username,
            'email': influencer.email,
            'followers': profile.followers,
            'category': profile.category,
            'niche': profile.niche,
        }

    @auth_required('token')
    def put(self, influencer_id):
        """Update an existing influencer profile."""
        data = request.get_json()

        category = data.get("category")
        niche = data.get("niche")
        followers = data.get("followers")

        if not category or not niche or not followers:
            return {"message": "Missing required fields: 'category', 'niche', or 'followers'"}, 400

        influencer = User.query.get(influencer_id)
        if not influencer:
            return {'message': 'Influencer not found'}, 404

        # Ensure the current user is authorized to update this profile
        if influencer.id != current_user.id:
            return {'message': 'Unauthorized access'}, 403

        # Fetch the profile
        profile = InfluencerProfile.query.filter_by(user_id=influencer.id).first()
        if not profile:
            return {'message': 'Influencer profile not found'}, 404

        # Update the profile fields
        profile.category = category
        profile.niche = niche
        profile.followers = followers

        db.session.commit()
        return {"message": "Influencer profile updated successfully"}, 200



class FeedAPI(Resource):
    @marshal_with(campaign_fields)
    @auth_required('token')
    def get(self):
        # Fetch the influencer's profile
        influencer_profile = InfluencerProfile.query.filter_by(user_id=current_user.id).first()
        
        if not influencer_profile:
            return {'message': 'Profile not found. Please complete your influencer profile.'}, 404
        
        influencer_niche = influencer_profile.niche
        influencer_category = influencer_profile.category

        # Fetch campaigns matching the influencer's niche and category
        campaigns = get_filtered_campaigns(influencer_niche, influencer_category)
        
        if not campaigns:
            return {'message': 'No public campaigns matching your niche.'}, 200
        
        return campaigns



@cache.memoize(timeout=10)
def get_filtered_campaigns(niche, category):
    return Campaign.query.filter(
        Campaign.visibility == 'public',
        (
            Campaign.description.ilike(f"%{niche}%") |  # Match niche in description
            Campaign.description.ilike(f"%{category}%")  # Match category in description
        )
    ).all()


adrequest_fields = {
    'id': fields.Integer,
    'requirements': fields.String,
    'payment_amount': fields.Float,
    'status': fields.String,
    'campaign': fields.Nested({
        'id': fields.Integer,
        'name': fields.String,
        'goals': fields.String,
        'description': fields.String,
        'budget': fields.Float,
        'start_date': fields.DateTime,
        'end_date': fields.DateTime,
        'visibility': fields.String,
    }),
    'sponsor': fields.Nested({
        'id': fields.Integer,
        'username': fields.String,
        'email': fields.String,
    }),
    'influencer': fields.Nested({
        'id': fields.Integer,
        'username': fields.String,
        'email': fields.String
    }),  
}



class AdRequestAPI(Resource):
    @auth_required('token')
    @marshal_with(adrequest_fields)
    def get(self, request_id=None):
        if request_id:
            ad_request = AdRequest.query.get(request_id)
            if not ad_request:
                return {"message": "Ad request not found"}, 404
            return ad_request

        # Fetch requests based on user role
        if any(role.name == 'sponsor' for role in current_user.roles):
            ad_requests = AdRequest.query.filter_by(sponsor_id=current_user.id).all()
        elif any(role.name == 'influencer' for role in current_user.roles):
            ad_requests = AdRequest.query.filter_by(influencer_id=current_user.id).all()
        else:
            return {"message": "Unauthorized access"}, 403

        return ad_requests

    @auth_required('token')
    def post(self):
        data = request.get_json()
        sponsor_id = current_user.id
        influencer_id = data.get("influencer_id")
        campaign_id = data.get("campaign_id")
        payment_amount = data.get("payment_amount")
        requirements = data.get("requirements", "")

        if not campaign_id or not influencer_id:
            return {"message": "Missing required fields: campaign_id or influencer_id"}, 400

        campaign = Campaign.query.get(campaign_id)

        # Check if the campaign exists and if the user has access
        if not campaign:
            return {"message": "Campaign not found."}, 404

        # If campaign is private, ensure it's the sponsor making the request
        if campaign.visibility == 'private' and campaign.sponsor_id != sponsor_id:
            return {"message": "Not authorized to create request for this private campaign."}, 403

        # Allow influencers to create requests for public campaigns
        if campaign.visibility == 'public' and current_user.id != sponsor_id:
            sponsor_id = None  # No need for a sponsor id, as the influencer is making the request

        ad_request = AdRequest(
            sponsor_id=sponsor_id,
            influencer_id=influencer_id,
            campaign_id=campaign_id,
            requirements=requirements,
            payment_amount=payment_amount,
            status="pending",
        )

        try:
            db.session.add(ad_request)
            db.session.commit()
            return {"message": "Ad request created successfully", "id": ad_request.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


    @auth_required('token')
    def put(self, request_id):
        data = request.get_json()
        ad_request = AdRequest.query.get(request_id)

        if not ad_request:
            return {"message": "Ad request not found"}, 404

        is_sponsor = ad_request.sponsor_id == current_user.id
        is_influencer = ad_request.influencer_id == current_user.id

        if not is_sponsor and not is_influencer:
            return {"message": "Not authorized to edit this ad request"}, 403

        # Restrict status changes for influencers
        if is_influencer:
            if ad_request.status in ["negotiating", "accepted", "rejected"]:
                return {"message": f"You cannot modify a request that is {ad_request.status}."}, 400

            
            if ad_request.status == "pending":
                # Allow influencers to accept or reject a pending request
                if data.get("status") in ["accepted", "rejected"]:
                    ad_request.status = data["status"]
                elif data.get("status") == "negotiating":
                    ad_request.payment_amount = data.get("payment_amount", ad_request.payment_amount)
                    ad_request.status = "negotiating"
                else:
                    return {"message": "Invalid status update for pending request."}, 400

        if is_sponsor:
            # Sponsors can update all fields
            ad_request.requirements = data.get("requirements", ad_request.requirements)
            ad_request.payment_amount = data.get("payment_amount", ad_request.payment_amount)
            ad_request.status = data.get("status", ad_request.status)

        try:
            db.session.commit()
            return {"message": "Ad request updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500

    @auth_required('token')
    def delete(self, request_id):
        ad_request = AdRequest.query.get(request_id)

        if not ad_request:
            return {"message": "Ad request not found"}, 404

        if ad_request.sponsor_id != current_user.id:
            return {"message": "Only the sponsor can delete this request"}, 403

        try:
            db.session.delete(ad_request)
            db.session.commit()
            return {"message": "Ad request deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


admin_user_list_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'role': fields.String,  # Sponsor or Influencer
}

class AdminUserListAPI(Resource):
    @auth_required('token')
    @marshal_with(admin_user_list_fields)
    def get(self):
        # Ensure the requester is an admin
        if 'admin' not in [role.name for role in current_user.roles]:
            return {"message": "Access denied. Admins only."}, 403

        # Fetch sponsors and influencers
        users = User.query.join(User.roles).filter(
            Role.name.in_(['sponsor', 'influencer'])
        ).all()

        user_list = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": [role.name for role in user.roles][0],  # Assuming single role per user
            }
            for user in users
        ]
        return user_list


class AdminUserAPI(Resource):
    @auth_required('token')
    def get(self, user_id):
        # Ensure the requester is an admin
        if 'admin' not in [role.name for role in current_user.roles]:
            return {"message": "Access denied. Admins only."}, 403

        # Fetch the user by ID
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found."}, 404

        roles = [role.name for role in user.roles]
        if 'sponsor' in roles:
            return {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": "sponsor",
                "campaigns": [campaign.name for campaign in user.campaigns],
            }
        elif 'influencer' in roles:
            profile = InfluencerProfile.query.filter_by(user_id=user.id).first()
            return {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": "influencer",
                "followers": profile.followers,
                "category": profile.category,
                "niche": profile.niche,
            }
        else:
            return {"message": "Invalid user role."}, 400


class FlagUserAPI(Resource):
    @auth_required('token')
    def post(self, user_id):
        # Ensure the requester is an admin
        if 'admin' not in [role.name for role in current_user.roles]:
            return {"message": "Access denied. Admins only."}, 403

        # Fetch the user by ID
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found."}, 404

        # Check if the user is a sponsor or influencer
        roles = [role.name for role in user.roles]
        if 'sponsor' not in roles and 'influencer' not in roles:
            return {"message": "User is neither a sponsor nor an influencer."}, 400

        try:
            # Flag the user
            user.flagged = True
            db.session.commit()
            return {"message": f"{user.username} flagged successfully."}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500


class AdminStats(Resource):
    @auth_required('token')
    def get(self):
        # Ensure the requester is an admin
        if 'admin' not in [role.name for role in current_user.roles]:
            return {"message": "Access denied. Admins only."}, 403

        try:
            # Fetch active users
            active_sponsors = User.query.join(User.roles).filter(
                Role.name == 'sponsor', User.active == True).count()
            active_influencers = User.query.join(User.roles).filter(
                Role.name == 'influencer', User.active == True).count()

            # Fetch campaigns (public/private)
            public_campaigns = Campaign.query.filter(Campaign.visibility == 'public').count()
            private_campaigns = Campaign.query.filter(Campaign.visibility == 'private').count()

            # Fetch ad requests based on status
            pending_ad_requests = AdRequest.query.filter(AdRequest.status == 'pending').count()
            accepted_ad_requests = AdRequest.query.filter(AdRequest.status == 'accepted').count()
            rejected_ad_requests = AdRequest.query.filter(AdRequest.status == 'rejected').count()

            # Fetch flagged users (sponsors and influencers)
            flagged_users = User.query.filter_by(flagged=True).all()
            flagged_influencers = [user for user in flagged_users if 'influencer' in [role.name for role in user.roles]]
            flagged_sponsors = [user for user in flagged_users if 'sponsor' in [role.name for role in user.roles]]

            # Return the statistics
            return jsonify({
                "active_sponsors": active_sponsors,
                "active_influencers": active_influencers,
                "public_campaigns": public_campaigns,
                "private_campaigns": private_campaigns,
                "pending_ad_requests": pending_ad_requests,
                "accepted_ad_requests": accepted_ad_requests,
                "rejected_ad_requests": rejected_ad_requests,
                "flagged_influencers": len(flagged_influencers),
                "flagged_sponsors": len(flagged_sponsors),
            })

        except Exception as e:
            app.logger.error(f"Error fetching dashboard data: {str(e)}")
            return {"message": "Internal server error"}, 500


api.add_resource(AdminStats, '/admin/stats')
api.add_resource(FlagUserAPI, '/user/<int:user_id>/flag')
api.add_resource(AdminUserListAPI, '/admin/users')
api.add_resource(AdminUserAPI, '/admin/users/<int:user_id>')
api.add_resource(PendingSponsorsAPI, '/admin/pending-sponsors')
api.add_resource(ApproveSponsorAPI, '/admin/approve-sponsor/<int:user_id>')
api.add_resource(CampaignAPI,'/campaigns/<int:campaign_id>')
api.add_resource(CampaignListAPI, '/campaigns')
api.add_resource(InfluencerListAPI, '/influencers')
api.add_resource(FeedAPI, '/feed')
api.add_resource(InfluencerAPI,'/influencers/<int:influencer_id>')
api.add_resource(AdRequestAPI, '/ad_requests/<int:request_id>', '/ad_requests')
