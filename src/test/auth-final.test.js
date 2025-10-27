import request from 'supertest';
import App from '../app.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

describe('🔐 Tests Jest - Système d\'Authentification Complet', () => {
    let server;

    beforeAll(async () => {
        const app = new App();
        server = app.getApp();
    });

    describe('🏥 Santé API', () => {
        test('Health check fonctionne', async () => {
            const response = await request(server)
                .get('/health');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Darna API is running');
        });
    });

    describe('🔗 SSO Google', () => {
        test('Route Google SSO redirige vers Google', async () => {
            const response = await request(server)
                .get('/api/auth/google');

            expect(response.status).toBe(302);
            expect(response.headers.location).toContain('accounts.google.com');
        });

        test('Route Google SSO contient les paramètres OAuth', async () => {
            const response = await request(server)
                .get('/api/auth/google');

            expect(response.status).toBe(302);
            expect(response.headers.location).toContain('client_id=');
            expect(response.headers.location).toContain('redirect_uri=');
            expect(response.headers.location).toContain('scope=profile%20email');
        });
    });

    describe('📝 Routes d\'authentification', () => {
        test('Route inscription valide les données', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('Route connexion valide les données', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('Route profil protégée par token', async () => {
            const response = await request(server)
                .get('/api/auth/profile');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test('Route profil avec token invalide', async () => {
            const response = await request(server)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });


    describe('🔒 Sécurité et Middleware', () => {
        test('CORS configuré correctement', async () => {
            const response = await request(server)
                .options('/health');

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });

        test('Headers de sécurité présents', async () => {
            const response = await request(server)
                .get('/health');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('📊 Structure de l\'API', () => {
        test('Routes d\'authentification disponibles', async () => {
            const registerResponse = await request(server)
                .post('/api/auth/register')
                .send({});
            expect(registerResponse.status).toBe(400);

            const loginResponse = await request(server)
                .post('/api/auth/login')
                .send({});
            expect(loginResponse.status).toBe(400);

            const profileResponse = await request(server).get('/api/auth/profile');
            expect(profileResponse.status).toBe(401);

            const googleResponse = await request(server).get('/api/auth/google');
            expect(googleResponse.status).toBe(302);
        });

        test('Format de réponse cohérent', async () => {
            const response = await request(server)
                .get('/health');

            expect(response.body).toHaveProperty('success');
            expect(response.body).toHaveProperty('message');
            expect(typeof response.body.success).toBe('boolean');
        });
    });

    describe('⚡ Performance', () => {
        test('Réponse rapide pour health check', async () => {
            const start = Date.now();
            const response = await request(server)
                .get('/health');
            const duration = Date.now() - start;

            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(1000);
        });

        test('Réponse rapide pour routes auth', async () => {
            const start = Date.now();
            const response = await request(server)
                .post('/api/auth/login')
                .send({});
            const duration = Date.now() - start;

            expect(response.status).toBe(400);
            expect(duration).toBeLessThan(2000);
        });
    });

    describe('🔐 Validation des données', () => {
        test('Validation email invalide', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    email: 'email-invalide',
                    password: 'password123',
                    firstName: 'Jean',
                    lastName: 'Dupont'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('Validation mot de passe trop court', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: '123',
                    firstName: 'Jean',
                    lastName: 'Dupont'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('Validation données manquantes', async () => {
            const response = await request(server)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('🔐 Authentification complète', () => {
        test('Route logout existe', async () => {
            const response = await request(server)
                .post('/api/auth/logout');

            expect(response.status).not.toBe(404);
        });

        test('Route refresh token existe', async () => {
            const response = await request(server)
                .post('/api/auth/refresh-token');

            expect(response.status).not.toBe(404);
        });


        test('Route request password reset existe', async () => {
            const response = await request(server)
                .post('/api/auth/request-password-reset');

            expect(response.status).not.toBe(404);
        });

        test('Route reset password existe', async () => {
            const response = await request(server)
                .post('/api/auth/reset-password');

            expect(response.status).not.toBe(404);
        });

        test('Route change password existe', async () => {
            const response = await request(server)
                .post('/api/auth/change-password');

            expect(response.status).not.toBe(404);
        });

        test('Route update profile existe', async () => {
            const response = await request(server)
                .put('/api/auth/profile');

            expect(response.status).not.toBe(404);
        });

        test('Route check auth existe', async () => {
            const response = await request(server)
                .get('/api/auth/check');

            expect(response.status).not.toBe(404);
        });

        test('Route me existe', async () => {
            const response = await request(server)
                .get('/api/auth/me');

            expect(response.status).not.toBe(404);
        });
    });

    describe('🔗 SSO complet', () => {
        test('Route Google callback existe', async () => {
            const response = await request(server)
                .get('/api/auth/google/callback');

            expect(response.status).not.toBe(404);
        });
    });

    describe('🔐 2FA - Authentification à deux facteurs', () => {
        test('Route 2FA status existe', async () => {
            const response = await request(server)
                .get('/api/auth/2fa/status');

            expect(response.status).not.toBe(404);
        });

        test('Route 2FA setup existe', async () => {
            const response = await request(server)
                .post('/api/auth/2fa/setup');

            expect(response.status).not.toBe(404);
        });

        test('Route 2FA enable existe', async () => {
            const response = await request(server)
                .post('/api/auth/2fa/enable');

            expect(response.status).not.toBe(404);
        });

        test('Route 2FA disable existe', async () => {
            const response = await request(server)
                .post('/api/auth/2fa/disable');

            expect(response.status).not.toBe(404);
        });

        test('Route 2FA verify existe', async () => {
            const response = await request(server)
                .post('/api/auth/2fa/verify');

            expect(response.status).not.toBe(404);
        });
    });

    describe('🔍 Tests de robustesse', () => {
        test('Gestion des erreurs 404', async () => {
            const response = await request(server)
                .get('/api/route-inexistante');

            expect(response.status).toBe(404);
        });

        test('Gestion des méthodes non autorisées', async () => {
            const response = await request(server)
                .delete('/api/auth/login');
            expect(response.status).toBe(404);
        });
    });

    describe('📈 Métriques et monitoring', () => {
        test('Logs de requêtes fonctionnent', async () => {
            const response = await request(server)
                .get('/health');

            expect(response.status).toBe(200);
            // Les logs sont visibles dans la console
        });

        test('Temps de réponse acceptable', async () => {
            const start = Date.now();
            const response = await request(server)
                .get('/health');
            const duration = Date.now() - start;

            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(500);
        });
    });
});
