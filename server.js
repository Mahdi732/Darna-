import App from './src/app.js';

async function startServer() {
    const app = new App();
    
    try {
        await app.start();  
        console.log('Serveur complètement démarré et prêt !');
        
    } catch (error) {
        console.error('Erreur lors du démarrage:', error);
        process.exit(1);
    }
}

startServer();
