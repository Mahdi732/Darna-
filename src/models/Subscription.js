import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true
    },
    status: {
        type: String, enum: ['active', 'cancelled', 'expired'], default: 'active'
    },
    startDate: {
        type: Date, default: Date.now
    },
    endDate: {
        type: Date, required: true
    },
    autoRenew: {
        type: Boolean, default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Subscription', subscriptionSchema);
