import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import axios from 'axios';

// 아이콘 임포트
import { 
  FaHeart, 
  FaRegHeart,
  FaArrowLeft,
  FaUser,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaShare,
  FaSync,
  FaExternalLinkAlt
} from 'react-icons/fa';

// 타입 정의
interface SimilarProduct {
  id: string;
  title: string;
  price: number;
  condition: string;
}

interface PriceHistoryItem {
  price: number;
  condition: string;
  source?: string;
  url?: string;
  huntItemId?: string;
  date: string;
}

interface WebPriceInfo {
  price: number;
  condition: string;
  source: string;   // seller를 source로 통일
  url: string;
  title: string;   // 상품명
  confidence: number;
}

interface AIAnalysisData {
  confidence?: number;
  similarProducts?: SimilarProduct[];
  priceHistory?: PriceHistoryItem[];
  webPriceInfo?: WebPriceInfo[];
  lastAnalyzedAt?: string;
}

interface ProductDetail {
  _id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  condition: string;
  price: number;
  imageUrl: string;
  postNumber: number;
  status: string;
  created_at: string;
  isFromEverytime?: boolean; // 선택적 필드
  everytimeUrl?: string;    // 추가: 에브리타임 URL
  views?: number;
  likes?: number;
  aiAnalysisData?: AIAnalysisData;
}

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetail[]>([]);
  
  // 이미지 URL 목록 (실제로는 서버에서 가져와야 함)
  const [images, setImages] = useState<string[]>([]);
  
  // 상품 정보 재분석 상태
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setIsLoading(true);
        
        const response = await axios.get(`${API_URL}/hunt/${id}`);
        setProduct(response.data);
        
        // 이미지가 있으면 이미지 목록에 추가
        if (response.data.imageUrl) {
          setImages([getImageUrl(response.data.imageUrl)]);
        }
        
        // 관련 상품 가져오기 (같은 카테고리 상품)
        if (response.data.category) {
          const relatedResponse = await axios.get(`${API_URL}/hunt`, {
            params: {
              category: response.data.category,
              limit: 4,
              excludeId: id // 현재 상품 제외
            }
          });
          
          if (relatedResponse.data && relatedResponse.data.items) {
            setRelatedProducts(relatedResponse.data.items);
          }
        }
      } catch (error) {
        console.error('상품 정보를 불러오는 중 오류가 발생했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchProductDetail();
    }
  }, [id]);
  
  // 이미지 URL 처리
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl || imageUrl === "") {
      return ''; // NoImage 컴포넌트를 사용하므로 빈 문자열 반환
    }
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/uploads')) {
      return `${process.env.REACT_APP_URL || 'http://localhost:8080'}${imageUrl}`;
    }
    
    return `${process.env.REACT_APP_URL || 'http://localhost:8080'}/uploads/${imageUrl}`;
  };
  
  // 상태 텍스트 변환
  const getConditionText = (condition: string): string => {
    const conditionMap: { [key: string]: string } = {
      'best': '미개봉 / 최상',
      'good': '상태 좋음',
      'soso': '양호 / 보통',
      'bad': '상태 별로',
      'worst': '부품용/미작동',
      'none': '알 수 없음',
      'unknown': '알 수 없음'
    };
    
    return conditionMap[condition] || '알 수 없음';
  };
  
  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      return '오늘';
    } else if (diffDays <= 2) {
      return '어제';
    } else if (diffDays <= 7) {
      return `${diffDays}일 전`;
    } else {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }
  };
  
  // 좋아요 토글
  const toggleLike = () => {
    setIsLiked(!isLiked);
    // TODO: 서버에 좋아요 상태 업데이트 요청
  };
  
  // 이전 이미지로 이동
  const prevImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  // 다음 이미지로 이동
  const nextImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // 연락하기 (채팅) 핸들러
  const handleContact = async () => {
    // product가 null인 경우 처리
    if (!product) {
      alert('상품 정보를 불러올 수 없습니다.');
      return;
    }
  
    try {
      if (product.isFromEverytime && product.everytimeUrl) {
        // 에브리타임 글이면 해당 URL 열기
        window.open(product.everytimeUrl, '_blank');
      } else {
        // 일반 상품이면 작성자의 오픈채팅 링크 가져오기
        const response = await axios.get(`${API_URL}/user/contact`, {
          params: { authorName: product.author }
        });
        
        if (response.data && response.data.openChatLink) {
          window.open(response.data.openChatLink, '_blank');
        } else {
          alert('판매자의 연락처를 찾을 수 없습니다.');
        }
      }
    } catch (error) {
      console.error('연락하기 처리 중 오류가 발생했습니다:', error);
      alert('판매자에게 연락하는 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };
  
  // 이전 페이지로 이동
  const goBack = () => {
    navigate(-1);
  };
  
  // 공유하기
  const handleShare = () => {
    // 현재 URL 복사
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('URL이 클립보드에 복사되었습니다.');
      })
      .catch(err => {
        console.error('URL 복사 중 오류 발생:', err);
      });
  };

  // 상품 정보 다시 분석 요청
  const handleReanalyze = async () => {
    if (isAnalyzing || !product) return;
    
    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${API_URL}/hunt/${id}/reanalyze`);
      if (response.data.success) {
        alert('상품 정보가 다시 분석되었습니다.');
        // 상품 정보 업데이트
        setProduct(response.data.product);
      } else {
        alert('분석 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('재분석 오류:', error);
      alert('분석 요청 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // 외부 가격 정보 링크 클릭 처리
  const handleExternalLinkClick = (url: string) => {
    window.open(url, '_blank');
  };
  
  // 내부 상품 링크 클릭 처리
  const handleProductLinkClick = (huntItemId: string) => {
    if (huntItemId === id) return; // 현재 상품은 이동하지 않음
    navigate(`/product/${huntItemId}`);
  };

  if (isLoading) {
    return <LoadingContainer>상품 정보를 불러오는 중입니다...</LoadingContainer>;
  }
  
  if (!product) {
    return <ErrorContainer>상품을 찾을 수 없습니다.</ErrorContainer>;
  }

  return (
    <DetailContainer>
      {/* 상단 네비게이션 */}
      <TopNavigation>
        <BackButton onClick={goBack}>
          <FaArrowLeft />
        </BackButton>
        <ShareButton onClick={handleShare}>
          <FaShare />
        </ShareButton>
      </TopNavigation>
      
      {/* 이미지 슬라이더 */}
      <ImageSlider>
        {images.length > 0 ? (
          <>
            <ImageWrapper>
              <ProductImage 
                src={images[currentImageIndex]} 
                alt={product.title}
                onError={(e) => {
                  // 이미지 로드 실패 시 데이터 URI로 대체
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YyZjJmMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9ImFyaWFsIiBmaWxsPSIjOTk5OTk5Ij7snbTrr7jsp4Ag7JeF66Gc65OcIOyXhuyKteuLiOuLpC48L3RleHQ+PC9zdmc+';
                }}
              />
              {product.isFromEverytime && (
                <SourceBadge>에브리타임</SourceBadge>
              )}
            </ImageWrapper>
            
            {images.length > 1 && (
              <>
                <NavButton left onClick={prevImage}>
                  <FaChevronLeft />
                </NavButton>
                <NavButton right onClick={nextImage}>
                  <FaChevronRight />
                </NavButton>
                
                <ImagePagination>
                  {images.map((_, index) => (
                    <PaginationDot 
                      key={index} 
                      active={index === currentImageIndex}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </ImagePagination>
              </>
            )}
          </>
        ) : (
          <NoImageContainer>
            <NoImageText>이미지가 없습니다.</NoImageText>
          </NoImageContainer>
        )}
      </ImageSlider>
      
      {/* 상품 정보 */}
      <ProductInfoSection>
        <ProductTitle>{product.title}</ProductTitle>
        
        <PriceRow>
          <ProductPrice>{product.price.toLocaleString()} 원</ProductPrice>
          <LikeButton onClick={toggleLike}>
            {isLiked ? <FaHeart color="#FA5858" /> : <FaRegHeart />}
            <LikeCount>{product.likes || 0}</LikeCount>
          </LikeButton>
        </PriceRow>
        
        <ProductStatusInfo>
          <StatusBadge available={product.status === 'active'}>
            {product.status === 'active' ? '거래 가능' : '거래 불가'}
          </StatusBadge>
          <ConditionBadge condition={product.condition}>
            {getConditionText(product.condition)}
          </ConditionBadge>
          <CategoryBadge>{product.category}</CategoryBadge>
        </ProductStatusInfo>
        
        <DetailInfo>
          <DetailInfoRow>
            <DetailInfoLabel>상품번호</DetailInfoLabel>
            <DetailInfoValue>{product.postNumber}</DetailInfoValue>
          </DetailInfoRow>
          <DetailInfoRow>
            <DetailInfoLabel>등록일</DetailInfoLabel>
            <DetailInfoValue>{formatDate(product.created_at)}</DetailInfoValue>
          </DetailInfoRow>
          <DetailInfoRow>
            <DetailInfoLabel>조회수</DetailInfoLabel>
            <DetailInfoValue>{product.views || 0}</DetailInfoValue>
          </DetailInfoRow>
        </DetailInfo>
      </ProductInfoSection>
      
      {/* 판매자 정보 */}
      <SellerSection>
        <SellerTitle>판매자 정보</SellerTitle>
        <SellerInfo>
          <SellerAvatar>
            <FaUser size={24} />
          </SellerAvatar>
          <SellerDetails>
            <SellerName>{product.author}</SellerName>
            <MannerScore>A+</MannerScore>
          </SellerDetails>
          <SellerLocationInfo>
            <FaMapMarkerAlt />
            <SellerLocation>한국과학기술원(KAIST)</SellerLocation>
          </SellerLocationInfo>
        </SellerInfo>
      </SellerSection>
      
      {/* 가격 이력 섹션 */}
      <PriceHistorySection>
        <SectionHeader>
          <SectionTitle>가격 정보</SectionTitle>
            <AnalyzeButton onClick={handleReanalyze} disabled={isAnalyzing}>
              {isAnalyzing ? '분석 중...' : 'AI로 가격 분석'}
              {isAnalyzing && (
                <RotatingIcon>
                  <FaSync size={14} />
                </RotatingIcon>
              )}
            </AnalyzeButton>
        </SectionHeader>
        
        {/* 가격 이력 없는 경우 */}
        {(!product.aiAnalysisData || 
          (!(product.aiAnalysisData.priceHistory?.length ?? 0) && 
          !(product.aiAnalysisData.webPriceInfo?.length ?? 0) && 
          !(product.aiAnalysisData.similarProducts?.length ?? 0))) ? (
          <EmptyPriceHistory>
            {product.isFromEverytime ? 
              '가격 정보가 없습니다. AI 분석을 통해 가격 정보를 찾아보세요.' : 
              '가격 정보가 없습니다.'}
          </EmptyPriceHistory>
        ) : (
          <PriceInfoContainer>
            {/* 내부 거래 가격 이력 */}
            {(product.aiAnalysisData?.priceHistory?.filter(history => history.source === '학생 거래')?.length ?? 0) > 0 && (
              <PriceInfoSection>
                <PriceInfoTitle>교내 거래 가격</PriceInfoTitle>
                <PriceItemList>
                  {product.aiAnalysisData?.priceHistory
                    ?.filter(history => history.source === '학생 거래')
                    ?.map((history, index) => (
                      <PriceItem 
                        key={`history-${index}`} 
                        onClick={() => history.huntItemId && handleProductLinkClick(history.huntItemId)}
                        clickable={!!history.huntItemId}
                      >
                        <PriceItemMain>
                          <PriceValue>{history.price.toLocaleString()}원</PriceValue>
                          <ConditionTag condition={history.condition}>
                            {getConditionText(history.condition)}
                          </ConditionTag>
                        </PriceItemMain>
                        <PriceItemDetails>
                          <PriceSource>{history.source}</PriceSource>
                          <PriceDate>
                            {new Date(history.date).toLocaleDateString()}
                          </PriceDate>
                          {history.huntItemId && (
                            <LinkIcon>
                              <FaExternalLinkAlt size={12} />
                            </LinkIcon>
                          )}
                        </PriceItemDetails>
                      </PriceItem>
                    ))
                  }
                </PriceItemList>
              </PriceInfoSection>
            )}
            
            {/* 외부 웹사이트 가격 정보 */}
            {(product.aiAnalysisData?.webPriceInfo?.length ?? 0) > 0 && (
              <PriceInfoSection>
                <PriceInfoTitle>온라인 가격</PriceInfoTitle>
                <PriceItemList>
                  {product.aiAnalysisData?.webPriceInfo?.map((info, index) => (
                    <PriceItem 
                      key={`web-${index}`} 
                      onClick={() => info.url && handleExternalLinkClick(info.url)}
                      clickable={!!info.url}
                    >
                      <PriceItemMain>
                        <PriceValue>{info.price.toLocaleString()}원</PriceValue>
                        <ConditionTag condition={info.condition || 'best'}>
                          {getConditionText(info.condition || 'best')}
                        </ConditionTag>
                      </PriceItemMain>
                      <PriceItemDetails>
                        <PriceTitle>{info.title || '제목 없음'}</PriceTitle>
                        <LinkIcon>
                          <FaExternalLinkAlt size={12} />
                        </LinkIcon>
                      </PriceItemDetails>
                    </PriceItem>
                  ))}
                </PriceItemList>
              </PriceInfoSection>
            )}
            
            {/* 유사 상품 정보 */}
            {(product.aiAnalysisData?.similarProducts?.length ?? 0) > 0 && (
              <PriceInfoSection>
                <PriceInfoTitle>유사 상품</PriceInfoTitle>
                <PriceItemList>
                  {product.aiAnalysisData?.similarProducts?.map((similar, index) => (
                    <PriceItem 
                      key={`similar-${index}`} 
                      onClick={() => handleProductLinkClick(similar.id)}
                      clickable={true}
                    >
                      <PriceItemMain>
                        <PriceValue>{similar.price.toLocaleString()}원</PriceValue>
                        <ConditionTag condition={similar.condition || 'unknown'}>
                          {getConditionText(similar.condition || 'unknown')}
                        </ConditionTag>
                      </PriceItemMain>
                      <PriceItemDetails>
                        <ProductTitleText>{similar.title}</ProductTitleText>
                        <LinkIcon>
                          <FaExternalLinkAlt size={12} />
                        </LinkIcon>
                      </PriceItemDetails>
                    </PriceItem>
                  ))}
                </PriceItemList>
              </PriceInfoSection>
            )}
            
            {/* 마지막 분석 시간 표시 */}
            {product.aiAnalysisData?.lastAnalyzedAt && (
              <AnalysisInfo>
                마지막 AI 분석: {new Date(product.aiAnalysisData.lastAnalyzedAt).toLocaleDateString()}
              </AnalysisInfo>
            )}
          </PriceInfoContainer>
        )}
      </PriceHistorySection>
      
      {/* 상품 설명 */}
      <DescriptionSection>
        <SectionTitle>상품 설명</SectionTitle>
        <ProductDescription>
          {product.content.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </ProductDescription>
      </DescriptionSection>
      
      {/* 관련 상품 */}
      {relatedProducts.length > 0 && (
        <RelatedProductsSection>
          <SectionTitle>관련 상품</SectionTitle>
          <RelatedProductsList>
            {relatedProducts.map(relatedProduct => (
              <RelatedProductItem 
                key={relatedProduct._id}
                to={`/product/${relatedProduct._id}`}
              >
                <RelatedProductImage>
                  {relatedProduct.imageUrl ? (
                    <img 
                      src={getImageUrl(relatedProduct.imageUrl)} 
                      alt={relatedProduct.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YyZjJmMiIvPjwvc3ZnPg==';
                      }}
                    />
                  ) : (
                    <NoImageText>이미지 없음</NoImageText>
                  )}
                </RelatedProductImage>
                <RelatedProductTitle>{relatedProduct.title}</RelatedProductTitle>
                <RelatedProductPrice>
                  {relatedProduct.price.toLocaleString()} 원
                </RelatedProductPrice>
              </RelatedProductItem>
            ))}
          </RelatedProductsList>
        </RelatedProductsSection>
      )}
      
      {/* 하단 고정 액션 버튼 */}
      <BottomActions>
        <ActionButton secondary onClick={handleShare}>
          공유하기
        </ActionButton>
        <ActionButton primary onClick={handleContact}>
          연락하기
        </ActionButton>
      </BottomActions>
    </DetailContainer>
  );
};

// 아이콘 회전 애니메이션
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// 스타일 컴포넌트
const DetailContainer = styled.div`
  max-width: 768px;
  margin: 0 auto;
  padding-bottom: 80px; // 하단 버튼 공간 확보
`;

const TopNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.white};
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.black};
`;

const ShareButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.black};
`;

const ImageSlider = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.gray[100]};
`;

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: ${({ theme }) => theme.colors.gray[100]};
`;

const NavButton = styled.button<{ left?: boolean; right?: boolean }>`
  position: absolute;
  top: 50%;
  ${({ left }) => left && 'left: 16px;'}
  ${({ right }) => right && 'right: 16px;'}
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.3);
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.5);
  }
