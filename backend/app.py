from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from mysql.connector.pooling import MySQLConnectionPool
import socket
from urllib.parse import urlparse
import logging
import json
from datetime import datetime
from typing import Dict, Any, Optional
from contextlib import contextmanager

app = Flask(__name__)
CORS(app)

# Database configuration for XAMPP
DB_CONFIG = {
    'host': '127.0.0.1',  # XAMPP default host
    'user': 'root',       # XAMPP default username
    'password': '',       # XAMPP default empty password
    'database': 'breach_db',
    'port': 3306,        # XAMPP default MySQL port
    'pool_name': 'breach_pool',
    'pool_size': 5,
    'pool_reset_session': True,
    'raise_on_warnings': True
}

# Initialize connection pool
connection_pool = None

def init_connection_pool():
    """Initialize the MySQL connection pool"""
    global connection_pool
    try:
        # First, try to create the database if it doesn't exist
        temp_config = DB_CONFIG.copy()
        del temp_config['database']  # Remove database from config temporarily
        del temp_config['pool_name']
        del temp_config['pool_size']
        del temp_config['pool_reset_session']
        
        conn = mysql.connector.connect(**temp_config)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']}")
        cursor.close()
        conn.close()

        # Now initialize the connection pool
        connection_pool = MySQLConnectionPool(**DB_CONFIG)
        logging.info("Database connection pool initialized successfully")
    except Error as e:
        logging.error(f"Error initializing connection pool: {e}")
        raise

@contextmanager
def get_db_connection():
    """Context manager for database connections from the pool"""
    conn = None
    try:
        conn = connection_pool.get_connection()
        yield conn
    except Error as e:
        logging.error(f"Error getting connection from pool: {e}")
        raise
    finally:
        if conn:
            conn.close()

def execute_query(query, params=None, fetch=False, many=False):
    """Execute a database query with proper connection handling"""
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            try:
                if many:
                    cursor.executemany(query, params)
                else:
                    cursor.execute(query, params or ())
                
                if fetch:
                    columns = [desc[0] for desc in cursor.description]
                    if fetch == 'one':
                        result = cursor.fetchone()
                        return row_to_dict(result, columns) if result else None
                    else:
                        return [row_to_dict(row, columns) for row in cursor.fetchall()]
                
                connection.commit()
                return cursor.rowcount
            except Error as e:
                connection.rollback()
                logging.error(f"Error executing query: {e}")
                raise

def create_tables():
    """Creates the necessary database tables if they don't exist"""
    query = """
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
    """
    execute_query(query)

def row_to_dict(row, columns) -> Dict[str, Any]:
    """Converts a database row to a dictionary"""
    if not row:
        return None
    result = {}
    for i, column in enumerate(columns):
        value = row[i]
        if isinstance(value, datetime):
            value = value.isoformat()
        elif isinstance(value, bytes):
            value = json.loads(value.decode())
        result[column] = value
    return result

