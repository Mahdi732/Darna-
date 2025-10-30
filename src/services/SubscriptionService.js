import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Stripe from 'stripe';
import User from '../models/User.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    async createStripeSession(userId, planId) {
        const plan = await Plan.findById(planId);
        if (!plan) throw new Error('Plan non trouvé');
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: { name: plan.name },
                        unit_amount: plan.price * 100,
                    },
                    quantity: 1,
                },
            ],
            customer_email: (await User.findById(userId)).email,
            success_url: process.env.CLIENT_URL + '/abo/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: process.env.CLIENT_URL + '/abo/cancel',
            metadata: { userId: userId, planId: planId },
        });
        return session.url;
    }
}

export default SubscriptionService;
