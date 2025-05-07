// models/hunt.js
const mongoose = require('mongoose');

const huntSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '제목을 입력해주세요'],
    trim: true
  },
  content: {
    type: String,
    required: [true, '내용을 입력해주세요'],
    trim: true
  },
  author: {
    type: String,
    required: [true, '작성자 정보가 필요합니다'],
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    required: [true, '카테고리를 선택해주세요']
  },
  condition: {
    type: String,
    required: [true, '상태를 선택해주세요']
  },
  price: {
    type: Number,
    required: [true, '가격을 입력해주세요']
  },
  imageUrl: {
    type: String,
    default: ""
  },
  postNumber: {
    type: Number,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Everytime 마이그레이션을 위한 새 필드
  isFromEverytime: {
    type: Boolean,
    default: false
  },
  everytimeUrl: {
    type: String,
    sparse: true,
    unique: true
  },
  everytimeId: {
    type: mongoose.Schema.Types.ObjectId,
    sparse: true,
    unique: true
  }
}, { 
  timestamps: false, // timestamps 옵션 비활성화
  versionKey: false  // __v 필드 비활성화
});

// 기존 인덱스
huntSchema.index({ title: 'text', content: 'text' });
huntSchema.index({ created_at: -1 });
huntSchema.index({ category: 1 });
huntSchema.index({ price: 1 });
huntSchema.index({ postNumber: 1 });

// 새로운 인덱스
huntSchema.index({ isFromEverytime: 1 });
huntSchema.index({ everytimeUrl: 1 }, { sparse: true });
huntSchema.index({ everytimeId: 1 }, { sparse: true });

const Hunt = mongoose.model('Hunt', huntSchema, 'hunt');

module.exports = Hunt;