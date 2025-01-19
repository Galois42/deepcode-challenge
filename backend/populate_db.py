import pymysql
import json
from faker import Faker
import random
import ipaddress

fake = Faker()

# Données de test enrichies
DOMAINS = [
    'example.com', 'testsite.org', 'demo.net', 'dev.io', 'staging.com',
    'corporate.net', 'webapp.io', 'cloud.dev', 'secure.app', 'platform.co',
    'saas.tech', 'portal.com', 'internal.net', 'test.dev', 'beta.io'
]

WEB_APPS = [
    'WordPress', 'Drupal', 'Joomla', 'Magento', 'Shopify', 'Citrix',
'phpMyAdmin', 'Outlook Web Access', 'Roundcube', 'Zimbra', 'Atlassian Jira', 
'Atlassian Confluence', 'SAP', 'Generic Login', 'Tomcat', 'Fortinet', 'Cisco',
'Microsoft RDWeb', 'Webmail'
]

LOGIN_TYPES = ['basic', 'captcha', 'otp', 'other']
PROTOCOLS = ['http', 'https']
PATHS = [
    '/admin', '/login', '/wp-admin', '/user', '/account', '/dashboard',
    '/portal', '/manage', '/auth', '/control-panel', '/profile',
    '/settings', '/system', '/backend', '/administrator'
]

ENVIRONMENTS = ['production', 'development', 'staging', 'testing', 'qa']
APP_TYPES = ['cms', 'ecommerce', 'blog', 'corporate', 'social', 'api', 'internal']

def get_db_connection():
    return pymysql.connect(
        host='deep-code-challenge.cj62emkiif26.us-east-2.rds.amazonaws.com',
        user='admin',
        password='hamidlmath',
        database='DEEPCODE'
    )

def generate_realistic_ip():
    """Génère une adresse IP réaliste"""
    # Définition des plages d'IP
    ip_ranges = [
        ('10.0.0.0', '10.255.255.255'),  # Private network
        ('172.16.0.0', '172.31.255.255'),  # Private network
        ('192.168.0.0', '192.168.255.255'),  # Private network
        ('203.0.113.0', '203.0.113.255'),  # Documentation
        ('104.0.0.0', '104.255.255.255'),  # Public range
        ('208.0.0.0', '208.255.255.255')  # Public range
    ]

    # Sélection aléatoire d'une plage
    start_ip, end_ip = random.choice(ip_ranges)

    # Conversion en entiers pour la génération aléatoire
    start = int(ipaddress.IPv4Address(start_ip))
    end = int(ipaddress.IPv4Address(end_ip))

    # Génération d'une IP aléatoire dans la plage
    ip_int = random.randint(start, end)
    return str(ipaddress.IPv4Address(ip_int))

def generate_tags():
    """Génère des tags réalistes"""
    tags = {
        'protocol': random.choice(PROTOCOLS),
        'environment': random.choice(ENVIRONMENTS),
        'type': random.choice(APP_TYPES),
    }

    # Ajout aléatoire de tags supplémentaires
    if random.random() > 0.5:
        tags['framework'] = random.choice([app.lower() for app in WEB_APPS])
    if random.random() > 0.7:
        tags['priority'] = random.choice(['high', 'medium', 'low'])
    if random.random() > 0.6:
        tags['status'] = random.choice(['active', 'inactive', 'maintenance'])

    return tags

def generate_test_record():
    """Génère un enregistrement de test complet"""
    domain = random.choice(DOMAINS)
    protocol = 'https' if random.random() > 0.2 else 'http'
    path = random.choice(PATHS)
    port = 443 if protocol == 'https' else 80

    # Variation des booléens
    is_resolved = random.random() > 0.7
    is_accessible = random.random() > 0.1
    has_login_form = random.random() > 0.3
    is_parked = random.random() > 0.9
    is_breached = random.random() > 0.5

    return {
        'uri': f"{protocol}://{domain}{path}",
        'username': fake.user_name(),
        'password': fake.password(length=12),
        'domain': domain,
        'ip_address': generate_realistic_ip(),
        'port': port,
        'path': path,
        'tags': generate_tags(),
        'title': fake.catch_phrase() if random.random() > 0.3 else None,
        'is_resolved': is_resolved,
        'is_accessible': is_accessible,
        'has_login_form': has_login_form,
        'login_form_type': random.choice(LOGIN_TYPES) if has_login_form else None,
        'web_application': random.choice(WEB_APPS) if random.random() > 0.4 else None,
        'is_parked': is_parked,
        'is_breached': is_breached
    }

def create_tables():
    connection = get_db_connection()
    with connection.cursor() as cursor:
        # Create the breaches table
        create_table_sql = """
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
                is_resolved BOOL DEFAULT FALSE,
                is_accessible BOOL,
                has_login_form BOOL,
                login_form_type ENUM('basic', 'captcha', 'otp', 'other'),
                web_application VARCHAR(255),
                is_parked BOOL,
                is_breached BOOL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """
        cursor.execute(create_table_sql)
    connection.commit()
    connection.close()

def generate_and_insert_test_data(num_records=100):
    connection = get_db_connection()
    with connection.cursor() as cursor:
        for _ in range(num_records):
            record = generate_test_record()
            tags_json = json.dumps(record['tags'], ensure_ascii=False)
            sql = """
                INSERT INTO breaches (uri, username, password, domain, ip_address,
                                      port, path, tags, title, is_resolved, is_accessible, has_login_form,
                                      login_form_type, web_application, is_parked, is_breached)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                record['uri'], record['username'], record['password'],
                record['domain'], record['ip_address'], record['port'],
                record['path'], tags_json, record['title'],
                record['is_resolved'], record['is_accessible'], record['has_login_form'],
                record['login_form_type'], record['web_application'], record['is_parked'], record['is_breached']
            )
            cursor.execute(sql, values)
    connection.commit()
    connection.close()

if __name__ == '__main__':
    create_tables()
    generate_and_insert_test_data(1000)
    print("Database populated successfully.")