`;

const ImagePagination = styled.div`
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
`;

const PaginationDot = styled.div<{ active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ active, theme }) => 
    active ? theme.colors.primary : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
`;

const SourceBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: ${({ theme }) => theme.colors.blue[600]};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  padding: 6px 12px;
  border-radius: 4px;
  z-index: 1;
`;

const NoImageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.gray[100]};
`;

const NoImageText = styled.span`
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const ProductInfoSection = styled.section`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const ProductTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.T2.fontSize};
  font-weight: ${({ theme }) => theme.typography.T2.fontWeight};
  font-family: ${({ theme }) => theme.typography.T2.fontFamily};
  margin-bottom: 16px;
  word-break: keep-all;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProductPrice = styled.p`
  font-size: ${({ theme }) => theme.typography.T1.fontSize};
  font-weight: ${({ theme }) => theme.typography.T1.fontWeight};
  font-family: ${({ theme }) => theme.typography.T1.fontFamily};
  color: ${({ theme }) => theme.colors.black};
`;

const LikeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.gray[600]};
  
  &:hover {
    color: ${({ theme }) => theme.colors.red[600]};
  }
`;

const LikeCount = styled.span`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  margin-left: 6px;
`;

const ProductStatusInfo = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const StatusBadge = styled.span<{ available: boolean }>`
  display: inline-block;
  padding: 6px 12px;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  background-color: ${({ available, theme }) => 
    available ? theme.colors.green[600] : theme.colors.gray[300]};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 50px;
