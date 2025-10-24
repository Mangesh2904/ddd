import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  companyName: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true 
  },
  guidance: { 
    type: String, 
    required: true 
  },
  resources: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Index for better query performance
placementSchema.index({ userId: 1, createdAt: -1 });
placementSchema.index({ companyName: 1 });
placementSchema.index({ role: 1 });

export default mongoose.model('Placement', placementSchema);