const Room = require('../models/Room');
const Event = require('../models/Event');

exports.createRoom = async (req, res) => {
  try {
    const { name, description, type, isPrivate, maxMembers, eventId } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    // Role checks
    if (type === 'teacher' && role !== 'teacher' && role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers or admins can create teacher rooms' });
    }
    if (type === 'senior' && role !== 'senior' && role !== 'admin') {
      return res.status(403).json({ message: 'Only seniors or admins can create senior rooms' });
    }
    if (type === 'admin' && role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create admin rooms' });
    }

    const newRoom = new Room({
      name,
      description,
      type,
      createdBy: userId,
      admins: [userId],
      members: [userId],
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || null,
      eventId: eventId || null
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const type = req.query.type;
    const userId = req.user.id;
    const role = req.user.role;

    const query = {};
    if (type) query.type = type;

    // Based on requirements, admins can see all, others see public + their private rooms
    if (role !== 'admin') {
      query.$or = [
        { isPrivate: false },
        { members: userId }
      ];
    }

    const rooms = await Room.find(query).populate('createdBy', 'name avatar_url').sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getRoomDetails = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('admins', 'name avatar_url role headline')
      .populate('members', 'name avatar_url role headline');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    const userId = req.user.id;
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.members.includes(userId)) {
      return res.status(400).json({ message: 'Already joined' });
    }
    if (room.maxMembers && room.members.length >= room.maxMembers) {
      return res.status(400).json({ message: 'Room is full' });
    }

    room.members.push(userId);
    await room.save();
    res.json({ message: "Joined successfully", room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    const userId = req.user.id;
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.members = room.members.filter(m => m.toString() !== userId.toString());
    await room.save();
    res.json({ message: "Left successfully", room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    const userId = req.user.id;
    const role = req.user.role;
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (role !== 'admin' && !room.admins.includes(userId)) {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }

    await room.deleteOne();
    res.json({ message: "Room deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.inviteToRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    const { targetUserId } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Ensure user is Room Admin or Global Admin
    const isRoomAdmin = room.admins.includes(userId) || room.createdBy.toString() === userId;
    if (!isRoomAdmin && role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can invite members' });
    }

    if (room.members.includes(targetUserId)) {
      return res.status(400).json({ message: 'User is already in the room' });
    }

    room.members.push(targetUserId);
    await room.save();

    res.json({ message: "User invited successfully", room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
