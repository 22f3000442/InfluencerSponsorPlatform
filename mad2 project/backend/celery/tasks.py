from datetime import datetime, timedelta

from celery import shared_task
import time
import flask_excel
from backend.models import *
from jinja2 import Template
from backend.celery.mail_service import send_email


@shared_task(ignore_result = False)
def add(x,y):
    time.sleep(10)
    return x+y

@shared_task(bind = True, ignore_result = False)
def create_csv(self):
    resource = Campaign.query.all()
    
    task_id = self.request.id
    filename = f'campaign_data_{task_id}.csv'
    column_names = [column.name for column in Campaign.__table__.columns]
    csv_out = flask_excel.make_response_from_query_sets(resource,
                                                        column_names= column_names,
                                                        file_type= 'csv')
    
    with open(f'./backend/celery/user-downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)
        
    return filename 


@shared_task(ignore_result = True)
def email_reminder(to, subject, content):
    send_email(to, subject, content)                                              
    

@shared_task(ignore_result=True)
def send_daily_reminders():
    # Get inactive influencers
    inactive_influencers = User.query.join(User.roles).filter(
        Role.name == 'influencer',
        User.last_login < datetime.utcnow() - timedelta(minutes=1)  # Adjusted to 1 day
    ).all()

    # Get influencers with pending ad requests
    pending_ad_influencers = User.query.join(
        AdRequest, User.id == AdRequest.influencer_id
    ).join(User.roles).filter(
        Role.name == 'influencer',
        AdRequest.status == 'pending'
    ).all()

    # Consolidate influencers to notify
    influencers_to_remind = set(inactive_influencers + pending_ad_influencers)

    for influencer in influencers_to_remind:
        message_content = f"""
        <h1>Hello {influencer.username}</h1>
        <p>You have pending ad requests or haven't visited our platform recently.</p>
        <p><a href="http://127.0.0.1:5000/#/login">Visit your dashboard</a></p>
        """
        send_email(influencer.email, "Daily Reminder", message_content)


@shared_task(ignore_result=True)
def send_monthly_activity_reports():
    # Get all sponsors
    sponsors = User.query.join(User.roles).filter(Role.name == 'sponsor').all()

    for sponsor in sponsors:
        # Retrieve sponsor's campaigns
        campaigns = Campaign.query.filter_by(sponsor_id=sponsor.id).all()

        # Generate the report using Jinja2 template
        template = Template("""
        <h1>Monthly Activity Report</h1>
        <p>Dear {{ sponsor.username }},</p>
        <p>Here's the summary of your campaigns:</p>
        <ul>
        {% for campaign in campaigns %}
            <li>
                <strong>{{ campaign.name }}</strong>: 
                Budget: {{ campaign.budget }}, 
                Visibility: {{ campaign.visibility }},
                Goals: {{ campaign.goals or 'No specific goals set.' }}
            </li>
        {% endfor %}
        </ul>
        """)
        report_content = template.render(sponsor=sponsor, campaigns=campaigns)

        # Send the email
        send_email(sponsor.email, "Monthly Activity Report", report_content)