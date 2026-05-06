from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.herb import Herb
from models.order import Order
from models import db
from sqlalchemy import func
import openai
from config import Config
from datetime import datetime, date

client = openai.OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=Config.OPENROUTER_API_KEY,
    default_headers={
        "HTTP-Referer": "http://localhost:5173", 
        "X-Title": "HerbNest Admin"
    }
)

admin_chatbot_bp = Blueprint('admin_chatbot', __name__)

@admin_chatbot_bp.route('/', methods=['POST'])
@jwt_required()
def admin_chat():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({"msg": "Admin access required"}), 403

    data = request.get_json()
    message = data.get('message', '').strip()
    history = data.get('history', [])  
    
    if not message:
        return jsonify({"msg": "Message is required"}), 400
        
    # Gather live admin stats
    total_users = User.query.filter_by(role='user').count()
    total_orders = Order.query.count()
    total_revenue = db.session.query(func.sum(Order.total_price)).scalar() or 0.0
    
    today_orders = Order.query.filter(func.date(Order.created_at) == date.today()).count()
    today_revenue = db.session.query(func.sum(Order.total_price)).filter(func.date(Order.created_at) == date.today()).scalar() or 0.0

    low_stock_herbs = Herb.query.filter(Herb.stock < 15).all()
    low_stock_details = ", ".join([f"{h.name} (only {h.stock} left)" for h in low_stock_herbs]) if low_stock_herbs else "None"
    
    all_herbs = Herb.query.all()
    inventory_context = ", ".join([f"{h.name}: {h.stock} units" for h in all_herbs])

    system_prompt = f"""You are the HerbNest Admin Assistant API. 
Answer questions related to stock levels, product performance, orders, and sales analytics.
Use the following live database metrics accurately:
- Total Sales Revenue Lifetime: ₹{total_revenue}
- Today's Revenue: ₹{today_revenue}
- Total Orders Lifetime: {total_orders}
- Total Orders Today: {today_orders}
- Total Registered Users: {total_users}
- Low Stock Products (Warning): {low_stock_details}
- Complete Inventory Status: {inventory_context}

Important instructions:
1. ONLY provide info related to the platform administration, orders, stock, and users.
2. If predicting trends or giving generic advice, keep it brief and professional.
3. Your responses should be formatted nicely using markdown (bullet points, bold text).
"""

    if not Config.OPENROUTER_API_KEY:
         return jsonify({"response": "I'm sorry, OpenRouter API is not configured. Live stats:\n- Revenue: ₹" + str(total_revenue) + "\n- Users: " + str(total_users) + "\n- Low Stock: " + low_stock_details}), 200
         
    try:
        valid_history = [m for m in history if m.get('role') in ('user', 'assistant')][-8:]
        if valid_history and valid_history[-1]['role'] == 'user':
            valid_history = valid_history[:-1]
        
        messages_payload = [{"role": "system", "content": system_prompt}]
        messages_payload.extend(valid_history)
        messages_payload.append({"role": "user", "content": message})
        
        completion = client.chat.completions.create(
            model="openrouter/auto", 
            messages=messages_payload
        )
        ai_response = completion.choices[0].message.content
        
        return jsonify({
            "response": ai_response.strip()
        }), 200
        
    except Exception as e:
        return jsonify({"response": "Sorry, failed to process.", "error": str(e)}), 500
