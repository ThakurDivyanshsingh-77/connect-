const Connection = require('../models/Connection');
const User = require('../models/User'); // 1. User Model Import kiya

// 1. Send Connection Request
exports.sendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user.id;

    // Khud ko request bhejne se rokein
    if (requesterId === recipientId) {
      return res.status(400).json({ message: "Cannot connect to yourself" });
    }

    // Check karein ki pehle se request hai ya nahi
    const existing = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existing) {
      if (existing.status === 'pending') {
         return res.status(400).json({ message: "Request already pending" });
      }
      if (existing.status === 'accepted') {
         return res.status(400).json({ message: "Already connected" });
      }
    }

    // Nayi request banayein
    const newConnection = new Connection({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    await newConnection.save();
    res.json({ message: "Request Sent Successfully", connection: newConnection });

  } catch (error) {
    console.error("Connection Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get My Connections (Frontend par status dikhane ke liye)
exports.getMyConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    // Wo sabhi connections dhunde jahan main ya to bhejne wala hu ya paane wala
    const connections = await Connection.find({
      $or: [{ requester: userId }, { recipient: userId }]
    })
    // Saamne wale ki details bhi saath mein layein
    .populate('requester', 'name role avatar_url company designation batch field_of_study')
    .populate('recipient', 'name role avatar_url company designation batch field_of_study');

    res.json(connections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Accept or Reject Request (UPDATED WITH POINTS)
exports.updateStatus = async (req, res) => {
  try {
    const { connectionId, status } = req.body; // status: 'accepted' ya 'rejected'
    
    const connection = await Connection.findById(connectionId);
    
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }
    
    // Suraksha: Sirf wahi accept kar sakta hai jise request bheji gayi thi
    if (connection.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to accept this request" });
    }

    if (status === 'rejected') {
      // Agar reject kiya, to request delete kar do
      await Connection.findByIdAndDelete(connectionId);
      return res.json({ message: "Connection Rejected" });
    }

    // Agar Accept kiya
    connection.status = status;
    await connection.save();

    // 👇 ADD 10 POINTS TO BOTH USERS 👇
    if (status === 'accepted') {
        // 1. Jisko request mili (Recipient - Aap)
        await User.findByIdAndUpdate(connection.recipient, { $inc: { points: 10 } });
        
        // 2. Jisne request bheji (Requester)
        await User.findByIdAndUpdate(connection.requester, { $inc: { points: 10 } });
    }
    // ---------------------------------

    res.json({ message: `Connection ${status} (+10 Points to both)`, connection });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};