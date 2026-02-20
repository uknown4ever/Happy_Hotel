const prisma = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const exists = await prisma.staff.findUnique({ where: { email } })
    if (exists) return res.status(400).json({ message: 'Email already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const staff = await prisma.staff.create({
      data: { name, email, password: hashedPassword, role }
    })

    res.status(201).json({ message: 'Staff created successfully', staff })
  } catch (error) {
    console.error('REGISTER ERROR:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const staff = await prisma.staff.findUnique({ where: { email } })
    if (!staff) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(password, staff.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { id: staff.id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, staff: { id: staff.id, name: staff.name, role: staff.role } })
  } catch (error) {
    console.error('LOGIN ERROR:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = { register, login }