import os
import json
import openai
from config import Config

client = openai.OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=Config.OPENROUTER_API_KEY
)

frontend_path = "../frontend/src/locales/"

with open(os.path.join(frontend_path, "en.json"), "r", encoding="utf-8") as f:
    en_data = json.load(f)

langs = {
    "ta": "Tamil",
    "hi": "Hindi",
    "ml": "Malayalam",
    "te": "Telugu"
}

for code, lang in langs.items():
    print(f"Translating to {lang}...")
    sys_prompt = f"You are a professional translator. Translate the following JSON object's values into {lang}. Return ONLY valid JSON, do not include markdown blocks like ```json."
    
    try:
        completion = client.chat.completions.create(
            model="openrouter/auto", 
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": json.dumps(en_data, ensure_ascii=False)}
            ],
            response_format={"type": "json_object"}
        )
        
        response_text = completion.choices[0].message.content.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
            
        translated_data = json.loads(response_text)
        
        with open(os.path.join(frontend_path, f"{code}.json"), "w", encoding="utf-8") as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)
            
        print(f"Saved {code}.json")
    except Exception as e:
        print(f"Failed for {lang}: {e}")

print("All done!")
