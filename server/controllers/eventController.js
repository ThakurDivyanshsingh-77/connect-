const Event = require('../models/Event');
const User = require('../models/User'); // 1. User Model Import (Points ke liye)

// 1. Create Event (With Image Upload)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, time, location, type, max_participants } = req.body;

    // Check if file was uploaded
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path; 
    }

    const newEvent = new Event({
      title,
      description,
      date,
      time,
      location,
      type,
      max_participants: max_participants ? parseInt(max_participants) : null,
      image: imageUrl,
      organizer: req.user.id
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get All Events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name avatar_url batch')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Register for Event (UPDATED WITH POINTS)
exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const isRegistered = event.attendees.find(a => a.user.toString() === userId);
    if (isRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    event.attendees.push({ user: userId });
    await event.save();

    // 👇 ADD 50 POINTS LOGIC 👇
    await User.findByIdAndUpdate(userId, { $inc: { points: 50 } });

    res.json({ message: "Registered successfully (+50 Points)" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 4. Unregister from Event
exports.unregisterForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.attendees = event.attendees.filter(
      (a) => a.user.toString() !== userId
    );

    await event.save();
    
    // Optional: Agar points wapas lene hain to ye line uncomment karein:
    // await User.findByIdAndUpdate(userId, { $inc: { points: -50 } });

    res.json({ message: "Unregistered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. Get Event Attendees (NEW - View List ke liye)
exports.getEventAttendees = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findById(eventId).populate({
      path: 'attendees.user',
      select: 'name email avatar_url batch field_of_study' 
    });

    if (!event) return res.status(404).json({ message: "Event not found" });

    // Security: Sirf Organizer ya Admin dekh sakta hai
    if (event.organizer.toString() !== userId && req.user.role !== 'admin') {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(event.attendees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};