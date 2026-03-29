const express = require('express');
const router = express.Router();
const { getBookings, getBooking, cancelBooking, rescheduleBooking } = require('../controllers/bookings');
router.get('/', getBookings);
router.get('/:id', getBooking);
router.patch('/:id/cancel', cancelBooking);
router.post('/:id/reschedule', rescheduleBooking);
module.exports = router;
