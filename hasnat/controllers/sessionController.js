const sessionService = require('../services/sessionService');

const createSession = async (req, res) => {
  try {

    console.log('req.user:', req.user);

    const { userId } = req.user;
    const session = await sessionService.createSession(userId);
    res.status(201).json({ sessionCode: session.sessionCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const joinSession = async (req, res) => {
  try {
    const { sessionCode } = req.body;
    const { userId } = req.user;
    await sessionService.joinSession(sessionCode, userId);
    res.status(200).json({ message: 'Successfully joined the session' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { createSession, joinSession };