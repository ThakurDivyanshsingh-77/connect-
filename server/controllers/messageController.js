const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');

// 1. Send Message (Updated for Attachments)
exports.sendMessage = async (req, res) => {
  try {
    // 👇 UPDATE: Ab hum 'attachment' bhi receive kar rahe hain
    const { recipientId, content, attachment } = req.body;
    const senderId = req.user.id;

    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      content,     
      attachment   // 👇 Attachment data database me save hoga
    });

    await newMessage.save();
    res.json(newMessage);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get Chat History (Specific User)
exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params; 
    const myId = req.user.id; 

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: userId },
        { sender: userId, recipient: myId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Get Conversations List (Inbox) - Updated Logic
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(currentUserId) },
            { recipient: new mongoose.Types.ObjectId(currentUserId) }
          ]
        }
      },
      {
        $sort: { createdAt: -1 } 
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(currentUserId)] },
              "$recipient",
              "$sender"
            ]
          },
          lastMessageContent: { $first: "$content" },      // Text content
          lastMessageAttachment: { $first: "$attachment" }, // 👇 Attachment info
          lastMessageTime: { $first: "$createdAt" },
          isRead: { $first: "$isRead" },
          sender: { $first: "$sender" }
        }
      }
    ]);

    // Populate Partner Details
    const populatedConversations = await User.populate(conversations, {
      path: "_id",
      select: "name avatar_url"
    });

    const result = populatedConversations
      .map(conv => {
         // Agar user delete ho chuka hai, to null return karein
         if (!conv._id) return null;

         const isUnread = !conv.isRead && conv.sender.toString() !== currentUserId;
         
         // 👇 Logic: Agar text nahi hai to 'Attachment' dikhao
         let displayMessage = conv.lastMessageContent;
         if (!displayMessage && conv.lastMessageAttachment) {
             displayMessage = "📎 Attachment"; 
         }

         return {
          partnerId: conv._id._id,
          partnerName: conv._id.name,
          partnerAvatar: conv._id.avatar_url,
          lastMessage: displayMessage || "Sent a message", 
          lastMessageTime: conv.lastMessageTime,
          unreadCount: isUnread ? 1 : 0 
        };
      })
      // 👇 FIX: Null values hatao AUR Khud ko list se filter karo
      .filter(conv => conv !== null && conv.partnerId.toString() !== currentUserId);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};