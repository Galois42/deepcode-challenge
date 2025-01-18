from faker import Faker
import random
import json

fake = Faker()

# Données de test pour la variation
DOMAINS = ['example.com', 'testsite.org', 'demo.net', 'dev.io', 'staging.com']
WEB_APPS = ['WordPress', 'Drupal', 'Joomla', 'Magento', 'Laravel', 'Django']
LOGIN_TYPES = ['basic', 'captcha', 'otp', 'other']
PROTOCOLS = ['http', 'https']
PATHS = ['/admin', '/login', '/wp-admin', '/user', '/account', '/dashboard']


def generate_test_data(num_records=100):
    """Génère des données de test réalistes"""

    test_data = []
    for _ in range(num_records):
        # Génération d'un domaine et d'une URL
        domain = random.choice(DOMAINS)
        protocol = random.choice(PROTOCOLS)
        path = random.choice(PATHS)
        url = f"{protocol}://{domain}{path}"

        # Génération des tags
        tags = {
            'protocol': protocol,
            'tld': domain.split('.')[-1],
            'type': random.choice(['cms', 'ecommerce', 'blog', 'corporate']),
            'environment': random.choice(['prod', 'dev', 'staging'])
        }

        # Création d'une ligne
        record = f"{url} {fake.user_name()} {fake.password()}"
        test_data.append(record)

    # Écriture dans un fichier
    with open('test_data.txt', 'w') as f:
        for record in test_data:
            f.write(record + '\n')

    print(f"Generated {num_records} test records in test_data.txt")


if __name__ == "__main__":
    generate_test_data(1000)  # Génère 1000 enregistrements