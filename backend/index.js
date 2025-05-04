// index.js
require("dotenv").config({ path: "./.env" });
const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

const Everytime = require('./models/everytime');
const Hunt = require('./models/hunt');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));

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
  const { title, content, author, tags, imageUrl, sourceUrl, status } = req.body;
  
  try {
    // 필수 필드 검증
    if (!title || !content || !author || !sourceUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // 중복 확인
    const existingItem = await Hunt.findOne({ sourceUrl });
    if (existingItem) {
      return res.status(409).json({ message: 'An item with this source URL already exists' });
    }
    
    // 새 항목 생성
    const newItem = new Hunt({
      title,
      content,
      author,
      tags: tags || [],
      imageUrl: imageUrl || "",
      sourceUrl,
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

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});