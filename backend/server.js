const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./src/routes/auth'))
app.use('/api/rooms', require('./src/routes/rooms'))
app.use('/api/bookings', require('./src/routes/bookings'))
app.use('/api/guests', require('./src/routes/guests'))
app.use('/api/payments', require('./src/routes/payments'))


app.get('/', (req, res) => res.send('Hotel API running 🏨'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))