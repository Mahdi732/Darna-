import express from 'express';
import PropertyController from '../controllers/PropertyController.js';

const router = express.Router();

router.post('/', PropertyController.createProperty);

router.put('/:id', PropertyController.updateProperty);

export default router;