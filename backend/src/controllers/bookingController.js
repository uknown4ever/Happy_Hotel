const prisma = require('../config/db')

const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { guest: true, room: true, payment: true }
    })
    res.json(bookings)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const createBooking = async (req, res) => {
  try {
    const { guestId, roomId, checkIn, checkOut, totalPrice } = req.body

    const room = await prisma.room.findUnique({ where: { id: parseInt(roomId) } })
    if (!room) return res.status(404).json({ message: 'Room not found' })
    if (room.status === 'occupied') return res.status(400).json({ message: 'Room is already occupied' })

    const booking = await prisma.booking.create({
      data: {
        guestId: parseInt(guestId),
        roomId: parseInt(roomId),
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalPrice: parseFloat(totalPrice)
      }
    })

    await prisma.room.update({
      where: { id: parseInt(roomId) },
      data: { status: 'occupied' }
    })

    res.status(201).json({ message: 'Booking created successfully', booking })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body
    const booking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    })

    if (status === 'completed' || status === 'cancelled') {
      await prisma.room.update({
        where: { id: booking.roomId },
        data: { status: 'available' }
      })
    }

    res.json({ message: 'Booking updated', booking })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getBookingById = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { guest: true, room: true, payment: true }
    })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json(booking)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { getAllBookings, createBooking, updateBookingStatus, getBookingById }