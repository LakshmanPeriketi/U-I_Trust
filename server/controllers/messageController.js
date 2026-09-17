import Message from '../models/Message.js';
import Match from '../models/Match.js';

// GET /api/messages/:matchId
export const getMessages = async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const isDonor = match.donorId.toString() === req.user._id.toString();
    const isNgo = match.ngoId.toString() === req.user._id.toString();
    if (!isDonor && !isNgo && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access messages for this match' });
    }

    const messages = await Message.find({ matchId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch messages' });
  }
};

// POST /api/messages & POST /api/messages/:matchId
export const sendMessage = async (req, res) => {
  try {
    const matchId = req.params.matchId || req.body.matchId;
    const { content } = req.body;

    if (!matchId) {
      return res.status(400).json({ message: 'matchId is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const isDonor = match.donorId.toString() === req.user._id.toString();
    const isNgo = match.ngoId.toString() === req.user._id.toString();
    if (!isDonor && !isNgo && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to send messages for this match' });
    }

    const message = await Message.create({
      matchId,
      senderId: req.user._id,
      content: content.trim(),
    });

    const populated = await Message.findById(message._id).populate('senderId', 'name role');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to send message' });
  }
};

