# HerbNest - Traditional Herbs E-commerce Web App

A full-stack e-commerce platform for discovering and purchasing traditional herbal remedies with an integrated AI Chatbot for symptom recommendations.

## Tech Stack
* **Frontend:** React.js, Vite, Tailwind CSS, React Router, Stripe Elements
* **Backend:** Python Flask, SQLAlchemy, JWT Authentication, Stripe API, OpenAI API
* **Database:** SQLite (Default for local development, prepared for PostgreSQL)

## Features
1. **Authentication:** JWT-based user registration and login.
2. **Herb Catalog:** Browse herbs, view details, and add to cart.
3. **Cart & Checkout:** Manage cart items and checkout securely using Stripe.
4. **AI Assistant:** A floating chatbot that matches symptoms to herbs locally, or falls back to OpenAI for advanced suggestions.
5. **Orders & Feedback:** View past orders and leave community feedback.

## Setup Instructions

### Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up Environment Variables (Optional but recommended):
   Create a `.env` file in the `backend/` directory with the following:
   ```env
   JWT_SECRET_KEY=your_secure_jwt_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   OPENROUTER_API_KEY=sk-or-v1-your_openrouter_key
   # DATABASE_URL=postgresql://user:password@localhost/herbnest (To use PostgreSQL instead of SQLite)
   ```
5. Run the Database Seeder:
   ```bash
   python seed.py
   ```
6. Start the Flask Server:
   ```bash
   python app.py
   ```
   *(Server runs on http://localhost:5000)*

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Environment Variables (Optional):
   Create a `.env` file in the `frontend/` directory with your Stripe Public Key:
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
   ```
4. Start the Development Server:
   ```bash
   npm run dev
   ```
   *(App runs on http://localhost:5173)*

## Usage Flow
1. Open the frontend URL in your browser.
2. Sign up for a new account.
3. Browse the herb collection and click "Add to Cart".
4. Navigate to the Cart and Proceed to Checkout.
5. Use the Chatbot in the bottom right corner to find herbs by symptoms (e.g. "I have a cold").
