import AuthService from '../services/Auth.service.js';

class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    // Inscription
    register = async (req, res) => {
        try {
            const userData = req.body;
            const result = await this.authService.register(userData);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // Connexion
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    };

    // Rafraîchir token
    refreshToken = async (req, res) => {
        try {
            const { refreshToken } = req.body;
            const result = await this.authService.refreshToken(refreshToken);
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    };

    // Déconnexion
    logout = async (req, res) => {
        try {
            const userId = req.user?.userId;
            const result = await this.authService.logout(userId);
            res.clearCookie('refreshToken');
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Vérification email
    verifyEmail = async (req, res) => {
        try {
            const { token } = req.query;
            const result = await this.authService.verifyEmail(token);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // Demande reset password
    requestPasswordReset = async (req, res) => {
        try {
            const { email } = req.body;
            const result = await this.authService.requestPasswordReset(email);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Reset password
    resetPassword = async (req, res) => {
        try {
            const { token, newPassword } = req.body;
            const result = await this.authService.resetPassword(token, newPassword);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // Changer mot de passe
    changePassword = async (req, res) => {
        try {
            const userId = req.user?.userId;
            const { currentPassword, newPassword } = req.body;
            const result = await this.authService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // Obtenir profil
    getProfile = async (req, res) => {
        try {
            const userId = req.user?.userId;
            const result = await this.authService.getUserProfile(userId);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // Mettre à jour profil
    updateProfile = async (req, res) => {
        try {
            const userId = req.user?.userId;
            const updateData = req.body;
            const result = await this.authService.updateUserProfile(userId, updateData);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    // Vérifier auth
    checkAuth = async (req, res) => {
        try {
            const userId = req.user?.userId;
            const result = await this.authService.getUserProfile(userId);
            res.status(200).json({
                success: true,
                message: 'Authentifié',
                user: result.user
            });
        } catch (error) {
            res.status(401).json({ success: false, message: 'Non authentifié' });
        }
    };
}

export default AuthController;