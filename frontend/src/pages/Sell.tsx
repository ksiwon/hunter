import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAppSelector } from '../store/hooks';
import { FaCamera } from 'react-icons/fa';

// 서버 API URL 설정
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const Sell: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAppSelector(state => state.auth);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 카테고리 옵션
  const categoryOptions = [
    { value: '모빌리티', label: '모빌리티' },
    { value: '냉장고', label: '냉장고' },
    { value: '전자제품', label: '전자제품' },
    { value: '책/문서', label: '책/문서' },
    { value: '기프티콘', label: '기프티콘' },
    { value: '원룸', label: '원룸' },
    { value: '족보', label: '족보' },
    { value: '기타', label: '기타' },
  ];

  // 상태 옵션
  const conditionOptions = [
    { value: 'best', label: '미개봉 / 최상' },
    { value: 'good', label: '상태 좋음' },
    { value: 'soso', label: '양호 / 보통' },
    { value: 'bad', label: '상태 별로' },
    { value: 'worst', label: '부품용 / 미작동' },
    { value: 'none', label: '알 수 없음' },
  ];

  // 로그인 체크
  React.useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // 이미지 선택 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      
      // 최대 5개 이미지 제한
      if (images.length + fileList.length > 5) {
        alert('이미지는 최대 5개까지 업로드 가능합니다.');
        return;
      }

      // 파일 확장자 및 크기 체크
      const validFiles = fileList.filter(file => {
        const fileType = file.type.split('/')[0];
        const fileSize = file.size / 1024 / 1024; // MB 단위
        
        if (fileType !== 'image') {
          alert('이미지 파일만 업로드 가능합니다.');
          return false;
        }
        
        if (fileSize > 10) {
          alert('파일 크기는 최대 10MB까지 가능합니다.');
          return false;
        }
        
        return true;
      });

      if (validFiles.length > 0) {
        setImages(prev => [...prev, ...validFiles]);
        
        // 이미지 미리보기 URL 생성
        validFiles.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewUrls(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  // 이미지 제거
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // 양식 유효성 검사
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    
    if (!category) {
      newErrors.category = '카테고리를 선택해주세요.';
    }
    
    if (!condition) {
      newErrors.condition = '상태를 선택해주세요.';
    }
    
    if (!price.trim()) {
      newErrors.price = '가격을 입력해주세요.';
    } else if (isNaN(Number(price))) {
      newErrors.price = '가격은 숫자만 입력 가능합니다.';
    }
    
    if (!content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
  
    try {
      // 1) 이미지만 multipart 로 업로드
      let imageUrl = '';
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(img => formData.append('images', img));
        const uploadRes = await axios.post(
          `${API_URL}/upload-images`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        // 첫 번째 이미지만 쓰려면
        imageUrl = uploadRes.data.imageUrls[0]; 
      }
  
      // 2) last-post-number 불러오기
      const lastPostRes = await axios.get(`${API_URL}/hunt/last-post-number`);
      const newPostNumber = (lastPostRes.data.lastPostNumber || 0) + 1;
  
      // 3) 실제 게시글 생성 (isFromEverytime: false 추가)
      await axios.post(`${API_URL}/hunt`, {
        title, 
        content, 
        author: user?.nickname || '익명',
        category, 
        condition,
        price: Number(price),
        imageUrl,
        postNumber: newPostNumber,
        status: 'active',
        // Everytime에서 가져온 게시글이 아님을 표시
        isFromEverytime: false
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
  
      alert('상품이 등록되었습니다.');
      navigate('/dashboard');
    } catch (err) {
      console.error('상품 등록 오류:', err);
      alert('등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SellContainer>
      <PageTitle>판매하기</PageTitle>
      
      <FormContainer onSubmit={handleSubmit}>
        {/* 제목 입력 */}
        <FormGroup>
          <FormLabel>상품명</FormLabel>
          <FormInput
            type="text"
            placeholder="상품명을 정확하게 입력해주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            $error={!!errors.title}  
          />
          {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
        </FormGroup>
        
        {/* 카테고리 선택 */}
        <FormGroup>
          <FormLabel>카테고리</FormLabel>
          <OptionGroup>
            {categoryOptions.map((option, index) => (
              <OptionButton
                key={index}
                type="button"
                selected={category === option.value}
                onClick={() => setCategory(option.value)}
              >
                <RadioCircle selected={category === option.value} />
                {option.label}
              </OptionButton>
            ))}
          </OptionGroup>
          {errors.category && <ErrorMessage>{errors.category}</ErrorMessage>}
        </FormGroup>
        
        {/* 상태 선택 */}
        <FormGroup>
          <FormLabel>상태</FormLabel>
          <OptionGroup>
            {conditionOptions.map((option, index) => (
              <OptionButton
                key={index}
                type="button"
                selected={condition === option.value}
                onClick={() => setCondition(option.value)}
              >
                <RadioCircle selected={condition === option.value} />
                {option.label}
              </OptionButton>
            ))}
          </OptionGroup>
          {errors.condition && <ErrorMessage>{errors.condition}</ErrorMessage>}
        </FormGroup>
        
        {/* 가격 입력 */}
        <FormGroup>
          <FormLabel>판매 가격</FormLabel>
          <PriceInputWrapper>
            <PriceInput
              type="text"
              placeholder="희망 판매가"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
              error={!!errors.price}
            />
            <PriceUnit>원</PriceUnit>
          </PriceInputWrapper>
          {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
        </FormGroup>
        
        {/* 내용 입력 */}
        <FormGroup>
          <FormLabel>내용</FormLabel>
          <ContentTextarea
            placeholder="내용을 입력해주세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            error={!!errors.content}
          />
          {errors.content && <ErrorMessage>{errors.content}</ErrorMessage>}
        </FormGroup>
        
        {/* 이미지 업로드 */}
        <FormGroup>
          <FormLabel>사진</FormLabel>
          <ImageUploadSection>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <ImagePreviewContainer>
              <AddImageButton onClick={() => fileInputRef.current?.click()}>
                <FaCamera size={24} />
              </AddImageButton>
              
              {previewUrls.map((url, index) => (
                <ImagePreview key={index}>
                  <img src={url} alt={`Preview ${index + 1}`} />
                  <RemoveImageButton onClick={() => removeImage(index)}>
                    &times;
                  </RemoveImageButton>
                </ImagePreview>
              ))}
            </ImagePreviewContainer>
            <ImageUploadInfo>
              * 최대 5개까지 업로드 가능합니다. (최대 10MB)
            </ImageUploadInfo>
          </ImageUploadSection>
        </FormGroup>
        
        {/* 버튼 그룹 */}
        <ButtonGroup>
          <CancelButton type="button" onClick={() => navigate(-1)}>
            이전
          </CancelButton>
          <SubmitButton type="submit" disabled={isSubmitting}>
            게시글 등록
          </SubmitButton>
        </ButtonGroup>
      </FormContainer>
    </SellContainer>
  );
};

// 스타일 컴포넌트
const SellContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.T2.fontSize};
  font-weight: ${({ theme }) => theme.typography.T2.fontWeight};
  font-family: ${({ theme }) => theme.typography.T2.fontFamily};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 32px;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const FormGroup = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 6px;
  box-sizing: border-box;
  padding: 8px 8px 8px 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const FormLabel = styled.div`
  min-width: 60px;
  padding: 16px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  border-radius: 4px 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FormInput = styled.input<{ $error?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ $error, theme }) => $error ? theme.colors.red[600] : theme.colors.gray[300]};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const OptionGroup = styled.div`
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const RadioCircle = styled.span<{ selected: boolean }>`
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${({ selected, theme }) => selected ? theme.colors.primary : theme.colors.gray[300]};
  background-color: ${({ selected, theme }) => selected ? theme.colors.primary : 'transparent'};
  margin-right: 8px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.white};
    opacity: ${({ selected }) => selected ? 1 : 0};
  }
`;

const OptionButton = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  background-color: transparent;
  border: none;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ selected, theme }) => selected ? theme.colors.primary : theme.colors.gray[600]};
  font-weight: ${({ selected, theme }) => selected ? theme.typography.T3.fontWeight : theme.typography.T5.fontWeight};
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PriceInputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const PriceInput = styled.input<{ error?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ error, theme }) => error ? theme.colors.red[600] : theme.colors.gray[300]};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const PriceUnit = styled.span`
  margin-left: 8px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const ContentTextarea = styled.textarea<{ error?: boolean }>`
  flex: 1;
  min-height: 200px;
  padding: 16px;
  border: 1px solid ${({ error, theme }) => error ? theme.colors.red[600] : theme.colors.gray[300]};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.gray[300]};
  }
`;

const ImageUploadSection = styled.div`
  flex: 1;
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const AddImageButton = styled.button.attrs({
    type: 'button'  // 버튼 타입을 명시적으로 'button'으로 설정
  })`
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.colors.purple[100]};
    border: 2px dashed ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    & > svg {
      color: ${({ theme }) => theme.colors.primary};
    }
    
    &:hover {
      background-color: ${({ theme }) => theme.colors.purple[300]};
    }
  `;

const ImagePreview = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.5);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const ImageUploadInfo = styled.p`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
`;

const Button = styled.button`
  padding: 12px 32px;
  border-radius: 50px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: pointer;
  transition: all 0.2s;
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.gray[300]};
  color: ${({ theme }) => theme.colors.gray[600]};
  border: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[300]};
  }
`;

const SubmitButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.purple[300]};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[300]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  color: ${({ theme }) => theme.colors.red[600]};
  margin-top: 4px;
  margin-left: 120px;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

export default Sell;