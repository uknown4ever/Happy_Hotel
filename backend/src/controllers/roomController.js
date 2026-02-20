const prisma = require('../config/db')

const getAllRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany()
    res.json(rooms)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getRoomById = async (req, res) => {
  try {
    const room = await prisma.room.findUnique({ where: { id: parseInt(req.params.id) } })
    if (!room) return res.status(404).json({ message: 'Room not found' })
    res.json(room)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const createRoom = async (req, res) => {
  try {
    const { number, type, floor, price, capacity } = req.body
    const room = await prisma.room.create({
      data: { number, type, floor: parseInt(floor), price: parseFloat(price), capacity: parseInt(capacity) }
    })
    res.status(201).json({ message: 'Room created successfully', room })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateRoom = async (req, res) => {
  try {
    const room = await prisma.room.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    })
    res.json({ message: 'Room updated', room })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteRoom = async (req, res) => {
  try {
    await prisma.room.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Room deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom }