const Event = require('../models/Event');
const Notification = require('../models/Notification');

const SENDER_FIELDS = 'name avatar_url role';

const serializeNotification = (notification) => ({
  _id: notification._id.toString(),
  recipient: notification.recipient?.toString?.() || notification.recipient,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link || '/',
  metadata: notification.metadata || {},
  isRead: notification.isRead,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
  sender: notification.sender && typeof notification.sender === 'object' ? {
    _id: notification.sender._id?.toString?.() || notification.sender._id,
    name: notification.sender.name,
    avatar_url: notification.sender.avatar_url || null,
    role: notification.sender.role || null,
  } : null,
});

const getUnreadCount = async (recipientId) => (
  Notification.countDocuments({ recipient: recipientId, isRead: false })
);

const emitUnreadCount = async (io, recipientId) => {
  if (!io || !recipientId) return;

  const unreadCount = await getUnreadCount(recipientId);
  io.to(String(recipientId)).emit('notification unread count', unreadCount);
};

const emitNotification = async (io, recipientId, notification) => {
  if (!io || !recipientId || !notification) return;

  io.to(String(recipientId)).emit('notification received', serializeNotification(notification));
  await emitUnreadCount(io, recipientId);
};

const createNotification = async ({
  io,
  recipient,
  sender = null,
  type,
  title,
  message,
  link = '/',
  metadata = {},
  dedupeKey = null,
}) => {
  if (!recipient) {
    return { notification: null, created: false };
  }

  if (dedupeKey) {
    const existing = await Notification.findOne({ dedupeKey }).populate('sender', SENDER_FIELDS);
    if (existing) {
      return { notification: existing, created: false };
    }
  }

  const payload = {
    recipient,
    sender,
    type,
    title,
    message,
    link,
    metadata,
  };

  if (dedupeKey) {
    payload.dedupeKey = dedupeKey;
  }

  let notification = await Notification.create(payload);

  notification = await Notification.findById(notification._id).populate('sender', SENDER_FIELDS);
  await emitNotification(io, recipient, notification);

  return { notification, created: true };
};

const processEventReminders = async (io, recipientId = null) => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const query = {
    date: { $gte: now, $lte: next24Hours },
    'attendees.0': { $exists: true },
  };

  if (recipientId) {
    query['attendees.user'] = recipientId;
  }

  const events = await Event.find(query)
    .populate('organizer', 'name')
    .populate('attendees.user', 'name');

  for (const event of events) {
    let changed = false;

    for (const attendee of event.attendees) {
      const attendeeUserId = attendee.user?._id?.toString?.() || attendee.user?.toString?.();
      if (!attendeeUserId) continue;
      if (recipientId && attendeeUserId !== String(recipientId)) continue;
      if (attendee.reminderSentAt) continue;

      const eventDate = new Date(event.date);
      const readableDate = eventDate.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      const { created } = await createNotification({
        io,
        recipient: attendeeUserId,
        sender: event.organizer?._id || null,
        type: 'event_reminder',
        title: 'Upcoming event reminder',
        message: `${event.title} starts on ${readableDate} at ${event.location}.`,
        link: '/events',
        metadata: {
          eventId: event._id.toString(),
          eventTitle: event.title,
          eventDate: event.date,
        },
        dedupeKey: `event-reminder:${event._id}:${attendeeUserId}`,
      });

      if (created) {
        attendee.reminderSentAt = new Date();
        changed = true;
      }
    }

    if (changed) {
      await event.save();
    }
  }
};

module.exports = {
  createNotification,
  emitUnreadCount,
  getUnreadCount,
  processEventReminders,
  serializeNotification,
};
