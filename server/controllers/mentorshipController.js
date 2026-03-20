const Mentorship = require('../models/Mentorship');
const MentorshipSession = require('../models/MentorshipSession');
const MentorshipNote = require('../models/MentorshipNote');
const MentorshipProgress = require('../models/MentorshipProgress');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');

const isTeacher = async (userId) => {
  const user = await User.findById(userId).select('role name');
  return user?.role === 'teacher' ? user : null;
};

const isJunior = async (userId) => {
  const user = await User.findById(userId).select('role name');
  return user?.role === 'junior' ? user : null;
};

const ensureMentorOwnership = async (mentorshipId, mentorId) => {
  const mentorship = await Mentorship.findById(mentorshipId);
  if (!mentorship) return { error: { status: 404, message: 'Mentorship not found' } };
  if (mentorship.mentor.toString() !== String(mentorId)) {
    return { error: { status: 401, message: 'Not authorized' } };
  }
  return { mentorship };
};

const ensureMentorshipAccess = async (mentorshipId, userId) => {
  const mentorship = await Mentorship.findById(mentorshipId);
  if (!mentorship) return { error: { status: 404, message: 'Mentorship not found' } };

  const isMentor = mentorship.mentor.toString() === String(userId);
  const isMentee = mentorship.mentee.toString() === String(userId);

  if (!isMentor && !isMentee) {
    return { error: { status: 401, message: 'Not authorized' } };
  }

  return { mentorship, role: isMentor ? 'mentor' : 'mentee' };
};

