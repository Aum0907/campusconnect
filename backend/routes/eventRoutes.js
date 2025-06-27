const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, eventController.createEvent); // Protected
router.get('/', eventController.getAllEvents); // Public
router.get('/:id', eventController.getEventById); // Public
router.put('/:id', authMiddleware, eventController.updateEvent); // Protected
router.delete('/:id', authMiddleware, eventController.deleteEvent); // Protected
router.post('/:id/rsvp', authMiddleware, eventController.rsvpEvent); // Protected
router.delete('/:id/rsvp', authMiddleware, eventController.cancelRsvp); // Protected

module.exports = router;