from flask import Blueprint, request, jsonify
from models.symptom_map import SymptomHerbMap
from models.herb import Herb
import openai
from config import Config

client = openai.OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=Config.OPENROUTER_API_KEY,
    default_headers={
        "HTTP-Referer": "http://localhost:5173", # Optional, for including your app on openrouter.ai rankings
        "X-Title": "HerbNest App" # Optional
    }
)

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '').strip()
    history = data.get('history', [])  
    language_code = data.get('language', 'en')
    
    if not message:
        return jsonify({"msg": "Message is required"}), 400
        
    # Phase 1: Local Symptom Short-Circuit
    msg_lower = message.lower()
    
    # Try finding exact matches in SymptomHerbMap to bypass OpenAI
    symptom_matches = SymptomHerbMap.query.all()
    matched_herbs = set()
    found_symptom = ""
    for sm in symptom_matches:
        if sm.symptom.lower() in msg_lower:
            matched_herbs.add(sm.herb)
            found_symptom = sm.symptom.lower()
            
    if matched_herbs:
        herbs_data = []
        response_text = f"I can certainly help with your {found_symptom}! Here are some highly recommended traditional remedies from our inventory:"
        for h in matched_herbs:
            herbs_data.append({
                "id": h.id, "name": h.name, "description": h.description, 
                "image_url": h.image_url, "price": h.price
            })
        return jsonify({"response": response_text, "suggested_herbs": list(herbs_data)}), 200

    # Phase 2: OpenRouter Fallback
    if not Config.OPENROUTER_API_KEY:
         return jsonify({"response": "I couldn't find a direct match locally, and my AI features are currently offline.", "suggested_herbs": []}), 200
         
    try:
        # Optimization: Do NOT load all 40 herbs. Send maximum 10 random herbs to prevent overwhelming context
        import random
        all_herbs = Herb.query.all()
        sample_herbs = random.sample(all_herbs, min(len(all_herbs), 10))
        
        inventory_context = "Our current inventory (partial list):\n"
        for h in sample_herbs:
            inventory_context += f"- {h.name} (${h.price:.2f}): {h.uses}\n"
            
        system_prompt = f"""You are the HerbNest AI Assistant, a friendly chatbot helping customers.
Answer naturally. If asked for recommendations, strictly suggest items from this inventory list:
{inventory_context}

CRITICAL INSTRUCTIONS:
1. Short disclaimer that you are not a medical doctor.
2. Respond strictly in the language code: {language_code}. Do not respond in English unless requested.
"""
        valid_history = [m for m in history if m.get('role') in ('user', 'assistant')][-6:]
        if valid_history and valid_history[-1]['role'] == 'user':
            valid_history = valid_history[:-1]
        
        messages_payload = [{"role": "system", "content": system_prompt}]
        messages_payload.extend(valid_history)
        messages_payload.append({"role": "user", "content": message})
        
        completion = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct:free",
            messages=messages_payload,
            timeout=15.0  # 15 second timeout
        )
        ai_response = completion.choices[0].message.content
        
        suggested_herbs_data = []
        for h in all_herbs:
            search_key = h.name.split(' ')[0].lower()
            if search_key in ai_response.lower():
                suggested_herbs_data.append({
                    "id": h.id, "name": h.name, "description": h.description, 
                    "image_url": h.image_url, "price": h.price
                })
                
        return jsonify({
            "response": ai_response.strip(),
            "suggested_herbs": suggested_herbs_data
        }), 200
        
    except openai.APITimeoutError:
        return jsonify({"response": "My circuits are a bit slow today! I couldn't reach the AI brain, but please search our catalog for standard remedies.", "suggested_herbs": []}), 200
    except Exception as e:
        return jsonify({"response": "Sorry, I'm having trouble processing that right now.", "error": str(e), "suggested_herbs": []}), 500
