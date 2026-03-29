const express = require('express');
const router = express.Router();
const { getPublicProfile, getPublicEventType, getAvailableSlots, createBooking, getAvailableDates } = require('../controllers/public');
router.get('/:username', getPublicProfile);
router.get('/:username/:slug', getPublicEventType);
router.get('/:username/:slug/slots', getAvailableSlots);
router.get('/:username/:slug/dates', getAvailableDates);
router.post('/:username/:slug/book', createBooking);
module.exports = router;
