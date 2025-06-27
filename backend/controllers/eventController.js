const db = require('../models');
const Event = db.Event;
const EventRSVP = db.EventRSVP;
const User = db.User;
const { Op } = require('sequelize');

exports.createEvent = async (req, res) => {
  const { title, description, date, time, location, category } = req.body;
  const createdById = req.user.id;
  try {
    const newEvent = await Event.create({ title, description, date, time, location, category, createdById, rsvpCount: 0 });
    res.status(201).json({ msg: 'Event created successfully', event: newEvent });
  } catch (err) { console.error(err.message); res.status(500).send('Server error creating event'); }
};

exports.getAllEvents = async (req, res) => {
    try {
        const { search, category, date } = req.query;
        let whereClause = {};
        if (search) { whereClause[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }, { description: { [Op.iLike]: `%${search}%` } }]; }
        if (category) { whereClause.category = category; }
        if (date) { whereClause.date = date; }
        const events = await Event.findAll({
            where: whereClause,
            include: [{ model: User, as: 'creator', attributes: ['username', 'email'] }],
            order: [['date', 'ASC'], ['time', 'ASC']]
        });
        res.json(events);
    } catch (err) { console.error(err.message); res.status(500).send('Server error fetching events'); }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
        include: [
            { model: User, as: 'creator', attributes: ['username', 'email'] },
            { model: EventRSVP, as: 'rsvps', include: [{ model: User, as: 'user', attributes: ['username'] }] }
        ]
    });
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (err) { console.error(err.message); res.status(500).send('Server error fetching event'); }
};

exports.updateEvent = async (req, res) => {
    const { title, description, date, time, location, category } = req.body;
    try {
        let event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        if (event.createdById !== req.user.id) return res.status(403).json({ msg: 'Not authorized to update this event' });
        event.title = title || event.title; event.description = description || event.description; event.date = date || event.date;
        event.time = time || event.time; event.location = location || event.location; event.category = category || event.category;
        await event.save();
        res.json({ msg: 'Event updated successfully', event });
    } catch (err) { console.error(err.message); res.status(500).send('Server error updating event'); }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        if (event.createdById !== req.user.id) return res.status(403).json({ msg: 'Not authorized to delete this event' });
        await event.destroy();
        res.json({ msg: 'Event deleted successfully' });
    } catch (err) { console.error(err.message); res.status(500).send('Server error deleting event'); }
};

exports.rsvpEvent = async (req, res) => {
    const { status } = req.body;
    try {
        const eventId = req.params.id; const userId = req.user.id;
        const event = await Event.findByPk(eventId);
        if (!event) return res.status(404).json({ msg: 'Event not found' });
        let rsvp = await EventRSVP.findOne({ where: { userId, eventId } });
        if (rsvp) {
            if (rsvp.status !== status) { rsvp.status = status; await rsvp.save(); }
            return res.json({ msg: 'RSVP updated successfully', rsvp });
        } else {
            rsvp = await EventRSVP.create({ userId, eventId, status });
            if (status === 'going') { event.rsvpCount += 1; await event.save(); }
            return res.status(201).json({ msg: 'RSVP created successfully', rsvp });
        }
    } catch (err) { console.error(err.message); res.status(500).send('Server error during RSVP'); }
};

exports.cancelRsvp = async (req, res) => {
    try {
        const eventId = req.params.id; const userId = req.user.id;
        const rsvp = await EventRSVP.findOne({ where: { userId, eventId } });
        if (!rsvp) return res.status(404).json({ msg: 'RSVP not found' });
        const event = await Event.findByPk(eventId);
        if (event && rsvp.status === 'going') { event.rsvpCount -= 1; await event.save(); }
        await rsvp.destroy();
        res.json({ msg: 'RSVP cancelled successfully' });
    } catch (err) { console.error(err.message); res.status(500).send('Server error cancelling RSVP'); }
};