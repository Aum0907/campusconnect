const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models'); // Import your models
const User = db.User;

exports.register = async (req, res) => {
  const { username, email, password, program, year, interests } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (user) return res.status(400).json({ msg: 'User already exists with that email' });
    user = await User.findOne({ where: { username } });
    if (user) return res.status(400).json({ msg: 'Username already taken' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({ username, email, password: hashedPassword, program, year: year, interests: interests || '' });
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ msg: 'User registered successfully', token });
    });
  } catch (err) { console.error(err.message); res.status(500).send('Server error during registration'); }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ msg: 'Logged in successfully', token });
    });
  } catch (err) { console.error(err.message); res.status(500).send('Server error during login'); }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) { console.error(err.message); res.status(500).send('Server error fetching profile'); }
};

exports.updateProfile = async (req, res) => {
    const { username, email, program, year, interests } = req.body;
    try {
        let user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ where: { email } });
            if (existingEmail) return res.status(400).json({ msg: 'Email already in use' });
        }
        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ where: { username } });
            if (existingUsername) return res.status(400).json({ msg: 'Username already taken' });
        }
        user.username = username || user.username;
        user.email = email || user.email;
        user.program = program || user.program;
        user.year = year ? parseInt(year) : user.year;
        user.interests = interests || user.interests;
        await user.save();
        res.json({ msg: 'Profile updated successfully', user: user });
    } catch (err) { console.error(err.message); res.status(500).send('Server error updating profile'); }
};