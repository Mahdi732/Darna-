import SubscriptionService from '../services/SubscriptionService.js';

class SubscriptionController {
    constructor() {
        this.subscriptionService = new SubscriptionService();
    }

    subscribe = async (req, res) => {
        try {
            const subscription = await this.subscriptionService.createSubscription(req.user.userId, req.body.planId);
            res.json({ success: true, subscription });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };

    getMySubscription = async (req, res) => {
        try {
            const subscription = await this.subscriptionService.getUserSubscription(req.user.userId);
            res.json({ success: true, subscription });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    cancelSubscription = async (req, res) => {
        try {
            await this.subscriptionService.cancelSubscription(req.user.userId);
            res.json({ success: true, message: 'Abonnement annulé' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}

export default SubscriptionController;
