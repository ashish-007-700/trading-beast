import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    preferences: {
        alertsEnabled: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        tradingSessionAlerts: {
            tokyo: { type: Boolean, default: false },
            london: { type: Boolean, default: false },
            newYork: { type: Boolean, default: false },
            sydney: { type: Boolean, default: false },
        },
    },
}, {
    timestamps: true,
});
// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(12);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};
// Remove sensitive data when converting to JSON
userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
    },
});
export const User = mongoose.model('User', userSchema);
