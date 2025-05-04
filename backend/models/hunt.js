// models/hunt.js
const mongoose = require('mongoose');

const huntSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  created_at: { type: Date, required: true, default: Date.now },
  tags: { type: [String], default: [] },
  imageUrl: { type: String, default: "" },
  sourceUrl: { type: String, required: true },
  status: { type: String, enum: ['active', 'completed', 'expired'], default: 'active' }
}, { timestamps: true });

// 인덱스 생성
huntSchema.index({ sourceUrl: 1 }, { unique: true });
huntSchema.index({ created_at: -1 });
huntSchema.index({ tags: 1 });

const Hunt = mongoose.model('Hunt', huntSchema, 'hunt');

module.exports = Hunt;