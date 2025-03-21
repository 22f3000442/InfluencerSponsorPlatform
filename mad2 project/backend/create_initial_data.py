from flask import current_app as app
from backend.models import db
from flask_security import SQLAlchemyUserDatastore, hash_password

with app.app_context():
    db.create_all()

    userdatastore : SQLAlchemyUserDatastore = app.security.datastore

    userdatastore.find_or_create_role(name ='admin', description = 'superuser')
    userdatastore.find_or_create_role(name ='sponsor', description = 'sponsor')
    userdatastore.find_or_create_role(name ='influencer', description = 'influencer')
    
    if (not userdatastore.find_user(email = 'admin@study.iitm.ac.in')):
        userdatastore.create_user(email = 'admin@study.iitm.ac.in', username= 'admin', password = hash_password('pass'), roles = ['admin'])
    if (not userdatastore.find_user(email = 'sponsor01@study.iitm.ac.in')):
        userdatastore.create_user(email = 'sponsor01@study.iitm.ac.in', username= 'sponsor01', password = hash_password('pass'), roles = ['sponsor'])
    if (not userdatastore.find_user(email = 'influencer01@study.iitm.ac.in')):
        userdatastore.create_user(email = 'influencer01@study.iitm.ac.in', username= 'influencer01', password =  hash_password('pass'), roles = ['influencer'])
    
    db.session.commit()