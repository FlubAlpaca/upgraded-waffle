const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const { startSession, getNextQuestion, submitAnswer, getSession, testGen, generateWill } = require("../services/engine");

// Start a new intake
router.post("/intake/start", async (req, res) => {
  try {
    const session = await startSession();
    const question = await getNextQuestion(session.id);
    return res.json({ sessionId: session.id, question });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to start intake" });
  }
});

// Submit an answer to the last question
router.post("/intake/answer", async (req, res) => {
  const { sessionId, userText } = req.body || {};
  if (!sessionId || typeof userText !== "string") return res.status(400).json({ error: "sessionId and userText required" });

  try {
    const out = await submitAnswer(sessionId, userText);
    return res.json({ question: out });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to process answer" });
  }
});

// Debug: read current session
router.get("/intake/state/:id", async (req, res) => {
  try {
    const s = await getSession(req.params.id);
    if (!s) return res.status(404).json({ error: "Session not found" });
    res.json(s);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to read session" });
  }
});

router.get("/intake/retrieve/:id", async (req, res) => {
  const filePath = path.join(__dirname, "..", "out", "will.doc");
  
  if(!fs.existsSync(filePath)){
    await generateWill(req.params.id);
  }

  res.setHeader("Content-Type", "application/msword");
  res.setHeader("Content-Disposition", 'inline; filename="will.doc"'); 
  res.sendFile(filePath);
});

router.get("/intake/test/:number", async (req, res) => {
  testGen(req.params.number);

  res.send(1);
});

module.exports = router;
