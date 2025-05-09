// index.js
require("dotenv").config({ path: "./.env" });
const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const Everytime = require('./models/everytime');
const Hunt = require('./models/hunt');
const User = require('./models/user');
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require('openai');
const csv = require('csv-parser');

mongoose.set('strictQuery', false);

const app = express();
const port = process.env.PORT || 8080;

// 1) CORS를 **가장 위**에
app.use(cors({ origin: "*" }));

// 2) 바디 파서
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// 3) 업로드 폴더 정적 서빙
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4) Multer + 업로드 라우트
const multer = require('multer');
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:  (req, file, cb) => {
      const ext = path.extname(file.originalname);        // ".png"
      const name = `${Date.now()}-${uuidv4()}${ext}`;      // "168...-550e8400-e29b-41d4-a716-446655440000.png"
      cb(null, name);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.post(
  '/api/upload-images',
  upload.array('images', 5),
  (req, res) => {
    const imageUrls = req.files.map(f => `/uploads/${f.filename}`);
    res.status(200).json({ imageUrls });
  }
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((err) => console.log('MongoDB connection error:', err));

// 기본 라우트
app.get('/', (req, res) => {
  res.status(200).send('API is running');
});

// 상태 확인 라우트
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ===== USER 관련 API =====
// 회원가입 API
app.post('/api/register', async (req, res) => {
  try {
    const {
      username,
      nickname,
      email,
      password,
      phoneNumber,
      accountNumber,
      bankName,
      openChatLink,
      // 새로 추가된 필드들
      major,
      grade,
      gender,
      interests
    } = req.body;

    // 이메일 중복 체크
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '이미 등록된 이메일입니다.' });
    }

    // 닉네임 중복 체크
    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
      return res.status(400).json({ success: false, message: '이미 사용 중인 닉네임입니다.' });
    }

    // 사용자 생성
    const user = await User.create({
      username,
      nickname,
      email,
      password, // 모델의 pre save 훅에서 해싱됨
      phoneNumber,
      accountNumber,
      bankName,
      openChatLink,
      mannerScore: 4.3, // 기본값
      // 새로 추가된 필드들
      major: major || '',
      grade: grade || 1,
      gender: gender || 'not_specified',
      interests: interests || []
    });

    // 토큰 생성
    const token = user.getSignedToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        mannerScore: user.mannerScore,
        // 새로 추가된 필드들도 응답에 포함
        major: user.major,
        grade: user.grade,
        gender: user.gender,
        interests: user.interests
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ success: false, message: '회원가입 중 오류가 발생했습니다.', error: error.message });
  }
});

// 사용자 정보 업데이트 API 추가 (기존에 없을 경우)
app.put('/api/user/profile', async (req, res) => {
  try {
    // 헤더에서.토큰 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 요청 본문에서 업데이트할 필드 추출
    const {
      nickname,
      phoneNumber,
      accountNumber,
      bankName,
      openChatLink,
      // 새로 추가된 필드들
      major,
      grade,
      gender,
      interests
    } = req.body;

    // 업데이트할 데이터 객체 생성
    const updateData = {};
    
    // 전달된 필드만 업데이트 객체에 추가
    if (nickname) updateData.nickname = nickname;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (accountNumber) updateData.accountNumber = accountNumber;
    if (bankName) updateData.bankName = bankName;
    if (openChatLink) updateData.openChatLink = openChatLink;
    
    // 새로 추가된 필드들 처리
    if (major !== undefined) updateData.major = major;
    if (grade !== undefined) updateData.grade = grade;
    if (gender !== undefined) updateData.gender = gender;
    if (interests !== undefined) updateData.interests = interests;
    
    // 닉네임 변경 시 중복 체크
    if (nickname) {
      const existingNickname = await User.findOne({ 
        nickname, 
        _id: { $ne: decoded.id } // 자기 자신은 제외
      });
      
      if (existingNickname) {
        return res.status(400).json({ success: false, message: '이미 사용 중인 닉네임입니다.' });
      }
    }
    
    // 사용자 정보 업데이트
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    
    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('사용자 정보 업데이트 오류:', error);
    
    // JWT 검증 오류 처리
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
    }
    
    res.status(500).json({ success: false, message: '사용자 정보 업데이트 중 오류가 발생했습니다.', error: error.message });
  }
});

// 사용자 정보 조회 API도 수정해야 합니다
app.get('/api/user', async (req, res) => {
  try {
    // 헤더에서 토큰 추출
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    // 응답에 새 필드들이 자동으로 포함됩니다
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ success: false, message: '사용자 정보 조회 중 오류가 발생했습니다.', error: error.message });
  }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 이메일, 비밀번호 필수 체크
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '이메일과 비밀번호를 모두 입력해주세요.' });
    }

    // 사용자 조회
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 비밀번호 확인
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    // 토큰 생성
    const token = user.getSignedToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        mannerScore: user.mannerScore
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ success: false, message: '로그인 중 오류가 발생했습니다.', error: error.message });
  }
});

// ===== EVERYTIME 관련 API =====

