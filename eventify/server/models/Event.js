const mongoose = require('mongoose');

const eventData = new mongoose.Schema({
  Title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  Description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  Category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Music', 'Sports', 'Arts', 'Festivals', 'Business', 'Other']
  },
  Date: {
    type: Date,
    required: [true, 'Date is required']
  },
  Time: {
    type: String,
    required: [true, 'Time is required']
  },
  Location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  Capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  Paid: {
    type: Boolean,
    default: false
  },
  Status: {
    type: String,
    enum: ['upcoming', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  Organiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventData);
