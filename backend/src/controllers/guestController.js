const prisma = require('../config/db')

const getAllGuests = async (req, res) => {
  try {
    const guests = await prisma.guest.findMany({
      include: { bookings: true }
    })
    res.json(guests)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getGuestById = async (req, res) => {
  try {
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { bookings: true }
    })
    if (!guest) return res.status(404).json({ message: 'Guest not found' })
    res.json(guest)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const createGuest = async (req, res) => {
  try {
    const { name, email, phone } = req.body

    const exists = await prisma.guest.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ message: 'Guest already exists' })

    const guest = await prisma.guest.create({
      data: { name, email, phone }
    })
    res.status(201).json({ message: 'Guest created successfully', guest })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateGuest = async (req, res) => {
  try {
    const guest = await prisma.guest.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    })
    res.json({ message: 'Guest updated', guest })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const deleteGuest = async (req, res) => {
  try {
    await prisma.guest.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Guest deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getAllGuests, getGuestById, createGuest, updateGuest, deleteGuest }