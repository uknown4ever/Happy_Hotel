const express = require('express')
const router = express.Router()
const { createPayment, getPaymentByBooking, getAllPayments } = require('../controllers/paymentController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getAllPayments)
router.get('/:bookingId', protect, getPaymentByBooking)
router.post('/', protect, createPayment)

module.exports = router