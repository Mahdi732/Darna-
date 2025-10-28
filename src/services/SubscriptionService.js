import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';

class SubscriptionService {
    async createSubscription(userId, planId) {
        const plan = await Plan.findById(planId);
        if (!plan) throw new Error('Plan non trouvé');

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        return await Subscription.create({
            user: userId,
            plan: planId,
            endDate
        });
    }

    async getUserSubscription(userId) {
        return await Subscription.findOne({ user: userId, status: 'active' }).populate('plan');
    }

    async cancelSubscription(userId) {
        return await Subscription.findOneAndUpdate(
            { user: userId, status: 'active' },
            { status: 'cancelled' }
        );
    }

    async changePlan(userId, newPlanId) {
        await this.cancelSubscription(userId);
        return await this.createSubscription(userId, newPlanId);
    }
}

export default SubscriptionService;
