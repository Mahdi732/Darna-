import express from 'express';
import PropertyController from '../controllers/PropertyController.js';

const router = express.Router();

router.post('/', PropertyController.createProperty);

export default router;