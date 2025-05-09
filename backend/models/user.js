// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '이름을 입력해주세요'],
    trim: true
  },
  nickname: {
    type: String,
    required: [true, '닉네임을 입력해주세요'],
    trim: true
  },
  email: {
    type: String,
    required: [true, '이메일을 입력해주세요'],
    unique: true,
    trim: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, '유효한 이메일 주소를 입력해주세요']
  },
  password: {
    type: String,
    required: [true, '비밀번호를 입력해주세요'],
    minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다']
  },
  phoneNumber: {
    type: String,
    required: [true, '인증번호를 입력해주세요'],
    trim: true
  },
  mannerScore: {
    type: Number,
    default: 4.3
  },
  accountNumber: {
    type: String,
    required: [true, '계좌 번호를 입력해주세요'],
    trim: true
  },
  bankName: {
    type: String,
    required: [true, '은행명을 입력해주세요'],
    trim: true
  },
  openChatLink: {
    type: String,
    required: [true, '오픈채팅 링크를 입력해주세요'],
    trim: true
  },
  // 새로 추가되는 필드들
  major: {
    type: String,
    trim: true,
    default: ''
  },
  grade: {
    type: Number,
    min: 1,
    max: 6,  // 학부 1~4학년, 대학원 5~6학년 포함
    default: 1
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'not_specified'],
    default: 'not_specified'
  },
  interests: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: false, // timestamps 옵션 비활성화
  versionKey: false  // __v 필드 비활성화
});

// 비밀번호 해싱
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 확인 메서드
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT 토큰 생성 메서드
userSchema.methods.getSignedToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;