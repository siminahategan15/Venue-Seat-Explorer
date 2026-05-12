const express = require("express");
const bcrypt = require("bcryptjs");
const admin = require("../config/firebaseAdmin");
const User = require("../models/User");

const router = express.Router();

async function ensureBackendUser(firebaseUser, profile = {}) {
  const update = {
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email,
    username:
      profile.username || firebaseUser.email?.split("@")[0] || firebaseUser.uid,
    firstName:
      profile.firstName || firebaseUser.displayName?.split(" ")[0] || "User",
    lastName: profile.lastName || firebaseUser.displayName?.split(" ")[1] || "",
  };

  if (profile.passwordHash) {
    update.password = profile.passwordHash;
  }

  return User.findOneAndUpdate({ firebaseUid: firebaseUser.uid }, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
}

router.post("/check-availability", async (req, res) => {
  try {
    const { username, email } = req.body;
    const errors = {};

    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        errors.username = "Username is already taken";
      }
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        errors.email = "Email is already in use";
      }
    }

    return res.json({ available: Object.keys(errors).length === 0, errors });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const nameRegex = /^[A-Z][a-z]{2,}$/;
    if (!nameRegex.test(firstName)) {
      return res.status(400).json({
        message:
          "First name must start with uppercase and be longer than 3 letters.",
      });
    }
    if (!nameRegex.test(lastName)) {
      return res.status(400).json({
        message:
          "Last name must start with uppercase and be longer than 3 letters.",
      });
    }

    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);

    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use." });
    }

    if (existingUsername) {
      return res.status(409).json({ message: "Username already in use." });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const passwordHash = await bcrypt.hash(password, 10);

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    const user = await User.create({
      firebaseUid: userRecord.uid,
      email,
      username,
      firstName,
      lastName,
      password: passwordHash,
      role,
    });

    return res.status(201).json({
      message:
        "User created successfully. Please verify your email before login.",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID token is required." });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);

    if (!decoded.email_verified) {
      return res.status(401).json({
        message: "Email must be verified before logging in.",
      });
    }

    const user = await ensureBackendUser(decoded);
    return res.json(user);
  } catch (error) {
    return res.status(401).json({ message: "Login failed." });
  }
});

module.exports = router;
