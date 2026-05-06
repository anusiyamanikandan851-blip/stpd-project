import requests
import json

base_url = "http://localhost:5000"

# 1. Login to get token
resp = requests.post(f"{base_url}/auth/login", json={"email": "madhu@test.com", "password": "password"})
if resp.status_code != 200:
    print(f"Login failed: {resp.text}")
    # try to register
    resp = requests.post(f"{base_url}/auth/register", json={"name": "Madhu", "email": "madhu@test.com", "password": "password"})
    resp = requests.post(f"{base_url}/auth/login", json={"email": "madhu@test.com", "password": "password"})

token = resp.json().get('access_token')
print(f"Token: {token[:10]}...")

# 2. Get herbs to get a valid herb_id
resp = requests.get(f"{base_url}/herbs/")
herbs = resp.json()
herb_id = herbs[0]['id'] if herbs else 1

# 3. Create order
headers = {"Authorization": f"Bearer {token}"}
payload = {"items": [{"herb_id": herb_id, "quantity": 1}]}
print(f"Payload: {payload}")
resp = requests.post(f"{base_url}/orders/", json=payload, headers=headers)
print(f"Response status: {resp.status_code}")
print(f"Response body: {resp.text}")