// Everytime 모든 게시글 가져오기 (페이지네이션 포함)
app.get('/api/everytime', async (req, res) => {
  const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = req.query;
  
  try {
    const skip = (page - 1) * limit;
    const sortOption = {};
    sortOption[sort] = order === 'desc' ? -1 : 1;
    
    const posts = await Everytime.find()
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Everytime.countDocuments();
    
    return res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalPosts: total
    });
  } catch (err) {
    console.error('Error fetching Everytime posts:', err.message);
    return res.status(500).json({ message: 'Error fetching Everytime data' });
  }
});

// Everytime 특정 키워드로 게시글 검색
app.get('/api/everytime/search', async (req, res) => {
  const { keyword, page = 1, limit = 20 } = req.query;
  
  if (!keyword) {
    return res.status(400).json({ message: 'Search keyword is required' });
  }
  
  try {
    const skip = (page - 1) * limit;
    const regex = new RegExp(keyword, 'i'); // 대소문자 구분 없는 검색
    
    const posts = await Everytime.find({
      $or: [
        { '제목': { $regex: regex } },
        { '내용': { $regex: regex } }
      ]
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Everytime.countDocuments({
      $or: [
        { '제목': { $regex: regex } },
        { '내용': { $regex: regex } }
      ]
    });
    
    return res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalPosts: total
    });
  } catch (err) {
    console.error('Error searching Everytime posts:', err.message);
    return res.status(500).json({ message: 'Error searching Everytime data' });
  }
});

// Everytime 특정 게시글 상세 정보 가져오기
app.get('/api/everytime/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const post = await Everytime.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Everytime post not found' });
    }
    
    return res.status(200).json(post);
  } catch (err) {
    console.error('Error fetching Everytime post details:', err.message);
    return res.status(500).json({ message: 'Error fetching Everytime post details' });
  }
});

// Everytime URL로 게시글 가져오기
app.get('/api/everytime/url/:url', async (req, res) => {
  const url = decodeURIComponent(req.params.url);
  
  try {
    const post = await Everytime.findOne({ URL: url });
    
    if (!post) {
      return res.status(404).json({ message: 'Everytime post not found' });
    }
    
    return res.status(200).json(post);
  } catch (err) {
    console.error('Error fetching Everytime post by URL:', err.message);
    return res.status(500).json({ message: 'Error fetching Everytime post by URL' });
  }
});

// Everytime 특정 기간 내 게시글 조회
app.get('/api/everytime/date-range', async (req, res) => {
  const { startDate, endDate, page = 1, limit = 20 } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }
  
  try {
    const skip = (page - 1) * limit;
    const query = {
      created_at: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    const posts = await Everytime.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Everytime.countDocuments(query);
    
    return res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalPosts: total
    });
  } catch (err) {
    console.error('Error fetching Everytime posts by date range:', err.message);
    return res.status(500).json({ message: 'Error fetching Everytime posts by date range' });
  }
});

// Everytime 작성자별 게시글 조회
app.get('/api/everytime/author/:author', async (req, res) => {
  const { author } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  try {
    const skip = (page - 1) * limit;
    
    const posts = await Everytime.find({ 작성자: author })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Everytime.countDocuments({ 작성자: author });
    
    return res.status(200).json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalPosts: total
    });
  } catch (err) {
    console.error('Error fetching Everytime posts by author:', err.message);
    return res.status(500).json({ message: 'Error fetching Everytime posts by author' });
  }
});

// ===== HUNT 관련 API =====

// 마지막 게시글 번호 가져오기
app.get('/api/hunt/last-post-number', async (req, res) => {
  try {
    const lastPost = await Hunt
      .findOne()
      .sort({ postNumber: -1 })
      .select('postNumber')
      .lean();                // lean()을 쓰면 plain JS 객체 반환

    const lastPostNumber = lastPost?.postNumber ?? 0;

    return res.status(200).json({ lastPostNumber });
  } catch (err) {
    console.error('[last-post-number] 에러 발생:', err);
    // 실패해도 200 + 0을 반환해서 프론트에서 계속 진행할 수 있도록
    return res.status(200).json({ lastPostNumber: 0 });
  }
});

// Hunt 모든 항목 가져오기
app.get('/api/hunt', async (req, res) => {
  const { page = 1, limit = 20, status, sort = 'created_at', order = 'desc' } = req.query;
  
  try {
    const skip = (page - 1) * limit;
    const sortOption = {};
    sortOption[sort] = order === 'desc' ? -1 : 1;
    
    // status 필터링 옵션 설정
    const query = status ? { status } : {};
    
    const items = await Hunt.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Hunt.countDocuments(query);
    
    return res.status(200).json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalItems: total
    });
  } catch (err) {
    console.error('Error fetching Hunt items:', err.message);
    return res.status(500).json({ message: 'Error fetching Hunt data' });
  }
});

// Hunt 특정 항목 상세 정보 가져오기
app.get('/api/hunt/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const item = await Hunt.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Hunt item not found' });
    }
    
    return res.status(200).json(item);
  } catch (err) {
    console.error('Error fetching Hunt item details:', err.message);
    return res.status(500).json({ message: 'Error fetching Hunt item details' });
  }
});

