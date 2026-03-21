from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

DB_FILE = "database.json"

# Default schema
DEFAULT_DB = {
    "gallery": [
        "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1591862719729-6e15bd642900?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1563298258-c2c4df7b9070?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1516996087939-9b5b8f128c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1592609931095-54a2168ae893?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    ],
    "equipment": [],
    "bookings": [],
    "contact": {
        "address": "123 Film Street, Mumbai, India",
        "phone": "+91 98765 43210",
        "email": "info@vimalaenterprises.com",
        "hours": "Mon-Sat: 9AM-7PM"
    },
    "users": []
}

def load_db():
    if not os.path.exists(DB_FILE):
        save_db(DEFAULT_DB)
        return DEFAULT_DB
    with open(DB_FILE, 'r') as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

def format_response(success, data=None, message=None, err=None, count=None):
    res = {
        "success": success,
        "timestamp": datetime.now().isoformat()
    }
    if data is not None: res["data"] = data
    if message is not None: res["message"] = message
    if err is not None: res["error"] = err
    if count is not None: res["count"] = count
    return jsonify(res)

# ====================
# GALLERY ROUTES
# ====================
@app.route('/api/gallery', methods=['GET'])
def get_gallery():
    db = load_db()
    return format_response(True, data=db['gallery'], count=len(db['gallery']))

@app.route('/api/gallery', methods=['PUT'])
def update_gallery():
    db = load_db()
    images = request.json
    db['gallery'] = images
    save_db(db)
    return format_response(True, data=images, message="Gallery updated successfully")

# ====================
# EQUIPMENT ROUTES
# ====================
@app.route('/api/equipment', methods=['GET'])
def get_equipment():
    db = load_db()
    return format_response(True, data=db['equipment'], count=len(db['equipment']))

@app.route('/api/equipment', methods=['POST'])
def add_equipment():
    db = load_db()
    data = request.json
    new_id = max([e.get('id', 0) for e in db['equipment']] + [0]) + 1
    data['id'] = new_id
    data['createdAt'] = datetime.now().isoformat()
    data['updatedAt'] = datetime.now().isoformat()
    
    db['equipment'].append(data)
    save_db(db)
    return format_response(True, data=data, message="Equipment added successfully")

@app.route('/api/equipment/<int:eq_id>', methods=['DELETE'])
def delete_equipment(eq_id):
    db = load_db()
    original_len = len(db['equipment'])
    db['equipment'] = [e for e in db['equipment'] if e.get('id') != eq_id]
    
    if len(db['equipment']) == original_len:
        return format_response(False, err="Equipment not found")
        
    save_db(db)
    return format_response(True, message="Equipment deleted successfully")

# ====================
# BOOKINGS ROUTES
# ====================
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    db = load_db()
    return format_response(True, data=db['bookings'], count=len(db['bookings']))

@app.route('/api/bookings/user/<email>', methods=['GET'])
def get_user_bookings(email):
    db = load_db()
    user_bks = [b for b in db['bookings'] if b.get('customer', {}).get('email') == email]
    return format_response(True, data=user_bks, count=len(user_bks))

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    db = load_db()
    data = request.json
    booking_id = 'BK' + str(uuid.uuid4().int)[:8]
    data['bookingId'] = booking_id
    data['status'] = 'pending'
    data['createdAt'] = datetime.now().isoformat()

    # Update equipment stock
    for item in data.get('equipmentItems', []):
        for eq in db['equipment']:
            if eq.get('id') == item.get('id'):
                eq['stock'] -= item.get('quantity', 0)
                eq['updatedAt'] = datetime.now().isoformat()
                
    db['bookings'].append(data)
    save_db(db)
    return format_response(True, data=data, message="Booking created successfully")

@app.route('/api/bookings/<booking_id>/status', methods=['PUT'])
def update_booking_status(booking_id):
    db = load_db()
    new_status = request.json.get('status')
    
    for b in db['bookings']:
        if b.get('bookingId') == booking_id:
            b['status'] = new_status
            b['updatedAt'] = datetime.now().isoformat()
            save_db(db)
            return format_response(True, data=b, message="Booking status updated successfully")
            
    return format_response(False, err="Booking not found")

# ====================
# CONTACT ROUTES
# ====================
@app.route('/api/contact', methods=['GET'])
def get_contact():
    db = load_db()
    return format_response(True, data=db['contact'])

@app.route('/api/contact', methods=['PUT'])
def update_contact():
    db = load_db()
    data = request.json
    db['contact'] = data
    save_db(db)
    return format_response(True, data=data, message="Contact information updated successfully")

# ====================
# AUTH ROUTES
# ====================
@app.route('/api/auth/login', methods=['POST'])
def login():
    db = load_db()
    creds = request.json
    email = creds.get('email')
    password = creds.get('password')
    
    if not email or not password:
        return format_response(False, err="Please enter email and password")
        
    user = next((u for u in db['users'] if u.get('email') == email and u.get('password') == password), None)
    
    if not user:
        # Create user if doesn't exist (from original mock logic)
        user = {
            "id": len(db['users']) + 1,
            "email": email,
            "password": password,
            "name": email.split('@')[0],
            "phone": "",
            "company": "",
            "createdAt": datetime.now().isoformat()
        }
        db['users'].append(user)
        save_db(db)
        
    # Exclude password from response
    user_copy = dict(user)
    if 'password' in user_copy:
        del user_copy['password']
        
    token = 'jwt-token-user-' + str(uuid.uuid4())
    return format_response(True, data={"token": token, "user": user_copy}, message="Login successful")

@app.route('/api/auth/admin-login', methods=['POST'])
def admin_login():
    creds = request.json
    if creds.get('username') == 'vimala' and creds.get('password') == 'vimala':
        token = 'jwt-token-admin-' + str(uuid.uuid4())
        return format_response(True, data={
            "token": token,
            "user": {"username": "vimala", "role": "admin", "name": "Vimala Admin"}
        }, message="Admin login successful")
        
    return format_response(False, err="Invalid credentials")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
