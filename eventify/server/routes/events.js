const express = require('express');
const Event = require('../models/Event');
const directionRouter = express.Router();

// GET events — search, sort, filter
directionRouter.get('/', async (request, response) => {
  try {
    const { search, category: Category, status: Status, dateFrom, sort } = request.query;
    const query = { Organiser: request.session.userId };

    if (search) {
      query.$or = [
        { Title:       { $regex: search, $options: 'i' } },
        { Description: { $regex: search, $options: 'i' } },
        { Location:    { $regex: search, $options: 'i' } }
      ];
    }
    if (Status   && Status   !== 'all') query.Status   = Status;
    if (Category && Category !== 'all') query.Category = Category;
    if (dateFrom) query.Date = { $gte: new Date(dateFrom) };

    const sortOption = sort === 'newest' ? { createdAt: -1 } : { Date: 1 };
    const events = await Event.find(query).sort(sortOption);
    response.json({ success: true, events });
  } catch {
    response.status(500).json({ success: false, message: 'Failed to fetch events. try again. If issue persists contact user support' });
  }
});

// GET events
directionRouter.get('/:id', async (request, response) => {
  try {
    const event = await Event.findOne({ _id: request.params.id, Organiser: request.session.userId });
    if (!event) return response.status(404).json({ success: false, message: 'Event not found.' });
    response.json({ success: true, event });
  } catch {
    response.status(500).json({ success: false, message: 'Failed to fetch event. try again. If issue persists contact user support' });
  }
});

// events — create
directionRouter.post('/', async (request, response) => {
  try {
    const { Title, Category, Description, Capacity, Time, Location,Date, Paid, Status } = request.body;
    if (!Title || !Category || !Description || !Capacity|| !Time || !Location || !Date )
      return response.status(400).json({ success: false, message: 'Please fill in all required fields to complete form.' });

    const event = await Event.create({
      Title, Description, Category, Date, Time, Location,
      Capacity: Number(Capacity),
      Paid: Paid === 'true' || Paid === true,
      Status: Status || 'upcoming',
      Organiser: request.session.userId
    });
    response.status(201).json({ success: true, event });
  } catch (err) {
    const msg = err.name === 'ValidationError'
      ? Object.values(err.errors)[0].message
      : 'Failed to create event.';
    response.status(400).json({ success: false, message: msg });
  }
});

// DELETE events
directionRouter.delete('/:id', async (request, response) => {
  try {
    const event = await Event.findOneAndDelete({ _id: request.params.id, Organiser: request.session.userId });
    if (!event) return response.status(404).json({ success: false, message: 'Event not found.' });
    response.json({ success: true, message: 'Event deleted.' });
  } catch {
    response.status(500).json({ success: false, message: 'Failed to delete event, try again. If issue persists contact user support' });
  }
});

// Update events
directionRouter.put('/:id', async (request, response) => {
  try {
    const event = await Event.findOne({ _id: request.params.id, Organiser: request.session.userId });
    if (!event) return response.status(404).json({ success: false, message: 'Event not found.' });

    const { Title, Category, Description, Capacity, Time, Location,Date, Paid, Status } = request.body;
    Object.assign(event, {
      Title:    Title    || event.Title,
      Category: Category || event.Category,
      Description: Description || event.Description,
      Capacity: Capacity ? Number(Capacity) : event.Capacity,
      Time:     Time     || event.Time,
      Location: Location || event.Location,
      Date:     Date     || event.Date,
      Paid:     Paid !== undefined ? (Paid === 'true' || Paid === true) : event.Paid,
      Status:   Status   || event.Status
    });
    await event.save();
    response.json({ success: true, event });
  } catch (err) {
    const msg = err.name === 'ValidationError'
      ? Object.values(err.errors)[0].message
      : 'Failed to update event. try again. If issue persists contact user support';
    response.status(400).json({ success: false, message: msg });
  }
});

module.exports = directionRouter;
