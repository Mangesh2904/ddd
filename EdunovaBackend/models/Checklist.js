import mongoose from 'mongoose';

const checklistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  fullContent: { type: String },  // Store full details when available
  type: { type: String, enum: ['chat', 'roadmap', 'general'], default: 'general' },
  sourceId: { type: mongoose.Schema.Types.ObjectId }, // Reference to original roadmap/chat
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Checklist', checklistSchema);