exports.requestMentorship = async (req, res) => {
  try {
    const menteeId = req.user.id;
    const { mentorId } = req.body;

    if (!mentorId) {
      return res.status(400).json({ message: 'mentorId is required' });
    }
    if (String(mentorId) === String(menteeId)) {
      return res.status(400).json({ message: 'Cannot request mentorship from yourself' });
    }

    const mentee = await isJunior(menteeId);
    if (!mentee) return res.status(403).json({ message: 'Only juniors can request mentorship' });

    const mentor = await isTeacher(mentorId);
    if (!mentor) return res.status(400).json({ message: 'Selected mentor is not a teacher' });

    const existing = await Mentorship.findOne({ mentor: mentorId, mentee: menteeId });
    if (existing) {
      return res.json({ mentorship: existing, created: false });
    }

    const mentorship = await Mentorship.create({
      mentor: mentorId,
      mentee: menteeId,
      status: 'pending',
      requestedAt: new Date(),
    });

    await createNotification({
      io: req.app.get('io'),
      recipient: mentorId,
      sender: menteeId,
      type: 'mentorship_request',
      title: 'New mentorship request',
      message: `${mentee.name || 'A junior'} requested mentorship.`,
      link: '/mentorship',
      metadata: { mentorshipId: mentorship._id.toString(), menteeId },
    });

    res.json({ mentorship, created: true });
  } catch (error) {
    if (error?.code === 11000) {
      const mentorship = await Mentorship.findOne({ mentor: req.body.mentorId, mentee: req.user.id });
      return res.json({ mentorship, created: false });
    }
    console.error('Mentorship request error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getMyMentorship = async (req, res) => {
  try {
    const userId = req.user.id;

    // Prefer active mentorship (so juniors see sessions/notes correctly),
    // then pending, then most recent of any status.
    let mentorship = await Mentorship.findOne({ mentee: userId, status: 'active' })
      .populate('mentor', 'name role avatar_url designation company')
      .sort({ startedAt: -1, lastActivityAt: -1, updatedAt: -1 });

    if (!mentorship) {
      mentorship = await Mentorship.findOne({ mentee: userId, status: 'pending' })
        .populate('mentor', 'name role avatar_url designation company')
        .sort({ requestedAt: -1, createdAt: -1 });
    }

    if (!mentorship) {
      mentorship = await Mentorship.findOne({ mentee: userId })
        .populate('mentor', 'name role avatar_url designation company')
        .sort({ updatedAt: -1, createdAt: -1 });
    }

    res.json({ mentorship });
  } catch (error) {
    console.error('My mentorship fetch error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const mentor = await isTeacher(mentorId);
    if (!mentor) return res.status(403).json({ message: 'Only teachers can view requests' });

    const requests = await Mentorship.find({ mentor: mentorId, status: 'pending' })
      .populate('mentee', 'name role avatar_url designation batch field_of_study')
      .sort({ requestedAt: -1, createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    console.error('Mentorship requests fetch error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { mentorshipId, action } = req.body;

    const mentor = await isTeacher(mentorId);
    if (!mentor) return res.status(403).json({ message: 'Only teachers can respond to requests' });
    if (!mentorshipId || !action) return res.status(400).json({ message: 'mentorshipId and action are required' });
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' });

    const { mentorship, error } = await ensureMentorOwnership(mentorshipId, mentorId);
    if (error) return res.status(error.status).json({ message: error.message });

    if (mentorship.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    mentorship.respondedAt = new Date();

    if (action === 'reject') {
      mentorship.status = 'rejected';
      await mentorship.save();

      await createNotification({
        io: req.app.get('io'),
        recipient: mentorship.mentee,
        sender: mentorId,
        type: 'mentorship_rejected',
        title: 'Mentorship request rejected',
        message: `${mentor.name || 'Teacher'} rejected your mentorship request.`,
        link: '/mentorship',
        metadata: { mentorshipId: mentorship._id.toString() },
      });

      return res.json({ mentorship });
    }

    // approve
    mentorship.status = 'active';
    mentorship.startedAt = new Date();
    mentorship.lastActivityAt = new Date();
    await mentorship.save();

    await MentorshipProgress.updateOne(
      { mentorship: mentorship._id },
      { $setOnInsert: { mentorship: mentorship._id, goals: [], overallPercent: 0 } },
      { upsert: true }
    );

    await createNotification({
      io: req.app.get('io'),
      recipient: mentorship.mentee,
      sender: mentorId,
      type: 'mentorship_approved',
      title: 'Mentorship request approved',
      message: `${mentor.name || 'Teacher'} approved your mentorship request.`,
      link: '/messages',
      metadata: { mentorshipId: mentorship._id.toString(), mentorId },
    });

    res.json({ mentorship });
  } catch (error) {
    console.error('Mentorship respond error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getMentees = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const mentor = await isTeacher(mentorId);
    if (!mentor) return res.status(403).json({ message: 'Only teachers can view mentees' });

    const mentees = await Mentorship.find({ mentor: mentorId, status: 'active' })
      .populate('mentee', 'name role avatar_url designation batch field_of_study')
      .sort({ lastActivityAt: -1, startedAt: -1, createdAt: -1 });

    res.json({ mentees });
  } catch (error) {
    console.error('Mentees fetch error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getMentorshipOverview = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { mentorshipId } = req.params;

    const mentor = await isTeacher(mentorId);
    if (!mentor) return res.status(403).json({ message: 'Only teachers can view mentorship overview' });

    const { mentorship, error } = await ensureMentorOwnership(mentorshipId, mentorId);
    if (error) return res.status(error.status).json({ message: error.message });

    const populated = await Mentorship.findById(mentorshipId)
      .populate('mentee', 'name role avatar_url designation batch field_of_study')
      .populate('mentor', 'name role avatar_url designation company');

    const progress = await MentorshipProgress.findOne({ mentorship: mentorshipId });

    res.json({ mentorship: populated, progress });
  } catch (error) {
    console.error('Mentorship overview error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createSession = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { mentorshipId } = req.params;
    const { summary, occurredAt, linkedMessageIds } = req.body;

    const mentor = await isTeacher(mentorId);
    if (!mentor) return res.status(403).json({ message: 'Only teachers can create sessions' });

    const { mentorship, error } = await ensureMentorOwnership(mentorshipId, mentorId);
    if (error) return res.status(error.status).json({ message: error.message });
    if (mentorship.status !== 'active') return res.status(400).json({ message: 'Mentorship is not active' });
    if (!summary?.trim()) return res.status(400).json({ message: 'summary is required' });

    const session = await MentorshipSession.create({
      mentorship: mentorship._id,
      createdBy: mentorId,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      summary: summary.trim(),
      linkedMessageIds: Array.isArray(linkedMessageIds) ? linkedMessageIds : [],
    });

    mentorship.lastActivityAt = new Date();
    await mentorship.save();

    res.json({ session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mentorshipId } = req.params;

    const { error } = await ensureMentorshipAccess(mentorshipId, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    const sessions = await MentorshipSession.find({ mentorship: mentorshipId })
      .sort({ occurredAt: -1, createdAt: -1 })
      .limit(50);

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createNote = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { mentorshipId } = req.params;
    const { content, visibleToMentee } = req.body;

    const mentor = await isTeacher(mentorId);
    if (!mentor) return res.status(403).json({ message: 'Only teachers can create notes' });

    const { mentorship, error } = await ensureMentorOwnership(mentorshipId, mentorId);
    if (error) return res.status(error.status).json({ message: error.message });
    if (!content?.trim()) return res.status(400).json({ message: 'content is required' });

    const note = await MentorshipNote.create({
      mentorship: mentorship._id,
      author: mentorId,
      content: content.trim(),
      visibleToMentee: visibleToMentee !== false,
    });

    mentorship.lastActivityAt = new Date();
    await mentorship.save();

    res.json({ note });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mentorshipId } = req.params;

    const { error, role } = await ensureMentorshipAccess(mentorshipId, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    const query = { mentorship: mentorshipId };
    if (role === 'mentee') {
      query.visibleToMentee = true;
    }

    const notes = await MentorshipNote.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mentorshipId } = req.params;

    const { mentorship, error } = await ensureMentorshipAccess(mentorshipId, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    const progress = await MentorshipProgress.findOne({ mentorship: mentorship._id });
    res.json({ progress: progress || { mentorship: mentorship._id, goals: [], overallPercent: 0 } });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { mentorshipId } = req.params;
    const { goals, overallPercent } = req.body;

    const mentor = await isTeacher(mentorId);
    if (!mentor) return res.status(403).json({ message: 'Only teachers can update progress' });

    const { mentorship, error } = await ensureMentorOwnership(mentorshipId, mentorId);
    if (error) return res.status(error.status).json({ message: error.message });

    const nextGoals = Array.isArray(goals) ? goals.map((g) => ({
      title: String(g?.title || '').trim(),
      status: ['todo', 'in_progress', 'done'].includes(g?.status) ? g.status : 'todo',
      percent: Number.isFinite(Number(g?.percent)) ? Math.max(0, Math.min(100, Number(g.percent))) : 0,
      updatedAt: new Date(),
    })).filter((g) => g.title) : [];

    const nextOverall = Number.isFinite(Number(overallPercent))
      ? Math.max(0, Math.min(100, Number(overallPercent)))
      : (nextGoals.length ? Math.round(nextGoals.reduce((sum, g) => sum + g.percent, 0) / nextGoals.length) : 0);

    const progress = await MentorshipProgress.findOneAndUpdate(
      { mentorship: mentorship._id },
      { $set: { goals: nextGoals, overallPercent: nextOverall } },
      { new: true, upsert: true }
    );

    mentorship.lastActivityAt = new Date();
    await mentorship.save();

    res.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

