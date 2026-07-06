const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
// MongoDB  Atlas connection----------------- 
require("./config.js");

const app = express();
const PORT = 8000;

const { User, Complaint, AssignedComplaint, Message } = require("./Schema");
const { createToken, hashPassword, comparePassword } = require("./auth");

app.use(cors());
app.use(express.json());

//----------------- Home ------------------//
app.get("/", (req, res) => {
  res.send("Welcome to ComplaintCare API");
});

//----------------- Signup ------------------//
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({ name, email, password: hashedPassword, userType });
    const saved = await newUser.save();

    const token = createToken({ id: saved._id, email: saved.email, userType: saved.userType });

    res.status(201).json({ user: saved, token });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

//----------------- Login ------------------//
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken({ id: user._id, email: user.email, userType: user.userType });

    res.status(200).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

//----------------- Create Complaint ------------------//
app.post("/complaints", async (req, res) => {
  try {
    const complaint = new Complaint(req.body);
    const saved = await complaint.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Failed to save complaint", error: err.message });
  }
});

//----------------- Get Complaints by User ---------------------------//
app.get("/complaints/:userId", async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.params.userId });
    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving complaints", error: err.message });
  }
});

//----------------- Get All Complaints (Admin View) ---------------//
app.get("/status", async (req, res) => {
  try {
    const complaints = await Complaint.find({});
    res.status(200).json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving all complaints", error: err.message });
  }
});

//----------------- Get All Agents -----------------------//
app.get("/agentUsers", async (req, res) => {
  try {
    const agents = await User.find({ userType: "Agent" });
    res.status(200).json(agents);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving agents", error: err.message });
  }
});

//----------------- Get All Ordinary Users ------------//
app.get("/OrdinaryUsers", async (req, res) => {
  try {
    const users = await User.find({ userType: "Ordinary" });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving users", error: err.message });
  }
});

//----------------- Delete a User ---------------------------//
app.delete("/OrdinaryUsers/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted", deleted });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

//----------------- Update a User (Agent Update) -----------------------//
app.put("/user/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

//----------------- Get Agent by ID -----------------------//
app.get("/agentUsers/:id", async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.userType !== "Agent") {
      return res.status(404).json({ message: "Agent not found" });
    }
    res.status(200).json(agent);
  } catch (err) {
    res.status(500).json({ message: "Error fetching agent", error: err.message });
  }
});

//----------------- Assign Complaint ---------------//
app.post("/assignedComplaints", async (req, res) => {
  try {
    const assignment = new AssignedComplaint(req.body);
    await assignment.save();

    await Complaint.findByIdAndUpdate(req.body.complaintId, {
      status: "In Progress"
    });

    res.status(201).json({ message: "Complaint assigned", assignment });
  } catch (err) {
    res.status(500).json({ message: "Assignment failed", error: err.message });
  }
});

//----------------- Assigned Complaints for Agent --------------------------//
app.get("/assignedComplaints/:agentId", async (req, res) => {
  try {
    const assigned = await AssignedComplaint.find({ agentId: req.params.agentId })
      .populate("complaintId");

    const formatted = assigned.map(entry => ({
      ...entry.complaintId.toObject(),
      assignmentId: entry._id,
      agentId: entry.agentId,
      agentName: entry.agentName,
      assignedStatus: entry.status
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Error fetching assigned complaints", error: err.message });
  }
});

//----------------- Update Complaint Status --------------//
app.put("/updateComplaintStatus/:complaintId", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Complaint.findByIdAndUpdate(
      req.params.complaintId,
      { status },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
});


//----------------- Chat: Send Message ------------------
app.post("/messages", async (req, res) => {
  try {
    const { complaintId, name, message } = req.body;
    const newMessage = new Message({ complaintId, name, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
});

//----------------- Chat, Get Messages for Complaint ------------------
app.get("/messages/:complaintId", async (req, res) => {
  try {
    const messages = await Message.find({ complaintId: req.params.complaintId }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
