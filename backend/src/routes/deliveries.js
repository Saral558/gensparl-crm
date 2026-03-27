const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', deliveryController.getAllDeliveries);
router.post('/', deliveryController.createDelivery);
router.put('/:id', deliveryController.updateDelivery);
router.delete('/:id', deliveryController.deleteDelivery);

module.exports = router;