`;

const ConditionBadge = styled.span<{ condition: string }>`
  display: inline-block;
  padding: 6px 12px;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  background-color: ${({ condition, theme }) => {
    if (condition === 'best') return theme.colors.green[600];
    if (condition === 'good') return theme.colors.blue[600];
    if (condition === 'soso') return theme.colors.purple[300];
    if (condition === 'bad') return theme.colors.red[300];
    if (condition === 'worst') return theme.colors.red[600];
    return theme.colors.gray[300];
  }};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 50px;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 6px 12px;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  background-color: ${({ theme }) => theme.colors.purple[100]};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 50px;
`;

const DetailInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailInfoRow = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
`;

const DetailInfoLabel = styled.span`
  width: 80px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const DetailInfoValue = styled.span`
  color: ${({ theme }) => theme.colors.black};
`;

const SellerSection = styled.section`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const SellerTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  margin-bottom: 16px;
`;

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
`;

const SellerAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const SellerDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SellerName = styled.span`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.black};
`;

const MannerScore = styled.span`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.green[600]};
`;

const SellerLocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
`;

const SellerLocation = styled.span`
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
`;

const DescriptionSection = styled.section`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  margin-bottom: 16px;
`;

const ProductDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: keep-all;
  
  p {
    margin-bottom: 12px;
  }
`;

