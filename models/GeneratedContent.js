const mongoose = require('mongoose');
const { Schema } = mongoose;

const GeneratedContentSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'itinerary',
      'cost-estimator',
      'best-time',
      'packing-list',
      'photo-spots',
      'adventure-planner',
      'jet-lag',
      'currency-converter',
      'food-finder',
      'travel-hacks'
    ]
  },
  input: {
    type: Schema.Types.Mixed,
    required: true
  },
  result: {
    type: Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient caching queries
GeneratedContentSchema.index({ userId: 1, type: 1, input: 1 });

module.exports = mongoose.model('GeneratedContent', GeneratedContentSchema);
