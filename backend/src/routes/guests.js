const express = require('express')
const router = express.Router()
const { getAllGuests, getGuestById, createGuest, updateGuest, deleteGuest } = require('../controllers/guestController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getAllGuests)
router.get('/:id', protect, getGuestById)
router.post('/', protect, createGuest)
router.put('/:id', protect, updateGuest)
router.delete('/:id', protect, deleteGuest)

module.exports = router