// Hunt 항목 검색
app.get('/api/hunt/search', async (req, res) => {
  const { keyword, tags, status, page = 1, limit = 20 } = req.query;
  
  try {
    const skip = (page - 1) * limit;
    let query = {};
    
    // 검색 조건 설정
    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [
        { title: { $regex: regex } },
        { content: { $regex: regex } }
      ];
    }
    
    // 태그 필터링
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    // 상태 필터링
    if (status) {
      query.status = status;
    }
    
    const items = await Hunt.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Hunt.countDocuments(query);
    
    return res.status(200).json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalItems: total
    });
  } catch (err) {
    console.error('Error searching Hunt items:', err.message);
    return res.status(500).json({ message: 'Error searching Hunt data' });
  }
});

// Hunt 항목 추가
app.post('/api/hunt', async (req, res) => {
  const { 
    title, 
    content, 
    author, 
    category, 
    condition, 
    price, 
    imageUrl, 
    postNumber, 
    status 
  } = req.body;
  
  try {
    // 필수 필드 검증
    if (!title || !content || !author || !category || !condition || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // 새 항목 생성
    const newItem = new Hunt({
      title,
      content,
      author,
      category,
      condition,
      price,
      imageUrl: imageUrl || "",
      postNumber,
      status: status || 'active',
      created_at: new Date()
    });
    
    await newItem.save();
    
    return res.status(201).json({
      message: 'Hunt item created successfully',
      item: newItem
    });
  } catch (err) {
    console.error('Error creating Hunt item:', err.message);
    return res.status(500).json({ message: 'Error creating Hunt item' });
  }
});

// Hunt 항목 업데이트
app.put('/api/hunt/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  try {
    // id로 항목 찾기
    const item = await Hunt.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Hunt item not found' });
    }
    
    // 업데이트할 필드 설정
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'created_at' && key !== 'updatedAt' && key !== 'createdAt') {
        item[key] = updateData[key];
      }
    });
    
    // 저장
    await item.save();
    
    return res.status(200).json({
      message: 'Hunt item updated successfully',
      item
    });
  } catch (err) {
    console.error('Error updating Hunt item:', err.message);
    return res.status(500).json({ message: 'Error updating Hunt item' });
  }
});

// Hunt 항목 삭제
app.delete('/api/hunt/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await Hunt.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Hunt item not found' });
    }
    
    return res.status(200).json({
      message: 'Hunt item deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting Hunt item:', err.message);
    return res.status(500).json({ message: 'Error deleting Hunt item' });
  }
});

// Hunt 태그별 항목 조회
app.get('/api/hunt/tags/:tag', async (req, res) => {
  const { tag } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  try {
    const skip = (page - 1) * limit;
    
    const items = await Hunt.find({ tags: tag })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Hunt.countDocuments({ tags: tag });
    
    return res.status(200).json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalItems: total
    });
  } catch (err) {
    console.error('Error fetching Hunt items by tag:', err.message);
    return res.status(500).json({ message: 'Error fetching Hunt items by tag' });
  }
});

// ===== EVERYTIME에서 HUNT로 데이터 마이그레이션 API =====

// searchProductPriceInfo 함수를 NAVER 쇼핑 API를 사용하도록 수정
async function searchProductPriceInfo(title, category) {
  try {
    // 검색 키워드 생성
    let searchKeyword = title.trim();
    
    // 카테고리가 있고 '기타'가 아니면 검색어에 추가
    if (category && category !== "기타" && category !== "unknown") {
      searchKeyword = `${searchKeyword} ${category}`;
    }
    
    console.log(`NAVER 쇼핑 검색 키워드: "${searchKeyword}"`);
    
    // NAVER 쇼핑 API 호출
    const response = await axios.get('https://openapi.naver.com/v1/search/shop.json', {
      params: {
        query: searchKeyword,
        display: 5,  // 검색 결과 개수
        sort: 'sim'  // 정확도순 정렬
      },
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
      }
    });
    
    // 응답 데이터 확인
    console.log(`NAVER 쇼핑 검색 응답: ${response.data.total}개 결과`);
    
    // 검색 결과가 없는 경우
    if (!response.data.items || response.data.items.length === 0) {
      console.log('검색 결과 없음:', searchKeyword);
      return [];
    }
    
    // NAVER 쇼핑 검색 결과에서 가격 정보 추출
    const priceResults = await Promise.all(response.data.items.map(async (item, index) => {
      try {
        // 가격 문자열에서 숫자만 추출 (콤마 제거)
        const price = parseInt(item.lprice.replace(/,/g, ''));
        
        // HTML 태그 제거
        const cleanTitle = item.title.replace(/<[^>]*>/g, '');
        const cleanMallName = item.mallName.replace(/<[^>]*>/g, '');
        
        // 상품 상태 추정 (제목에서 키워드 기반)
        let condition = 'unknown';
        const titleLower = cleanTitle.toLowerCase();
        
        if (titleLower.includes('새상품') || titleLower.includes('미개봉') || 
            titleLower.includes('new') || titleLower.includes('신품')) {
          condition = 'best';
        } else if (titleLower.includes('s급') || titleLower.includes('상태좋음') || 
                 titleLower.includes('good') || titleLower.includes('a급')) {
          condition = 'good';
        } else if (titleLower.includes('a급') || titleLower.includes('양호') || 
                 titleLower.includes('중고') || titleLower.includes('used')) {
          condition = 'soso';
        } else if (titleLower.includes('b급') || titleLower.includes('사용감') || 
                 titleLower.includes('하자') || titleLower.includes('bad')) {
          condition = 'bad';
        } else if (titleLower.includes('c급') || titleLower.includes('고장') || 
                 titleLower.includes('부품용') || titleLower.includes('worst')) {
          condition = 'worst';
        } else {
          // 키워드로 판단 안 되면 새 상품으로 가정 (네이버 쇼핑은 기본적으로 새 상품이 많음)
          condition = 'best';
        }
        
        // 신뢰도 점수 계산 (정확도 기반, 상위 결과일수록 높은 점수)
        const confidence = 0.9 - (index * 0.05);
        
        return {
          price,
          condition,
          source: cleanMallName || 'NAVER 쇼핑',  // seller를 source로 통일
          url: item.link,
          title: cleanTitle,
          confidence: Math.max(confidence, 0.6)
        };
      } catch (itemError) {
        console.error('항목 처리 오류:', itemError);
        return null;
      }
    }));
    
    // null 값 제거
    const filteredResults = priceResults.filter(item => item !== null);
    
    console.log('NAVER 쇼핑 처리 결과:', filteredResults);
    return filteredResults;
  } catch (error) {
    console.error('NAVER 쇼핑 API 오류:', error);
    
    // 인증 오류인 경우 자세한 메시지 로깅
    if (error.response && error.response.status === 401) {
      console.error('NAVER API 인증 오류 - Client ID와 Secret을 확인하세요');
    }
    
    return [];
  }
}

