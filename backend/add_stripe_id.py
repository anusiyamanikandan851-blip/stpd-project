import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'instance', 'herbs.db')

def upgrade():
    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("ALTER TABLE orders ADD COLUMN stripe_payment_id VARCHAR(255)")
        conn.commit()
        print("Successfully added stripe_payment_id column.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column already exists.")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    upgrade()
