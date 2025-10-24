import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    accountType: { type: String, enum: ['particulier', 'entreprise'], default: 'particulier' },
    role: { type: String, enum: ['visitor', 'particulier', 'entreprise', 'admin'], default: 'particulier' },
    subscription: {
        plan: { type: String, enum: ['gratuit', 'pro', 'premium'], default: 'gratuit' },
        isActive: { type: Boolean, default: true },
        endDate: Date
    },
    companyInfo: {
        companyName: String,
        siret: String,
        address: {
            street: String,
            city: String,
            postalCode: String,
            country: { type: String, default: 'France' }
        },
        kycVerified: { type: Boolean, default: false }
    },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        },
        language: { type: String, default: 'fr' }
    },
    stats: {
        propertiesCount: { type: Number, default: 0 },
        viewsCount: { type: Number, default: 0 },
        lastLogin: Date,
        loginCount: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    blockedReason: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual pour le nom complet
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual pour vérifier l'abonnement
userSchema.virtual('isSubscriptionValid').get(function() {
    if (!this.subscription.isActive) return false;
    if (!this.subscription.endDate) return true;
    return new Date() < this.subscription.endDate;
});

// Hash du mot de passe
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Vérifier si peut publier 
userSchema.methods.canPublishProperty = function() {
    if (this.isBlocked || !this.isActive) return false;
    if (this.accountType === 'entreprise' && !this.companyInfo.kycVerified) return false;
    return true;
};

// Limites d'abonnement 
userSchema.methods.getSubscriptionLimits = function() {
    const limits = {
        gratuit: { properties: 3, imagesPerProperty: 5 },
        pro: { properties: 20, imagesPerProperty: 15 },
        premium: { properties: -1, imagesPerProperty: -1 }
    };
    return limits[this.subscription.plan] || limits.gratuit;
};

// Nettoyer les données sensibles
userSchema.methods.toSafeObject = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.passwordResetToken;
    delete userObject.passwordResetExpires;
    delete userObject.emailVerificationToken;
    delete userObject.emailVerificationExpires;
    return userObject;
};

export default mongoose.model('User', userSchema);