/** @format */

const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
	title: String,
	description: String,
	date: Date,
	category: String,
	location: String,
	attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Event", EventSchema);
