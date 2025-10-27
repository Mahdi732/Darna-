import Joi from 'joi';

const propertySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  transactionType: Joi.string().valid('sale', 'daily_rent', 'monthly_rent', 'seasonal_rent').required(),
  price: Joi.number().required(),
  pricePerDay: Joi.number().optional(),
  availability: Joi.object({
    from: Joi.date().required(),
    to: Joi.date().required(),
  }).required(),
  address: Joi.string().required(),
  location: Joi.object({
    type: Joi.string().valid('Point').required(),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),
  surface: Joi.number().required(),
  rooms: Joi.number().required(),
  bathrooms: Joi.number().required(),
  amenities: Joi.array().items(Joi.string()).optional(),
  internalRules: Joi.array().items(Joi.string()).optional(),
  energyDiagnostics: Joi.string().optional(),
  status: Joi.string().valid('draft', 'published').optional(),
  ownerId: Joi.string().required(),
});

export default propertySchema;