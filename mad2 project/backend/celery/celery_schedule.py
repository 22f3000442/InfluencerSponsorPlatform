from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder, send_daily_reminders, send_monthly_activity_reports

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # every 10 seconds
    #sender.add_periodic_task(10.0, email_reminder.s('students@gmail', 'reminder to login ', '<h1> hello </h1>'))

    # daily message at 6:55 pm, everyday
    #sender.add_periodic_task(crontab(hour=14, minute=32), email_reminder.s('influencer@gmail', 'reminder to login', '<h1> hello everyone </h1>'), name='daily reminder' )

    sender.add_periodic_task(
            crontab(hour=22, minute=20),  # Adjust to desired time
            send_daily_reminders.s(),
            name="Daily influencer reminders"
        )
    # weekly messages
    #sender.add_periodic_task(crontab(hour=18, minute=55, day_of_week='monday'), email_reminder.s('influencer@gmail', 'reminder to login', '<h1> hello everyone </h1>'), name = 'weekly reminder' )
    # Schedule the monthly report on the 1st of every month
    sender.add_periodic_task(
        crontab(day_of_month=16, hour=22, minute=20),  # 9:00 AM on the 1st day
        send_monthly_activity_reports.s(),
        name="Monthly activity reports"
    )



