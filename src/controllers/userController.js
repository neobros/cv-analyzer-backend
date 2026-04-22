const User = require("../models/User");

async function listUsers(req, res) {
  const users = await User.find().select("-password");
  return res.json(users);
}

async function createUser(req, res) {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordPreview: req.body.password,
    role: "worker",
    status: req.body.status || "active"
  });
  return res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    passwordPreview: user.passwordPreview
  });
}

async function updateUser(req, res) {
  const updates = {};

  if (typeof req.body.name === "string") {
    updates.name = req.body.name.trim();
  }

  if (typeof req.body.status === "string") {
    updates.status = req.body.status;
  }

  if (typeof req.body.password === "string" && req.body.password.trim()) {
    updates.password = req.body.password;
    updates.passwordPreview = req.body.password;
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.role === "super-admin" && updates.status === "inactive") {
    return res.status(400).json({ message: "Super admin cannot be deactivated" });
  }

  Object.assign(user, updates);
  await user.save();

  return res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    passwordPreview: user.passwordPreview
  });
}

module.exports = {
  listUsers,
  createUser,
  updateUser
};
