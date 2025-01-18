import unittest
from app import app, db, BreachData
import json


class TestSearchOutput(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = self.app.test_client()
        self.app.config['TESTING'] = True

        with self.app.app_context():
            db.session.query(BreachData).delete()

            # Création de 60 entrées (plus que la limite de 50)
            for i in range(1, 61):
                breach = BreachData(
                    uri=f'https://example{i}.com/login',
                    username=f'admin{i}',
                    password='redacted',
                    domain=f'example{i}.com',
                    ip_address='192.168.1.1',
                    port=443,
                    path='/login',
                    tags={'type': 'critical'},
                    title='Admin Login',
                    is_resolved=False,
                    is_accessible=True,
                    has_login_form=True,
                    login_form_type='basic',
                    web_application='WordPress',
                    is_parked=False,
                    is_breached=True
                )
                db.session.add(breach)

            db.session.commit()

    def test_search_limit(self):
        """Test que toute recherche est limitée à 50 résultats"""
        # Test avec une requête non spécifique
        response = self.client.get('/api/search')
        data = json.loads(response.data)
        self.assertLessEqual(len(data['results']), 50)

    def test_output_format(self):
        """Test que le format de sortie est correct"""
        response = self.client.get('/api/search')
        data = json.loads(response.data)

        # Vérification de la structure d'un résultat
        if data['results']:
            result = data['results'][0]
            expected_fields = {
                'id', 'uri', 'username', 'password', 'domain',
                'ip_address', 'port', 'path', 'tags', 'title',
                'is_resolved', 'is_accessible', 'has_login_form',
                'login_form_type', 'web_application', 'is_parked',
                'is_breached', 'created_at'
            }

            # Vérifie que tous les champs attendus sont présents
            self.assertEqual(set(result.keys()), expected_fields)

            # Vérifie les types de données
            self.assertIsInstance(result['id'], int)
            self.assertIsInstance(result['uri'], str)
            self.assertIsInstance(result['username'], str)
            self.assertIsInstance(result['password'], str)
            self.assertIsInstance(result['domain'], str)
            self.assertIsInstance(result['ip_address'], str)
            self.assertIsInstance(result['port'], int)
            self.assertIsInstance(result['path'], str)
            self.assertIsInstance(result['tags'], (dict, list))
            self.assertIsInstance(result['is_resolved'], bool)
            self.assertIsInstance(result['is_accessible'], bool)
            self.assertIsInstance(result['has_login_form'], bool)
            self.assertIsInstance(result['is_breached'], bool)

    def tearDown(self):
        with self.app.app_context():
            db.session.query(BreachData).delete()
            db.session.commit()


if __name__ == '__main__':
    unittest.main()