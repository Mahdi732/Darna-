import request from 'supertest';
import mongoose from 'mongoose';
import App from '../app.js';
import User from '../models/User.js';
import dbConfig from '../config/db.js';

describe('Authentication Tests', () => {
    let app;
    let server;

    beforeAll(async () => {
        // Configuration pour les tests
        process.env.NODE_ENV = 'test';
        process.env.JWT_SECRET = 'test-secret-key';
        process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/darna-test';
        
        app = new App();
        server = app.getApp();
        
        // Connexion à la base de données de test
        await dbConfig.connect();
    });

    afterAll(async () => {
        // Nettoyage de la base de données de test
        await User.deleteMany({});
        await dbConfig.disconnect();
    });

    beforeEach(async () => {
        // Nettoyer la base de données avant chaque test
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                accountType: 'particulier'
            };

            const response = await request(server)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Compte créé avec succès');
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.user.password).toBeUndefined(); // Le mot de passe ne doit pas être retourné
        });

        it('should register a company user successfully', async () => {
            const userData = {
                email: 'company@example.com',
                password: 'password123',
                firstName: 'Jane',
                lastName: 'Smith',
                accountType: 'entreprise',
                companyInfo: {
                    companyName: 'Test Company',
                    siret: '12345678901234'
                }
            };

            const response = await request(server)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.user.accountType).toBe('entreprise');
            expect(response.body.user.companyInfo.companyName).toBe('Test Company');
        });

        it('should fail to register with missing required fields', async () => {
            const userData = {
                email: 'test@example.com',
                // password manquant
                firstName: 'John',
                lastName: 'Doe'
            };

            const response = await request(server)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Champs manquants');
        });

        it('should fail to register with invalid email', async () => {
            const userData = {
                email: 'invalid-email',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                accountType: 'particulier'
            };

            const response = await request(server)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail to register with duplicate email', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                accountType: 'particulier'
            };

            // Premier enregistrement
            await request(server)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            // Deuxième enregistrement avec le même email
            const response = await request(server)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('existe déjà');
        });

        it('should fail to register company without company name', async () => {
            const userData = {
                email: 'company@example.com',
                password: 'password123',
                firstName: 'Jane',
                lastName: 'Smith',
                accountType: 'entreprise'
                // companyInfo manquant
            };

            const response = await request(server)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('nom de l\'entreprise');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Créer un utilisateur de test
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                accountType: 'particulier'
            };

            await request(server)
                .post('/api/auth/register')
                .send(userData);
        });

        it('should login successfully with valid credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.token).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.user.email).toBe(loginData.email);
        });

        it('should fail to login with invalid email', async () => {
            const loginData = {
                email: 'wrong@example.com',
                password: 'password123'
            };

            const response = await request(server)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Email ou mot de passe incorrect');
        });

        it('should fail to login with invalid password', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            const response = await request(server)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Email ou mot de passe incorrect');
        });

        it('should fail to login with missing credentials', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Email et mot de passe requis');
        });
    });

    describe('GET /api/auth/profile', () => {
        let authToken;

        beforeEach(async () => {
            // Créer un utilisateur et obtenir un token
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                accountType: 'particulier'
            };

            await request(server)
                .post('/api/auth/register')
                .send(userData);

            const loginResponse = await request(server)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            authToken = loginResponse.body.token;
        });

        it('should get user profile with valid token', async () => {
            const response = await request(server)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.user.email).toBe('test@example.com');
            expect(response.body.user.password).toBeUndefined();
        });

        it('should fail to get profile without token', async () => {
            const response = await request(server)
                .get('/api/auth/profile')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token d\'accès requis');
        });

        it('should fail to get profile with invalid token', async () => {
            const response = await request(server)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token invalide');
        });
    });

    describe('POST /api/auth/logout', () => {
        let authToken;

        beforeEach(async () => {
            // Créer un utilisateur et obtenir un token
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                accountType: 'particulier'
            };

            await request(server)
                .post('/api/auth/register')
                .send(userData);

            const loginResponse = await request(server)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            authToken = loginResponse.body.token;
        });

        it('should logout successfully', async () => {
            const response = await request(server)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Déconnexion réussie');
        });

        it('should fail to logout without token', async () => {
            const response = await request(server)
                .post('/api/auth/logout')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Token d\'accès requis');
        });
    });

    describe('Health Check', () => {
        it('should return health status', async () => {
            const response = await request(server)
                .get('/health')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Darna API is running');
        });
    });
});