// 마이그레이션 상태 확인
app.get('/api/migration/status', async (req, res) => {
  try {
    // 전체 Everytime 게시글 수 계산
    const totalEverytime = await Everytime.countDocuments();
    
    // Everytime에서 가져온 Hunt 게시글 수 계산
    const migratedCount = await Hunt.countDocuments({ isFromEverytime: true });
    
    // 마이그레이션되지 않은 게시글 샘플 가져오기 (최대 5개)
    const migratedUrls = await Hunt.distinct('everytimeUrl');
    const nonMigratedSamples = await Everytime.find({ 
      URL: { $nin: migratedUrls } 
    })
    .select('_id 제목 작성자 URL created_at')
    .limit(5);
    
    return res.status(200).json({
      success: true,
      totalEverytime,
      migratedCount,
      remaining: totalEverytime - migratedCount,
      percentComplete: (migratedCount / totalEverytime * 100).toFixed(2) + '%',
      remainingSamples: nonMigratedSamples.map(post => ({
        id: post._id,
        title: post.제목,
        author: post.작성자,
        url: post.URL,
        created_at: post.created_at
      }))
    });
  } catch (err) {
    console.error('마이그레이션 상태 조회 오류:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: '마이그레이션 상태 조회 중 오류가 발생했습니다.', 
      error: err.message 
    });
  }
});

// 사용자 연락처 정보 가져오기 API
app.get('/api/user/contact', async (req, res) => {
  try {
    const { authorName } = req.query;
    
    if (!authorName) {
      return res.status(400).json({ 
        success: false, 
        message: '작성자 이름이 필요합니다.' 
      });
    }
    
    // 사용자 찾기 (username 또는 nickname으로)
    const user = await User.findOne({
      $or: [
        { username: authorName },
        { nickname: authorName }
      ]
    }).select('openChatLink');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '해당 사용자를 찾을 수 없습니다.' 
      });
    }
    
    return res.status(200).json({
      success: true,
      openChatLink: user.openChatLink
    });
  } catch (error) {
    console.error('사용자 연락처 조회 오류:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: '사용자 정보 조회 중 오류가 발생했습니다.' 
    });
  }
});

// OpenAI 인스턴스 생성
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // .env 파일에 API 키 추가 필요
});

