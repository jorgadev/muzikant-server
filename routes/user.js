const router = require("express").Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../lib/validation");
const { clearUserData } = require("../lib/functions");

router.get("/", async (req, res) => {
  const userToken = req.header("auth-token");
  const decodedToken = jwt.verify(userToken, process.env.TOKEN_SECRET);
  const userFromDB = await User.findOne({ _id: decodedToken._id });
  const user = clearUserData(userFromDB);
  res.send(user);
});

// Register
router.post("/register", async (req, res) => {
  // Data validation
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // If user already in the database
  const usernameExists = await User.findOne({ username: req.body.username });
  if (usernameExists) {
    return res.status(400).send("Username already exists!");
  }

  // If user already in the database
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) {
    return res.status(400).send("Email already exists!");
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create a new user
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    const userData = clearUserData(savedUser);

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
    res.header("auth-token", token).send({ token, user: userData });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  // Data validation
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // If user with this email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("Email is not found!");
  }

  // If password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).send("Invalid password!");
  }

  const userData = clearUserData(user);

  // Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send({ token, user: userData });
});

// Update user coins
router.post("/update-coins", async (req, res) => {
  const user = await User.findOne({ _id: req.body.id });
  if (!user) {
    return res.status(400).send("User not found!");
  }

  user.coins = user.coins + req.body.coins;

  try {
    const savedUser = await user.save();
    const userData = clearUserData(savedUser);

    res.send({ user: userData });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update user character
router.post("/update-character", async (req, res) => {
  const user = await User.findOne({ _id: req.body.id });
  if (!user) {
    return res.status(400).send("User not found!");
  }

  if (![0, 1, 2].includes(req.body.character)) {
    return res.status(400).send("Character index incorrect!");
  }

  user.character = req.body.character;

  try {
    const savedUser = await user.save();
    const userData = clearUserData(savedUser);

    res.send({ user: userData });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
