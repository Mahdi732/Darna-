export default {
    // Environnement de test
    testEnvironment: 'node',
    
    // Extensions de fichiers à traiter
    moduleFileExtensions: ['js', 'json'],
    
    // Transformation des modules ES6
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    
    // Répertoires de tests
    testMatch: [
        '**/src/**/*.test.js',
        '**/tests/**/*.test.js'
    ],
    
    // Répertoires à ignorer
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/'
    ],
    
    // Variables d'environnement pour les tests
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
    
    // Timeout pour les tests
    testTimeout: 10000,
    
    // Couverture de code
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    
    // Fichiers à inclure dans la couverture
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/test/**',
        '!src/**/*.test.js'
    ],
    
    // Seuils de couverture
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    
    // Nettoyage automatique des mocks
    clearMocks: true,
    restoreMocks: true
};