const RelatedProductsSection = styled.section`
  padding: 20px;
`;

const RelatedProductsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const RelatedProductItem = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.black};
  display: flex;
  flex-direction: column;
`;

const RelatedProductImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  margin-bottom: 8px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RelatedProductTitle = styled.p`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RelatedProductPrice = styled.p`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.black};
`;

const BottomActions = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  
  @media (min-width: 768px) {
    max-width: 768px;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const ActionButton = styled.button<{ primary?: boolean; secondary?: boolean }>`
  flex: ${({ secondary }) => secondary ? '0.5' : '1'};
  padding: 14px 0;
  border-radius: 8px;
  border: none;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: pointer;
  transition: all 0.2s;
  
  background-color: ${({ theme, primary, secondary }) => 
    primary ? theme.colors.primary : 
    secondary ? theme.colors.white : theme.colors.gray[300]};
  
  color: ${({ theme, primary, secondary }) => 
    primary ? theme.colors.white : 
    secondary ? theme.colors.black : theme.colors.black};
  
  border: ${({ theme, secondary }) => 
    secondary ? `1px solid ${theme.colors.gray[300]}` : 'none'};
  
  &:hover {
    background-color: ${({ theme, primary, secondary }) => 
      primary ? theme.colors.purple[300] : 
      secondary ? theme.colors.gray[100] : theme.colors.gray[200]};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 20px;
  text-align: center;
  
  color: ${({ theme }) => theme.colors.red[600]};
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
`;

// 가격 이력 관련 스타일 컴포넌트
const PriceHistorySection = styled.section`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const AnalyzeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.purple[300]};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RotatingIcon = styled.span`
  display: inline-block;
  animation: ${rotate} 1.5s linear infinite;
`;

const EmptyPriceHistory = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  padding: 20px 0;
`;

const PriceInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PriceInfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PriceInfoTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.primary};
`;

const PriceItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PriceItem = styled.div<{ clickable: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  cursor: ${({ clickable }) => clickable ? 'pointer' : 'default'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ clickable, theme }) => 
      clickable ? theme.colors.purple[100] : theme.colors.gray[100]};
  }
`;

const PriceItemMain = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PriceValue = styled.span`
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  color: ${({ theme }) => theme.colors.black};
`;

const ConditionTag = styled.span<{ condition: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
  font-weight: ${({ theme }) => theme.typography.T7.fontWeight};
  font-family: ${({ theme }) => theme.typography.T7.fontFamily};
  background-color: ${({ condition, theme }) => {
    if (condition === 'best') return theme.colors.green[600];
    if (condition === 'good') return theme.colors.blue[600];
    if (condition === 'soso') return theme.colors.purple[300];
    if (condition === 'bad') return theme.colors.red[300];
    if (condition === 'worst') return theme.colors.red[600];
    return theme.colors.gray[300];
  }};
  color: ${({ theme }) => theme.colors.white};
`;

const PriceItemDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const PriceSource = styled.span`
  flex: 1;
`;

const PriceDate = styled.span`
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const LinkIcon = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

const ProductTitleText = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AnalysisInfo = styled.p`
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-align: right;
  margin-top: 8px;
`;

const PriceTitle = styled.span`
  flex: 1;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

export default ProductDetailPage;