// index.js
require("dotenv").config({ path: "./.env" });
const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Everytime = require('./models/everytime');
const Hunt = require('./models/hunt');
const User = require('./models/user');
const { v4: uuidv4 } = require('uuid');

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
      openChatLink
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
      mannerScore: 4.3 // 기본값
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
        mannerScore: user.mannerScore
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ success: false, message: '회원가입 중 오류가 발생했습니다.', error: error.message });
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

// 사용자 정보 조회 API (인증 필요)
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

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ success: false, message: '사용자 정보 조회 중 오류가 발생했습니다.', error: error.message });
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

// index.js 파일에 추가할 코드

// ===== EVERYTIME에서 HUNT로 데이터 마이그레이션 API =====

// 마이그레이션 API - Everytime 게시글을 Hunt로 전송 (디버깅 기능 강화)
app.post('/api/migrate/everytime-to-hunt', async (req, res) => {
  try {
    // 날짜, 키워드 등으로 제한 (선택 사항)
    const { limit = 100, keyword, startDate, endDate } = req.query;
    
    // 쿼리 구성
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
    const allEverytimePosts = await Everytime.find().sort({ created_at: -1 });
    
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
      failedItems: []
    };
    
    // 7. 각 Everytime 게시글 처리
    for (const post of limitedPosts) {
      try {
        console.log(`마이그레이션 시도 (${post._id}): ${post.제목}`);
        
        // 새 Hunt 항목 생성
        const huntItem = new Hunt({
          title: post.제목 || 'Everytime 게시글',
          content: post.내용 || '내용 없음',
          author: post.작성자 || '익명',
          created_at: post.created_at || new Date(),
          category: "unknown",
          condition: "unknown",
          price: 0,
          imageUrl: post.이미지 && post.이미지 !== "이미지 없음" ? post.이미지 : "",
          postNumber: ++lastPostNumber,
          status: 'active',
          // Everytime 게시글을 식별하기 위한 필드 추가
          isFromEverytime: true,
          everytimeUrl: post.URL,
          everytimeId: post._id
        });
        
        try {
          await huntItem.save();
          console.log(`마이그레이션 성공 (${post._id})`);
          migrationResults.success++;
        } catch (saveError) {
          // 저장 오류 상세 기록
          console.error(`저장 오류 (${post._id}):`, saveError);
          
          // mongoose 유효성 검사 오류 상세 기록
          if (saveError.name === 'ValidationError') {
            for (let field in saveError.errors) {
              console.error(`필드 [${field}] 오류:`, saveError.errors[field].message);
            }
          }
          
          // 중복 키 오류 상세 기록
          if (saveError.code === 11000) {
            console.error(`중복 키 오류:`, saveError.keyValue);
          }
          
          throw saveError; // 다시 던져서 outer catch에서 처리
        }
      } catch (error) {
        console.error(`마이그레이션 실패 (${post._id}, ${post.제목}):`, error.message);
        
        // 모든 필드 값 출력하여 디버깅
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
    
    // 8. 마이그레이션 상태 업데이트
    const totalEverytime = await Everytime.countDocuments();
    const migratedCount = await Hunt.countDocuments({ isFromEverytime: true });
    
    return res.status(200).json({
      success: true,
      message: `마이그레이션 완료: ${migrationResults.success}/${migrationResults.total} 성공`,
      stats: {
        totalEverytime,
        migratedCount,
        remaining: totalEverytime - migratedCount,
        percentComplete: (migratedCount / totalEverytime * 100).toFixed(2) + '%'
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

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});