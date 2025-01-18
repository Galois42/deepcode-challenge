from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import socket
import re
from urllib.parse import urlparse
import concurrent.futures
import logging
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration de la base de données
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/breach_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# Modèle de données
class BreachData(db.Model):
    __tablename__ = 'breaches'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    uri = db.Column(db.String(2048))
    username = db.Column(db.String(255))
    password = db.Column(db.String(255))
    domain = db.Column(db.String(255))
    ip_address = db.Column(db.String(45))
    port = db.Column(db.Integer)
    path = db.Column(db.String(2048))
    tags = db.Column(db.JSON)
    title = db.Column(db.String(255))
    is_resolved = db.Column(db.Boolean, default=False)
    is_accessible = db.Column(db.Boolean)
    has_login_form = db.Column(db.Boolean)
    login_form_type = db.Column(db.Enum('basic', 'captcha', 'otp', 'other'))
    web_application = db.Column(db.String(255))
    is_parked = db.Column(db.Boolean)
    is_breached = db.Column(db.Boolean)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'uri': self.uri,
            'username': self.username,
            'password': self.password,
            'domain': self.domain,
            'ip_address': self.ip_address,
            'port': self.port,
            'path': self.path,
            'tags': self.tags,
            'title': self.title,
            'is_resolved': self.is_resolved,
            'is_accessible': self.is_accessible,
            'has_login_form': self.has_login_form,
            'login_form_type': self.login_form_type,
            'web_application': self.web_application,
            'is_parked': self.is_parked,
            'is_breached': self.is_breached,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


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


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Endpoint pour traiter le fichier de données"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    processed_count = 0
    batch_size = 1000
    current_batch = []

    try:
        for line in file:
            try:
                line = line.decode('utf-8').strip()
                url, username, password = line.split()

                # Enrichissement des données
                enriched_data = enrich_data(url)
                if enriched_data:
                    breach_data = BreachData(
                        uri=enriched_data['uri'],
                        username=username,
                        password=password,
                        domain=enriched_data['domain'],
                        ip_address=enriched_data['ip_address'],
                        port=enriched_data['port'],
                        path=enriched_data['path'],
                        tags=enriched_data['tags'],
                        is_accessible=enriched_data['is_accessible'],
                        is_breached=enriched_data['is_breached'],
                        has_login_form=enriched_data['has_login_form'],
                        login_form_type=enriched_data['login_form_type'],
                        web_application=enriched_data['web_application'],
                        is_parked=enriched_data['is_parked'],
                        title=enriched_data['title']
                    )
                    current_batch.append(breach_data)

                if len(current_batch) >= batch_size:
                    db.session.bulk_save_objects(current_batch)
                    db.session.commit()
                    processed_count += len(current_batch)
                    current_batch = []

            except ValueError as e:
                logging.warning(f"Skipping malformed line: {line}")
                continue

        # Traitement du dernier batch
        if current_batch:
            db.session.bulk_save_objects(current_batch)
            db.session.commit()
            processed_count += len(current_batch)

        return jsonify({
            'message': 'File processed successfully',
            'records_processed': processed_count
        })

    except Exception as e:
        db.session.rollback()
        logging.error(f"Error processing file: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/search', methods=['GET'])
def search():
    """Endpoint pour rechercher dans les données avec filtres multiples"""
    query = request.args.get('q', '')
    field = request.args.get('field', 'domain')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    is_resolved = request.args.get('is_resolved', type=bool)
    has_login_form = request.args.get('has_login_form', type=bool)
    login_form_type = request.args.get('login_form_type')
    is_accessible = request.args.get('is_accessible', type=bool)

    try:
        # Construction de la requête de base
        query_obj = BreachData.query

        # Application des filtres
        if query:
            if field == 'uri':
                query_obj = query_obj.filter(BreachData.uri.like(f'%{query}%'))
            elif field == 'domain':
                query_obj = query_obj.filter(BreachData.domain.like(f'%{query}%'))
            elif field == 'username':
                query_obj = query_obj.filter(BreachData.username.like(f'%{query}%'))
            elif field == 'ip_address':
                query_obj = query_obj.filter(BreachData.ip_address.like(f'%{query}%'))
            elif field == 'web_application':
                query_obj = query_obj.filter(BreachData.web_application.like(f'%{query}%'))
            else:
                return jsonify({'error': 'Invalid search field'}), 400

        # Filtres booléens et enum
        if is_resolved is not None:
            query_obj = query_obj.filter(BreachData.is_resolved == is_resolved)
        if has_login_form is not None:
            query_obj = query_obj.filter(BreachData.has_login_form == has_login_form)
        if login_form_type:
            query_obj = query_obj.filter(BreachData.login_form_type == login_form_type)
        if is_accessible is not None:
            query_obj = query_obj.filter(BreachData.is_accessible == is_accessible)

        # Pagination
        paginated_results = query_obj.paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'total': paginated_results.total,
            'pages': paginated_results.pages,
            'current_page': page,
            'results': [item.to_dict() for item in paginated_results.items]
        })

    except Exception as e:
        logging.error(f"Error searching data: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Endpoint pour obtenir des statistiques sur les données"""
    try:
        total_records = BreachData.query.count()
        accessible_domains = BreachData.query.filter_by(is_accessible=True).count()
        unique_domains = db.session.query(db.func.count(db.distinct(BreachData.domain))).scalar()
        login_forms = BreachData.query.filter_by(has_login_form=True).count()
        resolved_cases = BreachData.query.filter_by(is_resolved=True).count()

        # Distribution des types de formulaires de connexion
        login_form_types = db.session.query(
            BreachData.login_form_type,
            db.func.count(BreachData.login_form_type)
        ).group_by(BreachData.login_form_type).all()

        return jsonify({
            'total_records': total_records,
            'accessible_domains': accessible_domains,
            'unique_domains': unique_domains,
            'login_forms': login_forms,
            'resolved_cases': resolved_cases,
            'login_form_types': dict(login_form_types) if login_form_types else {}
        })

    except Exception as e:
        logging.error(f"Error getting statistics: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/resolve/<int:breach_id>', methods=['PUT'])
def resolve_breach(breach_id):
    """Endpoint pour marquer une brèche comme résolue"""
    try:
        breach = BreachData.query.get_or_404(breach_id)
        breach.is_resolved = True
        db.session.commit()
        return jsonify({'message': 'Breach marked as resolved', 'breach': breach.to_dict()})
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error resolving breach {breach_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/tag/<int:breach_id>', methods=['PUT'])
def update_tags(breach_id):
    """Endpoint pour mettre à jour les tags d'une brèche"""
    try:
        breach = BreachData.query.get_or_404(breach_id)
        new_tags = request.json.get('tags', {})

        if not isinstance(new_tags, dict):
            return jsonify({'error': 'Tags must be provided as a JSON object'}), 400

        # Fusion des tags existants avec les nouveaux
        current_tags = breach.tags or {}
        current_tags.update(new_tags)
        breach.tags = current_tags

        db.session.commit()
        return jsonify({'message': 'Tags updated successfully', 'breach': breach.to_dict()})
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating tags for breach {breach_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Configuration du logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        filename='breach_analyzer.log'
    )

    # Création des tables si elles n'existent pas
    with app.app_context():
        db.create_all()

    app.run(debug=True)