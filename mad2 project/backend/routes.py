from flask import current_app as app, request, jsonify, render_template, send_file
from flask_security import auth_required, verify_password, hash_password, current_user
from backend.models import db, InfluencerProfile
from datetime import datetime
from backend.celery.tasks import add, create_csv
from celery.result import AsyncResult

datastore = app.security.datastore
cache = app.cache

@app.get('/')
def home():
    return render_template('index.html')

@app.get('/celery')
def celery():
    task = add.delay(10, 20)
    return {'task_id' : task.id}

@app.get('/get-celery-data/<id>')
def getData(id):
    result = AsyncResult(id)

    if result.ready():
        return {'result' : result.result}, 200
    else:
        return {'message' : 'task not ready'}, 405

@auth_required('token')
@app.get('/create-csv')
def createCSV():
    task = create_csv.delay()
    return {'task_id' : task.id}, 200

@auth_required('token')
@app.get('/get-csv/<id>')
def getCSV(id):
    
    result = AsyncResult(id)

    if result.ready():
        return send_file(f'./backend/celery/user-downloads/{result.result}'), 200
    else:
        return {'message' : 'task not ready'}, 405

from flask_security import current_user

@app.route('/api/current_user', methods=['GET'])
@auth_required('token')
def get_current_user():
    if current_user.is_authenticated:
        return jsonify({
            'id': current_user.id,
            'email': current_user.email,
            'roles': [role.name for role in current_user.roles]
        })
    else:
        return jsonify({'message': 'Not authenticated'}), 401



@app.get('/cache')
@cache.cached(timeout = 5)
def cache():
    return {'time' : str(datetime.now())}

@app.get('/protected')
@auth_required('token')
def protected():
    return '<h1> only accsessible by auth user </h1>'


from datetime import datetime

@app.route('/login', methods=['GET', 'POST'])
def login():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Invalid username or password'}), 404
    
    # Find user by username
    user = datastore.find_user(username=username)

    if not user:
        return jsonify({'message': 'Invalid user'}), 404
    
    # **Check if the user is flagged**
    if user.flagged:
        return jsonify({'message': 'Your account has been flagged. Please contact support.'}), 403
    
    # Verify the password
    if verify_password(password, user.password):
        # Update the last login timestamp
        user.last_login = datetime.utcnow()
        db.session.commit()  # Commit the change to the database
        
        # Return the user's token and details
        return jsonify({
            'token': user.get_auth_token(),
            'email': user.email,
            'role': user.roles[0].name,
            'username': user.username,
            'id': user.id
        })

    return jsonify({'message': 'Wrong password'}), 400


@app.route('/register/influencer', methods=['POST'])
def register_influencer():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    if not email or not password or not username:
        return jsonify({'message': 'Invalid input'}), 400

    user = datastore.find_user(email=email)

    if user:
        return jsonify({'message': 'User already exists'}), 400

    try:
        # Create user with 'influencer' role
        datastore.create_user(
            email=email,
            password=hash_password(password),
            username=username,
            roles=['influencer'],
            active=True
        )
        db.session.commit()
        return jsonify({'message': 'Influencer registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating influencer: {str(e)}'}), 500



@app.route('/register/sponsor', methods=['POST'])
def register_sponsor():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    if not email or not password or not username:
        return jsonify({'message': 'Invalid input'}), 400

    user = datastore.find_user(email=email)

    if user:
        return jsonify({'message': 'User already exists'}), 400

    try:
        # Create user with 'sponsor' role
        datastore.create_user(
            email=email,
            password=hash_password(password),
            username=username,
            roles=['sponsor'],
            active=False
        )
        db.session.commit()
        return jsonify({'message': 'Sponsor registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating sponsor: {str(e)}'}), 500



