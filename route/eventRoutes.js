/** @format */
const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const jwt = require("jsonwebtoken");
const Attendee = require("../models/Attendee");

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
	const token = req.header("Authorization");
	if (!token) return res.status(401).json({ message: "Unauthorized" });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		res.status(401).json({ message: "Invalid Token" });
	}
};

// 🔹 1. Create an Event (Protected)
router.post("/", authMiddleware, async (req, res) => {
	try {
		const { title, description, date, category, location } = req.body;
		const event = new Event({
			title,
			description,
			date,
			category,
			location,
			createdBy: req.user.id,
		});
		await event.save();
		res.status(201).json(event);
	} catch (error) {
		res.status(500).json({ message: "Error creating event", error });
	}
});

// 🔹 2. Get All Events
router.get("/", async (req, res) => {
	try {
		const events = await Event.find().populate("createdBy", "name");
		res.json(events);
	} catch (error) {
		res.status(500).json({ message: "Error fetching events", error });
	}
});

// 🔹 3. Get a Single Event by ID
router.get("/:id", async (req, res) => {
	try {
		const event = await Event.findById(req.params.id).populate(
			"createdBy",
			"name"
		);
		if (!event) return res.status(404).json({ message: "Event not found" });
		res.json(event);
	} catch (error) {
		res.status(500).json({ message: "Error fetching event", error });
	}
});

// 🔹 4. Update an Event (Protected)
router.put("/:id", authMiddleware, async (req, res) => {
	try {
		const event = await Event.findById(req.params.id);
		if (!event) return res.status(404).json({ message: "Event not found" });

		if (event.createdBy.toString() !== req.user.id)
			return res.status(403).json({ message: "Not authorized" });

		const { title, description, date, category } = req.body;
		event.title = title || event.title;
		event.description = description || event.description;
		event.date = date || event.date;
		event.category = category || event.category;

		await event.save();
		res.json(event);
	} catch (error) {
		res.status(500).json({ message: "Error updating event", error });
	}
});

// 🔹 5. Delete an Event (Protected)
router.delete("/:id", authMiddleware, async (req, res) => {
	try {
		const event = await Event.findById(req.params.id);
		if (!event) return res.status(404).json({ message: "Event not found" });

		if (event.createdBy.toString() !== req.user.id)
			return res.status(403).json({ message: "Not authorized" });

		await event.deleteOne();
		res.json({ message: "Event deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting event", error });
	}
});

// 🔹 6. Join an Event (User Attending)
router.post("/:id/join", authMiddleware, async (req, res) => {
	try {
		const event = await Event.findById(req.params.id);
		if (!event) return res.status(404).json({ message: "Event not found" });

		const alreadyJoined = await Attendee.findOne({
			user: req.user.id,
			event: req.params.id,
		});
		if (alreadyJoined)
			return res.status(400).json({ message: "Already joined this event" });

		const attendee = new Attendee({ user: req.user.id, event: req.params.id });
		await attendee.save();

		event.attendees.push(req.user.id);
		await event.save();

		res.json({ message: "Successfully joined the event" });
	} catch (error) {
		res.status(500).json({ message: "Error joining event", error });
	}
});

module.exports = router;
