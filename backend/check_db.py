import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'instance', 'herbs.db')
try:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT count(*) FROM orders")
    print(f"Total orders in DB: {c.fetchone()[0]}")
    
    c.execute("SELECT * FROM orders")
    print("Orders:", c.fetchall())
except Exception as e:
    print("Error:", e)
finally:
    if 'conn' in locals():
        conn.close()
