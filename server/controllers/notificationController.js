const Notification = require('../models/Notification');
const {
  emitUnreadCount,
  getUnreadCount,
  processEventReminders,
  serializeNotification,
} = require('../utils/notificationService');

exports.getMyNotifications = async (req, res) => {
  try {
    const io = req.app.get('io');
    await processEventReminders(io, req.user.id);

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name avatar_url role')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await getUnreadCount(req.user.id);

    res.json({
      notifications: notifications.map(serializeNotification),
      unreadCount,
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    }).populate('sender', 'name avatar_url role');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    await emitUnreadCount(req.app.get('io'), req.user.id);

    res.json({ notification: serializeNotification(notification) });
  } catch (error) {
    console.error('Notification read error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    await emitUnreadCount(req.app.get('io'), req.user.id);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Notifications read-all error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
