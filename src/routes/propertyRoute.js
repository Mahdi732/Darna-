import express from 'express';
import PropertyController from '../controllers/PropertyController.js';
import verifyOwnership from '../middlewares/verifyOwnership.js';

const router = express.Router();

router.post('/', PropertyController.createproperty);

router.put('/:id', PropertyController.updateProperty);

router.put(':/id', verifyOwnership, PropertyController.updateProperty);

router.delete('/:id',PropertyController.deleteProperty);

router.delete('/:id', verifyOwnership, PropertyController.deleteProperty);

export default router;