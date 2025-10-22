const mongoose = require('mongoose');

class Property {
  constructor() {
    const propertySchema = new mongoose.Schema(
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        transactionType: {
          type: String,
          required: true,
          enum: ['sale', 'daily_rent', 'monthly_rent', 'seasonal_rent'],
        },
        price: { type: Number, required: true },
        pricePerDay: { type: Number },
        availability: {
          from: { type: Date, required: true },
          to: { type: Date, required: true },
        },
        address: { type: String, required: true },
        location: {
          type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point',
          },
          coordinates: {
            type: [Number],
            required: true,
          },
        },
        surface: { type: Number, required: true },
        rooms: { type: Number, required: true },
        bathrooms: { type: Number, required: true },
        amenities: [{ type: String }],
        internalRules: [{ type: String }],
        energyDiagnostics: { type: String },
        status: {
          type: String,
          enum: ['draft', 'published'],
          default: 'draft',
        },
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      },
      {
        timestamps: true,
      }
    );

    propertySchema.index({ location: '2dsphere' });

    this.PropertyModel = mongoose.model('Property', propertySchema);
  }

  getModel() {
    return this.PropertyModel;
  }
}

module.exports = new Property();
