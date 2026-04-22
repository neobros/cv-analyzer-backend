const User = require("../models/User");
const generateToken = require("../utils/generateToken");

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (user.status !== "active") {
    return res.status(403).json({ message: "This account is inactive. Please contact super admin." });
  }

  return res.json({
    token: generateToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}

async function getMe(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  login,
  getMe
};
