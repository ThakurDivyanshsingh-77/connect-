const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');

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

    const sender = await User.findById(senderId).select('name');
    const previewText = content?.trim()
      ? content.trim().slice(0, 80)
      : 'sent you an attachment';

    await createNotification({
      io: req.app.get('io'),
      recipient: recipientId,
      sender: senderId,
      type: 'message',
      title: `${sender?.name || 'Someone'} sent you a message`,
      message: previewText,
      link: '/messages',
      metadata: {
        partnerId: senderId,
        messageId: newMessage._id.toString(),
      },
    });

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

// 4. Get Room Messages
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).populate('sender', 'name avatar_url role').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. Send Room Message (Fallback)
exports.sendRoomMessage = async (req, res) => {
  try {
    const { roomId, content, attachment, messageType } = req.body;
    const senderId = req.user.id;
    const newMessage = new Message({ sender: senderId, roomId, content, attachment, messageType: messageType || 'text' });
    await newMessage.save();
    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name avatar_url role');
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. Toggle Pin Message
exports.togglePinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const Room = require('../models/Room');
    const room = await Room.findById(message.roomId);
    
    // Check if user is admin, teacher, global admin, or the room creator.
    // Allow if they are room creator OR global admin.
    const isRoomCreator = room && room.createdBy && room.createdBy.toString() === req.user.id;
    const isAppAdmin = req.user.role === 'admin' || req.user.role === 'teacher';
    const isRoomAdmin = room && room.admins && room.admins.includes(req.user.id);
    
    if (room && (isRoomCreator || isAppAdmin || isRoomAdmin)) {
      message.isPinned = !message.isPinned;
      await message.save();
      
      const io = req.app.get('io');
      io.to(message.roomId.toString()).emit('messagePinned', { messageId: message._id, isPinned: message.isPinned });

      res.json(message);
    } else {
      res.status(403).json({ message: "Not authorized to pin messages in this room" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 7. Toggle Reaction
exports.toggleReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);

    if (reactionIndex > -1) {
      const userIndex = message.reactions[reactionIndex].users.indexOf(userId);
      if (userIndex > -1) {
        message.reactions[reactionIndex].users.splice(userIndex, 1);
        if (message.reactions[reactionIndex].users.length === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      } else {
        message.reactions[reactionIndex].users.push(userId);
      }
    } else {
      message.reactions.push({ emoji, users: [userId] });
    }

    await message.save();
    
    const io = req.app.get('io');
    if (message.roomId) {
        io.to(message.roomId.toString()).emit('messageReacted', { messageId: message._id, reactions: message.reactions });
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
