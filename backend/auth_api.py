import os
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, jsonify, request
from flask_cors import CORS
import jwt

from utils.mongodb_db import get_mongodb

app = Flask(__name__)
CORS(app, resources={r"/auth/*": {"origins": "*"}}, supports_credentials=True)

db = get_mongodb()

JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", "24"))


def generate_token(user_dict: dict) -> str:
    user_id = user_dict.get("id") or str(user_dict.get("_id", ""))
    payload = {
        "sub": user_id,
        "email": user_dict.get("email", ""),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRES_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]
        if not token:
            return jsonify({"error": "Authorization token missing"}), 401
        try:
            payload = decode_token(token)
            user = db.get_user_by_id(payload["sub"])
            if not user:
                return jsonify({"error": "User not found"}), 404
            # Ensure user dict has id field
            if "_id" in user:
                user["id"] = str(user["_id"])
            request.user = user
            return fn(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

    return wrapper


def validate_signup_payload(data: dict):
    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or len(username) < 3:
        return False, "Username must be at least 3 characters."
    if not email or "@" not in email:
        return False, "A valid email is required."
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters."
    return True, {"username": username, "email": email, "password": password}


@app.post("/auth/signup")
def signup():
    try:
        payload = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    is_valid, result = validate_signup_payload(payload)
    if not is_valid:
        return jsonify({"error": result}), 400

    try:
        user = db.create_user(
            username=result["username"],
            email=result["email"],
            password=result["password"],
        )
        user_dict = db.serialize_user(user)
        token = generate_token(user_dict)
        return jsonify({"token": token, "user": user_dict}), 201
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Failed to create user: {str(exc)}"}), 500


@app.post("/auth/login")
def login():
    try:
        payload = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = db.authenticate_user(email, password)
    if not user:
        return jsonify({"error": "Invalid credentials."}), 401

    user_dict = db.serialize_user(user)
    token = generate_token(user_dict)
    return jsonify({"token": token, "user": user_dict}), 200


@app.get("/auth/me")
@auth_required
def me():
    user_dict = db.serialize_user(request.user)
    # Ensure id is a string
    if "id" not in user_dict and "_id" in request.user:
        user_dict["id"] = str(request.user["_id"])
    return jsonify({"user": user_dict}), 200


@app.post("/auth/logout")
@auth_required
def logout():
    # Stateless JWT logout; handled client-side.
    return jsonify({"success": True}), 200


@app.get("/auth/trades")
@auth_required
def get_trades():
    """Get trading history for the authenticated user"""
    try:
        user_id = request.user.get("id") or str(request.user.get("_id", ""))
        days = request.args.get("days", 30, type=int)
        crypto_symbol = request.args.get("crypto_symbol", None)
        
        # Get trading history from database filtered by user_id
        trades = db.get_trading_history(user_id=user_id, crypto_symbol=crypto_symbol, days=days)
        
        return jsonify({"trades": trades}), 200
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch trades: {str(exc)}"}), 500


@app.get("/auth/simulator-state")
@auth_required
def get_simulator_state():
    """Fetch stored simulator state for the authenticated user"""
    try:
        user_id = request.user.get("id") or str(request.user.get("_id", ""))
        state = db.get_simulator_state(user_id)
        return jsonify({
            "state": (state or {}).get("state"),
            "updated_at": (state or {}).get("updated_at")
        }), 200
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch simulator state: {str(exc)}"}), 500


@app.post("/auth/simulator-state")
@auth_required
def save_simulator_state():
    """Persist simulator state for the authenticated user"""
    try:
        payload = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400

    state = payload.get("state")
    if state is None:
        return jsonify({"error": "Simulator state is required"}), 400

    try:
        user_id = request.user.get("id") or str(request.user.get("_id", ""))
        success = db.save_simulator_state(user_id, state)
        if success:
            return jsonify({"success": True}), 200
        return jsonify({"error": "Unable to save simulator state"}), 500
    except Exception as exc:
        return jsonify({"error": f"Failed to save simulator state: {str(exc)}"}), 500


@app.delete("/auth/simulator-state")
@auth_required
def delete_simulator_state():
    """Delete simulator state for the authenticated user"""
    try:
        user_id = request.user.get("id") or str(request.user.get("_id", ""))
        success = db.delete_simulator_state(user_id)
        if success:
            return jsonify({"success": True}), 200
        return jsonify({"error": "Unable to delete simulator state"}), 500
    except Exception as exc:
        return jsonify({"error": f"Failed to delete simulator state: {str(exc)}"}), 500


@app.get("/auth/dashboard")
@auth_required
def dashboard():
    """Return dashboard summary for the authenticated user"""
    try:
        user_id = request.user.get("id") or str(request.user.get("_id", ""))
        summary = db.get_dashboard_summary(user_id)
        user_dict = db.serialize_user(request.user)
        if "id" not in user_dict and "_id" in request.user:
            user_dict["id"] = str(request.user["_id"])
        return jsonify({
            "user": user_dict,
            "summary": summary
        }), 200
    except Exception as exc:
        return jsonify({"error": f"Failed to fetch dashboard data: {str(exc)}"}), 500


if __name__ == "__main__":
    port = int(os.getenv("AUTH_API_PORT", "5002"))
    app.run(port=port, debug=True)

