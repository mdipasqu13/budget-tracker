from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt  # Import Bcrypt for password hashing

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///budget.db'  # SQLite database file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable modification tracking
db = SQLAlchemy(app)  # Initialize SQLAlchemy
bcrypt = Bcrypt(app)  # Initialize Bcrypt for password hashing

# Enable CORS for all routes
CORS(app)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)  # Store hashed passwords
    budget = db.Column(db.Float, default=0.0)

# Expenditure model
class Expenditure(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(10), nullable=False)
    note = db.Column(db.String(200))

# Add headers to handle CORS preflight requests
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")  # Allow all origins for now
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

# Route: Register a new user with hashed password
@app.route('/register', methods=['POST'])
def register():
    data = request.json  # Get JSON data from frontend
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password are required'}), 400

    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400

    # Hash the password before saving it to the database
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Route: Login a user with password verification
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Login successful', 'user_id': user.id}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

# Route: Set a user's budget
@app.route('/set_budget', methods=['POST'])
def set_budget():
    data = request.json
    user = User.query.get(data['user_id'])

    if user:
        user.budget = data['budget']
        db.session.commit()
        return jsonify({'message': 'Budget updated successfully'}), 200

    return jsonify({'message': 'User not found'}), 404

# Route: Add an expenditure for a user
@app.route('/add_expenditure', methods=['POST'])
def add_expenditure():
    data = request.json
    user = User.query.get(data['user_id'])

    if user:
        new_expenditure = Expenditure(
            user_id=user.id,
            amount=data['amount'],
            date=data['date'],
            note=data.get('note', '')
        )
        user.budget -= data['amount']  # Subtract expenditure from user's budget
        db.session.add(new_expenditure)
        db.session.commit()
        return jsonify({'message': 'Expenditure added successfully'}), 201

    return jsonify({'message': 'User not found'}), 404

# Route: Get all expenditures for a user
@app.route('/get_expenditures/<int:user_id>', methods=['GET'])
def get_expenditures(user_id):
    expenditures = Expenditure.query.filter_by(user_id=user_id).all()
    
    result = [
        {'id': exp.id, 'amount': exp.amount, 'date': exp.date, 'note': exp.note}
        for exp in expenditures
    ]
    
    return jsonify(result), 200

# Route: Get user details (including budget)
@app.route('/get_user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify({'id': user.id, 'username': user.username, 'budget': user.budget}), 200

    return jsonify({'message': 'User not found'}), 404

# Main entry point of the app
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create tables in the database if they don't exist yet
    # app.run(debug=True, port=5001)  # Run the Flask development server on port 5001
    app.run(port=5001)