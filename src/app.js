import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dbConfig from './config/db.js';
import authRoutes from './routes/authRoute.js';

dotenv.config();

class App {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 5000;
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    // Configuration des middlewares
    setupMiddlewares() {
        this.app.use(cors({
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true
        }));
        
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    // Configuration des routes
    setupRoutes() {
        this.app.get('/health', (req, res) => {
            res.json({ success: true, message: 'Darna API is running' });
        });

        this.app.use('/api/auth', authRoutes);

        this.app.use((req, res) => {
            res.status(404).json({ success: false, message: 'Route non trouvée' });
        });
    }

    // Gestion des erreurs
    setupErrorHandling() {
        this.app.use((error, req, res, next) => {
            console.error('Error:', error);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Erreur de validation',
                    errors: Object.values(error.errors).map(err => ({
                        field: err.path,
                        message: err.message
                    }))
                });
            }

            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Données déjà utilisées'
                });
            }

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token invalide'
                });
            }

            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Erreur interne du serveur'
            });
        });
    }

    // Démarrer le serveur
    async start() {
        try {
            await dbConfig.connect();
            
            this.app.listen(this.port, () => {
                console.log(`Serveur démarré sur le port ${this.port}`);
                console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
                console.log(`URL: http://localhost:${this.port}`);
            });

            process.on('SIGINT', this.shutdown.bind(this));
            process.on('SIGTERM', this.shutdown.bind(this));

        } catch (error) {
            console.error('Erreur démarrage:', error);
            process.exit(1);
        }
    }

    // Arrêt du serveur
    async shutdown() {
        console.log(' Arrêt du serveur...');
        try {
            await dbConfig.disconnect();
            console.log(' Serveur arrêté');
            process.exit(0);
        } catch (error) {
            console.error(' Erreur arrêt:', error);
            process.exit(1);
        }
    }

    getApp() {
        return this.app;
    }
}

export default App;