/** @format */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// User Registration
router.post("/register", async (req, res) => {
	const { name, email, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);
	const newUser = new User({ name, email, password: hashedPassword });
	await newUser.save();
	res.status(201).json({ message: "User registered successfully" });
});

// User Login
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });
	if (!user || !(await bcrypt.compare(password, user.password))) {
		return res.status(400).json({ message: "Invalid credentials" });
	}
	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "1d",
	});
	res.json({ token, user });
});

module.exports = router;
