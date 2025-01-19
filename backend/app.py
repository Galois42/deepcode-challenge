from flask import Flask, json, request, jsonify
from flask_cors import CORS
import pymysql
import socket
from urllib.parse import urlparse
import logging

app = Flask(__name__)
CORS(app)

# AWS RDS MySQL database connection
def get_db_connection():
    return pymysql.connect(
        host='deep-code-challenge.cj62emkiif26.us-east-2.rds.amazonaws.com',
        user='admin',
        password='hamidlmath',
        database='DEEPCODE'
    )

def execute_query(query, params=None, fetch=False):
    connection = get_db_connection()
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute(query, params or ())
            if fetch == 'one':
                return cursor.fetchone()
            elif fetch:
                return cursor.fetchall()
            connection.commit()
            return None
    finally:
        connection.close()

def enrich_data(url):
    """Enrichit les données avec des informations détaillées sur l'URL"""
    try:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        path = parsed_url.path

        # Extraction du port
        port = parsed_url.port
        if not port:
            port = 80 if parsed_url.scheme == 'http' else 443

        # Résolution DNS
        try:
            ip_address = socket.gethostbyname(domain)
            is_accessible = True
        except socket.gaierror:
            ip_address = None
            is_accessible = False

        # Tags par défaut
        tags = {
            'protocol': parsed_url.scheme,
            'tld': domain.split('.')[-1] if domain else None,
            'type': 'unknown'  # À enrichir selon le contenu
        }

        return {
            'uri': url,
            'domain': domain,
            'ip_address': ip_address,
            'port': port,
            'path': path,
            'tags': tags,
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

        # Apply basic filters
        if query:
            if field in ['uri', 'domain', 'username', 'ip_address', 'web_application']:
                sql_query += f" AND {field} LIKE %s"
                params.append(f"%{query}%")
            else:
                return jsonify({'error': 'Invalid search field'}), 400

        # Status filters
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

        # Handle tag filtering
        tag_filters = {k: v for k, v in request.args.items() if k.startswith('tag_')}
        if tag_filters:
            for key, value in tag_filters.items():
                tag_name = key[4:]  # Remove 'tag_' prefix
                # Use JSON_UNQUOTE to remove quotes from the extracted value
                sql_query += f" AND JSON_UNQUOTE(JSON_EXTRACT(tags, '$.{tag_name}')) = %s"
                params.append(value)

        # Count total results
        count_query = f"SELECT COUNT(*) as count FROM ({sql_query}) as count_query"
        total = execute_query(count_query, params, fetch='one')['count']

        # Apply pagination
        sql_query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
        offset = (page - 1) * per_page
        params.extend([per_page, offset])

        # Execute main query
        results = execute_query(sql_query, params, fetch=True)

        # Post-process results to ensure tags are properly formatted
        for result in results:
            if isinstance(result['tags'], str):
                try:
                    result['tags'] = json.dumps(json.loads(result['tags']))
                except json.JSONDecodeError:
                    # If JSON parsing fails, keep the original string
                    pass

        return jsonify({
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page,
            'results': results
        })

    except pymysql.Error as e:
        logging.error(f"Error searching data: {str(e)}")
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        logging.error(f"Unexpected error in search: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
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

    except pymysql.Error as e:
        logging.error(f"Error getting statistics: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Configuration du logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        filename='breach_analyzer.log'
    )

    app.run(debug=True)