// 상품 정보 분석 함수
async function analyzeProductInfo(title, content) {
  try {
    const prompt = `
다음 게시글 제목과 내용을 분석하여 상품 정보를 추출해 주세요:

제목: "${title}"
내용: "${content}"

다음 형식의 JSON으로 응답해 주세요:
{
  "category": "모빌리티|냉장고|전자제품|책/문서|기프티콘|원룸|족보|기타", 
  "condition": "best|good|soso|bad|worst",
  "price": 가격(숫자만),
  "estimatedPrice": 추정 가격(숫자만, 가격 정보가 불확실한 경우),
  "confidence": 분석 신뢰도(0-1 사이 소수)
}

category 설명:
- 모빌리티: 자전거, 킥보드 등 이동 수단
- 냉장고: 냉장고, 냉동고
- 전자제품: 노트북, 핸드폰, 태블릿, 전자기기
- 책/문서: 책, 자료, 문서, 필기노트
- 기프티콘: 쿠폰, 기프티콘, 상품권
- 원룸: 방, 원룸, 하우스, 주거공간
- 족보: 시험자료, 족보, 예상문제
- 기타: 기타 분류하기 어려운 상품

condition 설명:
- best: 미개봉, 새상품, 최상
- good: 상태 좋음, 거의 새것
- soso: 사용감 있음, 상태 괜찮음
- bad: 상태 별로, 사용감 많음
- worst: 부품용, 작동 안함

가격 정보가 명확하지 않은 경우 유사 상품 시세를 기준으로 estimatedPrice를 추정해 주세요.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // 필요에 따라 모델 변경 가능
      messages: [
        { role: "system", content: "당신은 상품 정보를 분석하는 전문가입니다." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // OpenAI 응답에서 JSON 추출
    const result = JSON.parse(response.choices[0].message.content);
    console.log('AI 분석 결과:', result);
    
    return result;
  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    // 기본값 반환
    return {
      category: "기타",
      condition: "unknown",
      price: 0,
      estimatedPrice: 0,
      confidence: 0
    };
  }
}

// 유사 상품 검색 함수
async function findSimilarProducts(title, content) {
  try {
    // 제목과 내용에서 핵심 키워드 추출
    const keywordResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "당신은 상품 검색을 위한 키워드를 추출하는 전문가입니다." 
        },
        { 
          role: "user", 
          content: `다음 상품 게시글에서 검색에 사용할 핵심 키워드 3-5개를 추출해 주세요:\n\n제목: "${title}"\n내용: "${content}"\n\n키워드만 쉼표로 구분하여 응답해 주세요.` 
        }
      ]
    });

    // 키워드 추출
    const keywords = keywordResponse.choices[0].message.content.split(',').map(k => k.trim());
    
    // MongoDB에서 유사 상품 검색 (키워드 기반)
    const searchConditions = keywords.map(keyword => ({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } }
      ]
    }));
    
    const similarProducts = await Hunt.find({
      $and: [
        { $or: searchConditions },
        { isFromEverytime: false }, // 실제 등록된 상품만 검색
        { status: 'active' } // 활성 상태인 상품만
      ]
    })
    .sort({ created_at: -1 })
    .limit(3);
    
    return similarProducts;
  } catch (error) {
    console.error('유사 상품 검색 오류:', error);
    return [];
  }
}

// 마이그레이션 API 수정
app.post('/api/migrate/everytime-to-hunt', async (req, res) => {
  try {
    // 기존 코드...
    const { limit = 100, keyword, startDate, endDate } = req.query;
    
    // 쿼리 구성 (기존 코드)
    let query = {};
    
    if (keyword) {
      const regex = new RegExp(keyword, 'i');
      query.$or = [
        { '제목': { $regex: regex } },
        { '내용': { $regex: regex } }
      ];
    }
    
    if (startDate && endDate) {
      query.created_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // 1. 모든 Everytime 게시글 가져오기
    const allEverytimePosts = await Everytime.find(query).sort({ created_at: -1 });
    
    // 2. 이미 마이그레이션된 URL 목록 가져오기
    const existingUrls = await Hunt.distinct('everytimeUrl');
    
    // 3. 마이그레이션되지 않은 게시글 필터링
    const postsToMigrate = allEverytimePosts.filter(post => 
      !existingUrls.includes(post.URL)
    );
    
    if (postsToMigrate.length === 0) {
      return res.status(200).json({
        success: true,
        message: '모든 Everytime 게시글이 이미 마이그레이션되었습니다.',
        stats: {
          total: allEverytimePosts.length,
          migrated: existingUrls.length
        }
      });
    }
    
    // 4. 마이그레이션할 게시글 제한 (limit 적용)
    const limitedPosts = postsToMigrate.slice(0, parseInt(limit));
    
    // 5. Hunt에서 마지막 게시글 번호 가져오기
    const lastPost = await Hunt
      .findOne()
      .sort({ postNumber: -1 })
      .select('postNumber')
      .lean();
    
    let lastPostNumber = lastPost?.postNumber ?? 0;
    
    // 6. 결과 추적용 변수
    const migrationResults = {
      total: limitedPosts.length,
      totalRemaining: postsToMigrate.length,
      success: 0,
      failed: 0,
      aiAnalyzed: 0,
      aiFailedAnalysis: 0,
      failedItems: []
    };
    
    // 7. 각 Everytime 게시글 처리 (AI 분석 추가)
    for (const post of limitedPosts) {
      try {
        console.log(`마이그레이션 시도 (${post._id}): ${post.제목}`);
        
        // AI를 사용한 상품 정보 분석
        let productInfo = {
          category: "unknown",
          condition: "unknown",
          price: 0,
          estimatedPrice: 0,
          confidence: 0
        };
        
        let similarProducts = [];
        let webPriceInfo = [];
        
        // 가격 결정 (AI 분석 결과 > 추정 가격 > 웹 가격 > 유사 상품 평균 가격 > 0)
        let finalPrice = 0;
        
        if (productInfo.price > 0) {
          finalPrice = productInfo.price;
        } else if (productInfo.estimatedPrice > 0) {
          finalPrice = productInfo.estimatedPrice;
        } else if (webPriceInfo.length > 0 && webPriceInfo[0].price > 0) {
          finalPrice = webPriceInfo[0].price;
        } else if (similarProducts.length > 0) {
          // 유사 상품의 평균 가격 계산
          const avgPrice = similarProducts.reduce((sum, p) => sum + p.price, 0) / similarProducts.length;
          finalPrice = Math.round(avgPrice);
        }
        
        // 최근 거래가 정보 생성
        const priceHistory = [];
        webPriceInfo = await searchProductPriceInfo(post.제목, productInfo.category);

        // 웹 검색 가격 정보 추가 부분 수정
        webPriceInfo.forEach(info => {
          // 가격과 신뢰도가 적절한 경우만 추가
          if (info.price > 0 && info.confidence >= 0.6) {
            priceHistory.push({
              price: info.price,
              condition: info.condition || 'best',
              source: `${info.source} (쇼핑몰)`,  // info.source 사용으로 통일
              url: info.url,
              title: info.title,
              date: new Date()
            });
          }
        });
        
        // 유사 상품 가격 정보 추가
        similarProducts.forEach(product => {
          priceHistory.push({
            price: product.price,
            condition: product.condition || 'unknown',
            huntItemId: product._id,
            source: '학생 거래',
            date: product.created_at
          });
        });
        
        // 새 Hunt 항목 생성
        const huntItem = new Hunt({
          title: post.제목 || 'Everytime 게시글',
          content: post.내용 || '내용 없음',
          author: post.작성자 || '익명',
          created_at: post.created_at || new Date(),
          // AI 분석 결과 적용
          category: productInfo.category || "기타",
          condition: productInfo.condition || "unknown",
          price: finalPrice,
          imageUrl: post.이미지 && post.이미지 !== "이미지 없음" ? post.이미지 : "",
          postNumber: ++lastPostNumber,
          status: 'active',
          // Everytime 게시글을 식별하기 위한 필드 추가
          isFromEverytime: true,
          everytimeUrl: post.URL,
          everytimeId: post._id,
          // 추가 AI 분석 정보 저장
          aiAnalysisData: {
            confidence: productInfo.confidence,
            similarProducts: similarProducts.map(p => ({
              id: p._id,
              title: p.title,
              price: p.price,
              condition: p.condition
            })),
            priceHistory: priceHistory,
            webPriceInfo: webPriceInfo
          }
        });
        
        try {
          await huntItem.save();
          console.log(`마이그레이션 성공 (${post._id}) - AI 분석 결과:`, productInfo);
          migrationResults.success++;
        } catch (saveError) {
          // 저장 오류 상세 기록 (기존 코드와 동일)
          console.error(`저장 오류 (${post._id}):`, saveError);
          
          if (saveError.name === 'ValidationError') {
            for (let field in saveError.errors) {
              console.error(`필드 [${field}] 오류:`, saveError.errors[field].message);
            }
          }
          
          if (saveError.code === 11000) {
            console.error(`중복 키 오류:`, saveError.keyValue);
          }
          
          throw saveError;
        }
      } catch (error) {
        console.error(`마이그레이션 실패 (${post._id}, ${post.제목}):`, error.message);
        
        // 모든 필드 값 출력하여 디버깅 (기존 코드)
        console.error('실패한 문서 내용:', {
          id: post._id,
          title: post.제목 || '(없음)',
          content_sample: post.내용 ? post.내용.substring(0, 50) + '...' : '(없음)',
          author: post.작성자 || '(없음)',
          created_at: post.created_at || '(없음)',
          image: post.이미지 || '(없음)',
          url: post.URL || '(없음)'
        });
        
        migrationResults.failed++;
        migrationResults.failedItems.push({
          id: post._id,
          title: post.제목 || '(제목 없음)',
          reason: error.message,
          details: error.code === 11000 
            ? `중복 키: ${JSON.stringify(error.keyValue)}` 
            : undefined
        });
      }
    }
    
    // 8. 마이그레이션 상태 업데이트 (기존 코드)
    const totalEverytime = await Everytime.countDocuments();
    const migratedCount = await Hunt.countDocuments({ isFromEverytime: true });
    
    return res.status(200).json({
      success: true,
      message: `마이그레이션 완료: ${migrationResults.success}/${migrationResults.total} 성공 (AI 분석: ${migrationResults.aiAnalyzed})`,
      stats: {
        totalEverytime,
        migratedCount,
        remaining: totalEverytime - migratedCount,
        percentComplete: (migratedCount / totalEverytime * 100).toFixed(2) + '%',
        aiAnalysis: {
          success: migrationResults.aiAnalyzed,
          failed: migrationResults.aiFailedAnalysis
        }
      },
      results: migrationResults
    });
  } catch (err) {
    console.error('마이그레이션 오류:', err);
    return res.status(500).json({ 
      success: false, 
      message: '마이그레이션 중 오류가 발생했습니다.', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// 유사 상품 API 추가
app.get('/api/hunt/:id/similar-products', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 해당 상품 정보 가져오기
    const product = await Hunt.findById(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: '상품을 찾을 수 없습니다.' 
      });
    }
    
    // 이미 AI 분석 데이터가 있는 경우 해당 정보 사용
    if (product.aiAnalysisData && product.aiAnalysisData.similarProducts && product.aiAnalysisData.similarProducts.length > 0) {
      const similarProductIds = product.aiAnalysisData.similarProducts.map(p => p.id);
      const similarProducts = await Hunt.find({ _id: { $in: similarProductIds } });
      
      return res.status(200).json({
        success: true,
        similarProducts
      });
    }
    
    // 없는 경우 새로 분석
    const similarProducts = await findSimilarProducts(product.title, product.content);
    
    return res.status(200).json({
      success: true,
      similarProducts
    });
  } catch (error) {
    console.error('유사 상품 조회 오류:', error);
    return res.status(500).json({ 
      success: false, 
      message: '유사 상품을 조회하는 중 오류가 발생했습니다.' 
    });
  }
});

app.post('/api/hunt/:id/reanalyze', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 상품 정보 가져오기
    const product = await Hunt.findById(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: '상품을 찾을 수 없습니다.' 
      });
    }
    
    // AI 분석 실행
    const productInfo = await analyzeProductInfo(product.title, product.content);
    
    // 유사 상품 검색
    const similarProducts = await findSimilarProducts(product.title, product.content);
    
    // 가격 이력 정보 생성/업데이트
    const priceHistory = product.aiAnalysisData?.priceHistory || [];
    
    // 웹 검색을 통한 가격 정보 가져오기
    const webPriceInfo = await searchProductPriceInfo(product.title, productInfo.category);

    // 웹 검색 가격 정보 추가 부분 수정
    webPriceInfo.forEach(info => {
      // 가격과 신뢰도가 적절한 경우만 추가
      if (info.price > 0 && info.confidence >= 0.6) {
        priceHistory.push({
          price: info.price,
          condition: info.condition || 'best',
          source: `${info.seller} (쇼핑몰)`,
          url: info.url,
          title: info.title,
          date: new Date()
        });
      }
    });
    
    // 유사 상품 가격 정보 추가
    similarProducts.forEach(similarProduct => {
      // 이미 기존 priceHistory에 있는지 확인
      const exists = priceHistory.some(history => 
        history.huntItemId && history.huntItemId.toString() === similarProduct._id.toString()
      );
      
      if (!exists) {
        priceHistory.push({
          price: similarProduct.price,
          condition: similarProduct.condition || 'unknown',
          huntItemId: similarProduct._id,
          source: '학생 거래',
          date: similarProduct.created_at
        });
      }
    });
    
    // 상품 정보 업데이트
    product.aiAnalysisData = {
      ...product.aiAnalysisData,
      confidence: productInfo.confidence,
      similarProducts: similarProducts.map(p => ({
        id: p._id,
        title: p.title,
        price: p.price,
        condition: p.condition
      })),
      priceHistory: priceHistory,
      webPriceInfo: webPriceInfo,
      lastAnalyzedAt: new Date()
    };
    
    // 카테고리 및 상태가 unknown이고 AI가 분석한 결과가 있으면 업데이트
    if (product.category === "unknown" || product.category === "기타") {
      if (productInfo.category && productInfo.category !== "unknown" && productInfo.category !== "기타") {
        product.category = productInfo.category;
      }
    }
    
    if (product.condition === "unknown") {
      if (productInfo.condition && productInfo.condition !== "unknown") {
        product.condition = productInfo.condition;
      }
    }
    
    await product.save();
    
    return res.status(200).json({
      success: true,
      message: 'AI 분석이 완료되었습니다.',
      product
    });
  } catch (error) {
    console.error('AI 재분석 오류:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'AI 분석 중 오류가 발생했습니다.' 
    });
  }
});

// 모든 상품 재분석 API
app.post('/api/hunt/reanalyze-all', async (req, res) => {
  try {
    // 마이그레이션된 상품 목록 가져오기 (옵션: limit으로 제한)
    const products = await Hunt.find()
      .sort({ created_at: -1 });
    
    console.log(`총 ${products.length}개 상품 재분석 시작`);
    
    let analyzedCount = 0;
    
    // 각 상품 순차적으로 분석
    for (const product of products) {
      try {
        console.log(`상품 분석 중: ${product._id} - ${product.title}`);
        
        // AI 분석 실행
        const productInfo = await analyzeProductInfo(product.title, product.content);
        
        // 유사 상품 검색
        const similarProducts = await findSimilarProducts(product.title, product.content);
        
        // 가격 이력 정보 생성/업데이트
        const priceHistory = product.aiAnalysisData?.priceHistory || [];
        
        // 웹 검색을 통한 가격 정보 가져오기
        const webPriceInfo = await searchProductPriceInfo(product.title, productInfo.category);

        // 웹 검색 가격 정보 추가
        webPriceInfo.forEach(info => {
          // 가격과 신뢰도가 적절한 경우만 추가
          if (info.price > 0 && info.confidence >= 0.6) {
            priceHistory.push({
              price: info.price,
              condition: info.condition || 'best',
              source: `${info.seller} (쇼핑몰)`,
              url: info.url,
              title: info.title,
              date: new Date()
            });
          }
        });
        
        // 유사 상품 가격 정보 추가
        similarProducts.forEach(similarProduct => {
          // 이미 기존 priceHistory에 있는지 확인
          const exists = priceHistory.some(history => 
            history.huntItemId && history.huntItemId.toString() === similarProduct._id.toString()
          );
          
          if (!exists) {
            priceHistory.push({
              price: similarProduct.price,
              condition: similarProduct.condition || 'unknown',
              huntItemId: similarProduct._id,
              source: '학생 거래',
              date: similarProduct.created_at
            });
          }
        });
        
        // 상품 정보 업데이트
        product.aiAnalysisData = {
          ...product.aiAnalysisData,
          confidence: productInfo.confidence,
          similarProducts: similarProducts.map(p => ({
            id: p._id,
            title: p.title,
            price: p.price,
            condition: p.condition
          })),
          priceHistory: priceHistory,
          webPriceInfo: webPriceInfo,
          lastAnalyzedAt: new Date()
        };
        
        // 카테고리 및 상태가 unknown이고 AI가 분석한 결과가 있으면 업데이트
        if (product.category === "unknown" || product.category === "기타") {
          if (productInfo.category && productInfo.category !== "unknown" && productInfo.category !== "기타") {
            product.category = productInfo.category;
          }
        }
        
        if (product.condition === "unknown") {
          if (productInfo.condition && productInfo.condition !== "unknown") {
            product.condition = productInfo.condition;
          }
        }
        
        await product.save();
        analyzedCount++;
        console.log(`상품 분석 완료: ${product._id}`);
      } catch (error) {
        console.error(`상품 분석 오류 (${product._id}):`, error);
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `${analyzedCount}개 상품 재분석 완료`,
      analyzedCount
    });
  } catch (error) {
    console.error('전체 재분석 오류:', error);
    return res.status(500).json({ 
      success: false, 
      message: '재분석 중 오류가 발생했습니다.' 
    });
  }
});

// 상품 가격 정보 API 추가
app.get('/api/hunt/:id/price-info', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 상품 정보 가져오기
    const product = await Hunt.findById(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: '상품을 찾을 수 없습니다.' 
      });
    }
    
    const priceInfo = {
      currentPrice: product.price,
      priceHistory: product.aiAnalysisData?.priceHistory || [],
      similarProducts: [],
      webPriceInfo: product.aiAnalysisData?.webPriceInfo || []
    };
    
    // 유사 상품 정보 가져오기
    if (product.aiAnalysisData?.similarProducts?.length > 0) {
      const similarProductIds = product.aiAnalysisData.similarProducts.map(p => p.id);
      const similarProducts = await Hunt.find({ 
        _id: { $in: similarProductIds },
        status: 'active'
      }).select('_id title price condition imageUrl created_at');
      
      priceInfo.similarProducts = similarProducts;
    }
    
    return res.status(200).json({
      success: true,
      priceInfo
    });
  } catch (error) {
    console.error('가격 정보 조회 오류:', error);
    return res.status(500).json({ 
      success: false, 
      message: '가격 정보를 조회하는 중 오류가 발생했습니다.' 
    });
  }
});

// NAVER 쇼핑 API 테스트 엔드포인트
app.get('/api/test/naver-shopping', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: '검색어를 입력해주세요.' 
      });
    }
    
    const results = await searchProductPriceInfo(query.toString(), '');
    
    return res.status(200).json({
      success: true,
      query,
      results
    });
  } catch (error) {
    console.error('NAVER 쇼핑 API 테스트 오류:', error);
    return res.status(500).json({ 
      success: false, 
      message: '검색 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 에브리타임 크롤링 및 동기화 API
app.post('/api/sync/everytime', async (req, res) => {
  try {
    // 1. Python 스크립트 실행
    const { spawn } = require('child_process');
    const pythonProcess = spawn('python', ['./everytime_crawl.py']);
    
    let dataString = '';
    let errorString = '';

    // 파이썬 스크립트 출력 처리
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
      console.log('Python stdout:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
      console.error('Python stderr:', data.toString());
    });

    // 프로세스 종료 처리
    const processExit = new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python process exited with code ${code}: ${errorString}`));
        }
      });
    });

    // 파이썬 프로세스 완료 대기
    await processExit;
    
    // 2. CSV 파일 읽기 및 Everytime DB에 저장
    const csvFilePath = path.join(__dirname, 'everytime_marketplace.csv');
    const results = [];
    
    // CSV 파싱 및 DB 저장 함수 정의
    const processCSV = () => {
      return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', async () => {
            try {
              console.log(`CSV 파일에서 ${results.length}개의 레코드를 읽었습니다.`);
              
              // 기존 URL 가져오기
              const existingUrls = await Everytime.distinct('URL');
              let newCount = 0;
              
              // 각 레코드 처리
              for (const record of results) {
                // 이미 존재하는 URL인지 확인
                if (existingUrls.includes(record.URL)) {
                  continue;
                }
                
                // 레코드 정제 및 변환
                const everytimeRecord = new Everytime({
                  제목: record.제목,
                  내용: record.내용,
                  작성자: record.작성자,
                  created_at: new Date(record.created_at),
                  이미지: record.이미지,
                  URL: record.URL
                });
                
                // DB에 저장
                await everytimeRecord.save();
                newCount++;
              }
              
              resolve({
                total: results.length,
                new: newCount
              });
            } catch (error) {
              reject(error);
            }
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    };
    
    // CSV 처리 실행
    const processResult = await processCSV();
    
    // 3. 결과 응답
    res.status(200).json({
      success: true,
      message: '에브리타임 동기화가 완료되었습니다.',
      stats: {
        scraped: processResult.total,
        newlyAdded: processResult.new,
        logs: dataString.split('\n').filter(line => line.trim() !== '')
      }
    });
    
  } catch (error) {
    console.error('에브리타임 동기화 오류:', error);
    res.status(500).json({
      success: false,
      message: '에브리타임 동기화 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});