def enrich_data(url):
    """Enriches data with detailed URL information"""
    try:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        path = parsed_url.path

        port = parsed_url.port
        if not port:
            port = 80 if parsed_url.scheme == 'http' else 443

        try:
            ip_address = socket.gethostbyname(domain)
            is_accessible = True
        except socket.gaierror:
            ip_address = None
            is_accessible = False

        tags = {
            'protocol': parsed_url.scheme,
            'tld': domain.split('.')[-1] if domain else None,
            'type': 'unknown'
        }

        return {
            'uri': url,
            'domain': domain,
            'ip_address': ip_address,
            'port': port,
            'path': path,
            'tags': json.dumps(tags),
            'is_accessible': is_accessible,
            'is_breached': True,
            'has_login_form': None,
            'login_form_type': None,
            'web_application': None,
            'is_parked': None,
            'title': None
        }
    except Exception as e:
        logging.error(f"Error enriching data for URL {url}: {str(e)}")
        return None

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Endpoint to process the data file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    processed_count = 0
    batch_size = 1000
    current_batch = []

    try:
        insert_query = """
            INSERT INTO breaches (
                uri, username, password, domain, ip_address, port, path, 
                tags, is_accessible, is_breached, has_login_form, 
                login_form_type, web_application, is_parked, title
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """

        for line in file:
            try:
                line = line.decode('utf-8').strip()
                url, username, password = line.split()

                enriched_data = enrich_data(url)
                if enriched_data:
                    values = (
                        enriched_data['uri'], username, password,
                        enriched_data['domain'], enriched_data['ip_address'],
                        enriched_data['port'], enriched_data['path'],
                        enriched_data['tags'], enriched_data['is_accessible'],
                        enriched_data['is_breached'], enriched_data['has_login_form'],
                        enriched_data['login_form_type'], enriched_data['web_application'],
                        enriched_data['is_parked'], enriched_data['title']
                    )
                    current_batch.append(values)

                if len(current_batch) >= batch_size:
                    execute_query(insert_query, current_batch, many=True)
                    processed_count += len(current_batch)
                    current_batch = []

            except ValueError:
                logging.warning(f"Skipping malformed line: {line}")
                continue

        # Process remaining batch
        if current_batch:
            execute_query(insert_query, current_batch, many=True)
            processed_count += len(current_batch)

        return jsonify({
            'message': 'File processed successfully',
            'records_processed': processed_count
        })

    except Error as e:
        logging.error(f"Error processing file: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/search', methods=['GET'])
def search():
    """Endpoint to search data with multiple filters"""
    query = request.args.get('q', '')
    field = request.args.get('field', 'domain')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    is_resolved = request.args.get('is_resolved', type=bool)
    has_login_form = request.args.get('has_login_form', type=bool)
    login_form_type = request.args.get('login_form_type')
    is_accessible = request.args.get('is_accessible', type=bool)

    try:
        # Base query
        sql_query = "SELECT * FROM breaches WHERE 1=1"
        params = []

        # Apply filters
        if query:
            if field in ['uri', 'domain', 'username', 'ip_address', 'web_application']:
                sql_query += f" AND {field} LIKE %s"
                params.append(f"%{query}%")
            else:
                return jsonify({'error': 'Invalid search field'}), 400

        if is_resolved is not None:
            sql_query += " AND is_resolved = %s"
            params.append(is_resolved)

        if has_login_form is not None:
            sql_query += " AND has_login_form = %s"
            params.append(has_login_form)

        if login_form_type:
            sql_query += " AND login_form_type = %s"
            params.append(login_form_type)

        if is_accessible is not None:
            sql_query += " AND is_accessible = %s"
            params.append(is_accessible)

        # Count total results
        count_query = f"SELECT COUNT(*) as count FROM ({sql_query}) as count_query"
        total = execute_query(count_query, params, fetch='one')['count']

        # Apply pagination
        sql_query += " LIMIT %s OFFSET %s"
        offset = (page - 1) * per_page
        params.extend([per_page, offset])

        # Execute main query
        results = execute_query(sql_query, params, fetch=True)

        return jsonify({
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page,
            'results': results
        })

    except Error as e:
        logging.error(f"Error searching data: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Endpoint to get data statistics"""
    try:
        # Get various counts using our execute_query helper
        total_records = execute_query("SELECT COUNT(*) as count FROM breaches", fetch='one')['count']
        accessible_domains = execute_query(
            "SELECT COUNT(*) as count FROM breaches WHERE is_accessible = TRUE", 
            fetch='one'
        )['count']
        unique_domains = execute_query(
            "SELECT COUNT(DISTINCT domain) as count FROM breaches", 
            fetch='one'
        )['count']
        login_forms = execute_query(
            "SELECT COUNT(*) as count FROM breaches WHERE has_login_form = TRUE", 
            fetch='one'
        )['count']
        resolved_cases = execute_query(
            "SELECT COUNT(*) as count FROM breaches WHERE is_resolved = TRUE", 
            fetch='one'
        )['count']

        # Get login form types distribution
        login_form_types = execute_query("""
            SELECT login_form_type, COUNT(*) as count
            FROM breaches
            WHERE login_form_type IS NOT NULL
            GROUP BY login_form_type
        """, fetch=True)

        # Convert to dictionary format
        login_form_types_dict = {
            item['login_form_type']: item['count'] 
            for item in login_form_types
        }

        return jsonify({
            'total_records': total_records,
            'accessible_domains': accessible_domains,
            'unique_domains': unique_domains,
            'login_forms': login_forms,
            'resolved_cases': resolved_cases,
            'login_form_types': login_form_types_dict
        })

    except Error as e:
        logging.error(f"Error getting statistics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/resolve/<int:breach_id>', methods=['PUT'])
def resolve_breach(breach_id):
    """Endpoint to mark a breach as resolved"""
    try:
        # Update the breach
        rows_affected = execute_query(
            "UPDATE breaches SET is_resolved = TRUE WHERE id = %s",
            (breach_id,)
        )
        
        if rows_affected == 0:
            return jsonify({'error': 'Breach not found'}), 404

        # Get updated breach data
        breach = execute_query(
            "SELECT * FROM breaches WHERE id = %s",
            (breach_id,),
            fetch='one'
        )

        return jsonify({'message': 'Breach marked as resolved', 'breach': breach})

    except Error as e:
        logging.error(f"Error resolving breach {breach_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tag/<int:breach_id>', methods=['PUT'])
def update_tags(breach_id):
    """Endpoint to update breach tags"""
    try:
        new_tags = request.json.get('tags', {})
        if not isinstance(new_tags, dict):
            return jsonify({'error': 'Tags must be provided as a JSON object'}), 400

        # Get current tags
        current = execute_query(
            "SELECT tags FROM breaches WHERE id = %s",
            (breach_id,),
            fetch='one'
        )
        
        if not current:
            return jsonify({'error': 'Breach not found'}), 404

        # Merge tags
        current_tags = current['tags'] or {}
        current_tags.update(new_tags)
        
        # Update tags
        execute_query(
            "UPDATE breaches SET tags = %s WHERE id = %s",
            (json.dumps(current_tags), breach_id)
        )

        # Get updated breach data
        breach = execute_query(
            "SELECT * FROM breaches WHERE id = %s",
            (breach_id,),
            fetch='one'
        )

        return jsonify({'message': 'Tags updated successfully', 'breach': breach})

    except Error as e:
        logging.error(f"Error updating tags for breach {breach_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        filename='breach_analyzer.log'
    )

    try:
        # Initialize connection pool and create tables
        init_connection_pool()
        create_tables()
        logging.info("Application started successfully")
        print("Server is running. Database and tables are initialized.")
        
        # Run the Flask application
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        logging.error(f"Failed to start application: {e}")
        print(f"Error: {e}")
        raise