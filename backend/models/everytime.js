// models/everytime.js
const mongoose = require('mongoose');

const everytimeSchema = new mongoose.Schema({
  제목: { type: String, required: true },
  내용: { type: String, required: true },
  작성자: { type: String, required: true },
  created_at: { type: Date, required: true },
  이미지: { type: String, default: "이미지 없음" },
  URL: { type: String, required: true, unique: true }
});

// URL 인덱스 생성
everytimeSchema.index({ URL: 1 }, { unique: true });

// 날짜 인덱스 생성
everytimeSchema.index({ created_at: -1 });

const Everytime = mongoose.model('Everytime', everytimeSchema, 'everytime');

module.exports = Everytime;