const prisma = require('../config/db')

const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, method } = req.body

    const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const existing = await prisma.payment.findUnique({ where: { bookingId: parseInt(bookingId) } })
    if (existing) return res.status(400).json({ message: 'Payment already exists for this booking' })

    const payment = await prisma.payment.create({
      data: {
        bookingId: parseInt(bookingId),
        amount: parseFloat(amount),
        method,
        status: 'paid'
      }
    })

    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: { status: 'confirmed' }
    })

    res.status(201).json({ message: 'Payment created successfully', payment })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { bookingId: parseInt(req.params.bookingId) },
      include: { booking: true }
    })
    if (!payment) return res.status(404).json({ message: 'Payment not found' })
    res.json(payment)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { booking: { include: { guest: true, room: true } } }
    })
    res.json(payments)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { createPayment, getPaymentByBooking, getAllPayments }