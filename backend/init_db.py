import mysql.connector
from mysql.connector import Error
import logging

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'breach_db'
}

def initialize_database():
    """Creates the database and required tables"""
    # First connect without database to create it if needed
    connection = mysql.connector.connect(
        host=DB_CONFIG['host'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password']
    )
    cursor = connection.cursor()

    try:
        # Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
        print(f"Database '{DB_CONFIG['database']}' created successfully!")

        # Switch to the database
        cursor.execute(f"USE {DB_CONFIG['database']}")

        # Create the breaches table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS breaches (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                uri VARCHAR(2048),
                username VARCHAR(255),
                password VARCHAR(255),
                domain VARCHAR(255),
                ip_address VARCHAR(45),
                port INT,
                path VARCHAR(2048),
                tags JSON,
                title VARCHAR(255),
                is_resolved BOOLEAN DEFAULT FALSE,
                is_accessible BOOLEAN,
                has_login_form BOOLEAN,
                login_form_type ENUM('basic', 'captcha', 'otp', 'other'),
                web_application VARCHAR(255),
                is_parked BOOLEAN,
                is_breached BOOLEAN,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("Database tables created successfully!")

        connection.commit()
        print("Database initialization completed successfully!")

    except Error as e:
        print(f"Error initializing database: {e}")
        raise
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        filename='db_init.log'
    )
    
    initialize_database()