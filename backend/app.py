import os
from flask import Flask, jsonify
from config import Config
from models import db
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Restrict CORS to the origins listed in the env var (Vercel URL + localhost in dev).
    CORS(
        app,
        resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    JWTManager(app)
    db.init_app(app)

    from routes.auth import auth_bp
    from routes.herbs import herbs_bp
    from routes.orders import orders_bp
    from routes.payments import payments_bp
    from routes.chatbot import chatbot_bp
    from routes.feedback import feedback_bp
    from routes.admin import admin_bp
    from routes.wishlist import wishlist_bp
    from routes.reviews import reviews_bp
    from routes.notifications import notifications_bp
    from routes.admin_analytics import admin_analytics_bp
    from routes.admin_chatbot import admin_chatbot_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(herbs_bp, url_prefix='/herbs')
    app.register_blueprint(orders_bp, url_prefix='/orders')
    app.register_blueprint(payments_bp, url_prefix='/payments')
    app.register_blueprint(chatbot_bp, url_prefix='/chatbot')
    app.register_blueprint(feedback_bp, url_prefix='/feedback')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(wishlist_bp, url_prefix='/wishlist')
    app.register_blueprint(reviews_bp, url_prefix='/reviews')
    app.register_blueprint(notifications_bp, url_prefix='/notifications')
    app.register_blueprint(admin_analytics_bp, url_prefix='/api/admin/analytics')
    app.register_blueprint(admin_chatbot_bp, url_prefix='/api/admin-chatbot')

    # Health-check endpoints. Render hits "/" by default for free-tier wake-up
    # and lets you set a separate health-check path.
    @app.route('/')
    def index():
        return jsonify(status='ok', service='antigravity-herb-api')

    @app.route('/health')
    def health():
        return jsonify(status='healthy'), 200

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == '__main__':
    # Local dev only. In production, gunicorn imports `app` from this module.
    port = int(os.getenv('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
