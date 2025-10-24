import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  duration: { type: Number, required: true },  // Number of weeks
  requestedDuration: { type: Number },  // Original requested duration
  content: { type: String, required: true },
  structuredRoadmap: { type: Object },  // Structured roadmap data from Gemini
  
  // Feedback fields
  feedback: {
    rating: { type: Number, min: 1, max: 5 },  // 1-5 star rating
    helpful: { type: Boolean },  // Was it helpful?
    learningPace: { type: String, enum: ['too_fast', 'just_right', 'too_slow'] },
    tooBasic: { type: Boolean },
    tooAdvanced: { type: Boolean },
    comments: { type: String },
    completedWeeks: { type: Number, default: 0 },  // How many weeks completed
    submittedAt: { type: Date }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp on save
roadmapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Roadmap', roadmapSchema);