from models import db, User, Order, OrderItem, Herb
from sqlalchemy import func, cast, Date

class AnalyticsService:
    @staticmethod
    def get_summary():
        total_users = db.session.query(func.count(User.id)).filter(User.role == 'user').scalar() or 0
        total_orders = db.session.query(func.count(Order.id)).scalar() or 0
        total_revenue = db.session.query(func.sum(Order.total_price)).scalar() or 0.0
        
        return {
            "total_users": total_users,
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2)
        }

    @staticmethod
    def get_top_products():
        top_items = db.session.query(
            Herb.name,
            func.sum(OrderItem.quantity).label('total_sold')
        ).join(OrderItem, Herb.id == OrderItem.herb_id)\
         .group_by(Herb.name)\
         .order_by(func.sum(OrderItem.quantity).desc())\
         .limit(5).all()
        
        return [
            {
                "product_name": item.name,
                "total_sold": int(item.total_sold)
            } for item in top_items
        ]

    @staticmethod
    def get_revenue_trend():
        try:
            trend_query = db.session.query(
                cast(Order.created_at, Date).label('date'),
                func.sum(Order.total_price).label('revenue')
            ).group_by(cast(Order.created_at, Date))\
             .order_by(cast(Order.created_at, Date).asc())\
             .all()
             
            return [
                {
                    "date": str(item.date),
                    "revenue": round(item.revenue, 2)
                } for item in trend_query if item.date
            ]
        except Exception as e:
            # Fallback if DB dialect grouping fails
            orders = db.session.query(Order).all()
            revenue_by_date = {}
            for o in orders:
                if not o.created_at: continue
                d_str = o.created_at.strftime('%Y-%m-%d')
                revenue_by_date[d_str] = revenue_by_date.get(d_str, 0) + o.total_price
            
            sorted_dates = sorted(revenue_by_date.keys())
            return [{"date": d, "revenue": round(revenue_by_date[d], 2)} for d in sorted_dates]
