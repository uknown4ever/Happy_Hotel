const express = require('express')
const router = express.Router()
const { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', getAllRooms)
router.get('/:id', getRoomById)
router.post('/', protect, createRoom)
router.put('/:id', protect, updateRoom)
router.delete('/:id', protect, deleteRoom)

module.exports = router