const express = require('express')
const router = express.Router()
const { getAllBookings, createBooking, updateBookingStatus, getBookingById } = require('../controllers/bookingController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getAllBookings)
router.get('/:id', protect, getBookingById)
router.post('/', protect, createBooking)
router.put('/:id', protect, updateBookingStatus)

module.exports = router