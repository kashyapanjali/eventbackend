/** @format */

const mongoose = require("mongoose");

const AttendeeSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
	joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Attendee", AttendeeSchema);
