import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

// 아이콘 임포트
import { 
  FaHeart, 
  FaComment, 
  FaSearch, 
  FaBicycle,
  FaSnowflake,
  FaLaptop,
  FaBook,
  FaTicketAlt,
  FaCouch,
  FaFileAlt,
  FaEllipsisH,
  FaImage,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaExternalLinkAlt
} from 'react-icons/fa';

// 타입 정의
interface SimilarProduct {
  id: string;
  title: string;
  price: number;
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
  seller: string;
  url: string;
  confidence: number;
}

interface HuntItem {
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
  isFromEverytime?: boolean;
  views?: number;
  likes?: number;
  aiAnalysisData?: {  // 옵셔널로 선언
    confidence?: number;  // 옵셔널로 선언
    similarProducts?: SimilarProduct[];
    priceHistory?: PriceHistoryItem[];
    webPriceInfo?: WebPriceInfo[];
    lastAnalyzedAt?: string;
  };
}

interface PriceHistoryContainerProps {
  product: HuntItem;
}

interface ToggleProps {
  isOn: boolean;
  onChange: () => void;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface PriceHistoryContainerProps {
  product: HuntItem;
}

const Toggle: React.FC<ToggleProps> = ({ isOn, onChange }) => {
  return (
    <ToggleContainer>
      <ToggleInput 
        type="checkbox" 
        checked={isOn} 
        onChange={onChange} 
      />
      <ToggleSlider isOn={isOn} />
    </ToggleContainer>
  );
};

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const [products, setProducts] = useState<HuntItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(searchParams.get('status') === 'active');
  
  // 페이지네이션 상태
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: parseInt(searchParams.get('page') || '1'),
    totalPages: 1,
    totalItems: 0
  });
  
  // 한 페이지에 표시할 항목 수
  const ITEMS_PER_PAGE = 10;

  // 카테고리 옵션
  const categories = [
    { value: '모빌리티', icon: <FaBicycle size={20} /> },
    { value: '냉장고', icon: <FaSnowflake size={20} /> },
    { value: '전자제품', icon: <FaLaptop size={20} /> },
    { value: '책/문서', icon: <FaBook size={20} /> },
    { value: '기프티콘', icon: <FaTicketAlt size={20} /> },
    { value: '원룸', icon: <FaCouch size={20} /> },
    { value: '족보', icon: <FaFileAlt size={20} /> },
    { value: '기타', icon: <FaEllipsisH size={20} /> },
  ];

  const NoImageComponent = () => (
    <NoImage>
      <FaImage size={48} color="#AFAFAF" />
      <span>이미지 없음</span>
    </NoImage>
  );

  // 가격 이력 및 유사 상품 컴포넌트
  const PriceHistoryContainer: React.FC<PriceHistoryContainerProps> = ({ product }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const navigate = useNavigate();
    
    // 상품 정보 다시 분석 요청
    const handleReanalyze = async () => {
      if (isAnalyzing) return;
      
      setIsAnalyzing(true);
      try {
        const response = await axios.post(`${API_URL}/hunt/${product._id}/reanalyze`);
        if (response.data.success) {
          alert('상품 정보가 다시 분석되었습니다.');
          window.location.reload(); // 페이지 새로고침
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
    
    // 상품 링크로 이동
    const handleProductLinkClick = (event: React.MouseEvent, url?: string, huntItemId?: string) => {
      event.preventDefault();
      event.stopPropagation();
      
      if (huntItemId) {
        navigate(`/product/${huntItemId}`);
      } else if (url) {
        window.open(url, '_blank');
      }
    };
    
    // 가격 이력 확인 - 옵셔널 체이닝 사용
    const hasPriceHistory = product.aiAnalysisData?.priceHistory && 
                           product.aiAnalysisData.priceHistory.length > 0;
                           
    // 웹 가격 정보 확인 - 옵셔널 체이닝 사용
    const hasWebPriceInfo = product.aiAnalysisData?.webPriceInfo && 
                           product.aiAnalysisData.webPriceInfo.length > 0;
                           
    // 유사 상품 정보 확인 - 옵셔널 체이닝 사용
    const hasSimilarProducts = product.aiAnalysisData?.similarProducts && 
                              product.aiAnalysisData.similarProducts.length > 0;
  
    // AI 분석 신뢰도 확인 - 옵셔널 체이닝 사용
    const hasHighConfidence = product.aiAnalysisData?.confidence !== undefined && 
                             product.aiAnalysisData.confidence > 0.7;
  
    // 가격 이력이 없고 분석 정보도 없는 경우
    if (!hasPriceHistory && !hasWebPriceInfo && !hasSimilarProducts) {
      return (
        <PriceHistoryContainerStyled>
          <PriceHistoryHeader>
            <PriceHistoryTitle>최근 거래가</PriceHistoryTitle>
            {product.isFromEverytime && (
              <AnalyzeButton onClick={handleReanalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <RotatingIcon>
                    <FaSync size={12} />
                  </RotatingIcon>
                ) : (
                  <FaSync size={12} />
                )}
                {isAnalyzing ? '분석 중...' : 'AI 분석'}
              </AnalyzeButton>
            )}
          </PriceHistoryHeader>
          
          <EmptyHistoryMessage>
            거래 가격 정보가 없습니다.
            {product.isFromEverytime && ' AI 분석 버튼을 클릭하여 가격 정보를 찾아보세요.'}
          </EmptyHistoryMessage>
        </PriceHistoryContainerStyled>
      );
    }
  
    // 가격 이력이 있는 경우
    return (
      <PriceHistoryContainerStyled>
        <PriceHistoryHeader>
          <PriceHistoryTitle>최근 거래가</PriceHistoryTitle>
          {product.isFromEverytime && (
            <AnalyzeButton onClick={handleReanalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <RotatingIcon>
                  <FaSync size={12} />
                </RotatingIcon>
              ) : (
                <FaSync size={12} />
              )}
              {isAnalyzing ? '분석 중...' : '다시 분석'}
            </AnalyzeButton>
          )}
          {hasHighConfidence && (
            <AiConfidenceBadge>AI 신뢰도 높음</AiConfidenceBadge>
          )}
        </PriceHistoryHeader>
        
        {/* 내부 거래 가격 이력 - 안전한 옵셔널 체이닝 사용 */}
        {product.aiAnalysisData?.priceHistory
          ?.filter(history => history.source === '학생 거래')
          .slice(0, 3)
          .map((history, index) => (
            <PriceEntry key={`history-${index}`} onClick={(e) => handleProductLinkClick(e, undefined, history.huntItemId)}>
              <Price>{history.price.toLocaleString()} 원</Price>
              <PriceBadge type={history.condition}>{getConditionText(history.condition)}</PriceBadge>
              <SourceInfo>
                <SourceName>{history.source}</SourceName>
                {history.huntItemId && <FaExternalLinkAlt size={10} />}
              </SourceInfo>
            </PriceEntry>
          ))
        }
        
        {/* 외부 웹사이트 가격 정보 - 안전한 옵셔널 체이닝 사용 */}
        {product.aiAnalysisData?.webPriceInfo
          ?.slice(0, 3)
          .map((info, index) => (
            <PriceEntry key={`web-${index}`} onClick={(e) => handleProductLinkClick(e, info.url)}>
              <Price>{info.price.toLocaleString()} 원</Price>
              <PriceBadge type={info.condition || 'good'}>{getConditionText(info.condition || 'good')}</PriceBadge>
              <SourceInfo>
                <SourceName>{info.seller}</SourceName>
                <FaExternalLinkAlt size={10} />
              </SourceInfo>
            </PriceEntry>
          ))
        }
        
        {/* 가격 정보 없는 경우 유사 상품 표시 - 안전한 옵셔널 체이닝 사용 */}
        {!hasPriceHistory && !hasWebPriceInfo && hasSimilarProducts && 
          product.aiAnalysisData?.similarProducts
          ?.slice(0, 3)
          .map((similar, index) => (
            <PriceEntry key={`similar-${index}`} onClick={(e) => handleProductLinkClick(e, undefined, similar.id)}>
              <Price>{similar.price.toLocaleString()} 원</Price>
              <PriceBadge type="similar">유사 상품</PriceBadge>
              <SourceInfo>
                <SourceName>{similar.title.substring(0, 10)}{similar.title.length > 10 ? '...' : ''}</SourceName>
                <FaExternalLinkAlt size={10} />
              </SourceInfo>
            </PriceEntry>
          ))
        }
        
        {/* 마지막 분석 시간 표시 - 안전한 옵셔널 체이닝 사용 */}
        {product.aiAnalysisData?.lastAnalyzedAt && (
          <AnalysisInfo>
            마지막 분석: {new Date(product.aiAnalysisData.lastAnalyzedAt).toLocaleString()}
          </AnalysisInfo>
        )}
      </PriceHistoryContainerStyled>
    );
  };

  // URL 쿼리 파라미터 업데이트
  const updateQueryParams = (params: Record<string, string | number | null>) => {
    // 현재 URL 쿼리 파라미터 복사
    const newSearchParams = new URLSearchParams(location.search);
    
    // 파라미터 업데이트
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '') {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value.toString());
      }
    });
    
    // 새 URL로 이동 (강제로 페이지 다시 로드하지 않음)
    navigate({
      pathname: location.pathname,
      search: newSearchParams.toString()
    }, { replace: false });
    
    console.log('쿼리 파라미터 업데이트:', newSearchParams.toString());
  };

  // 상품 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // 기본 쿼리 파라미터
        const params: Record<string, any> = {
          sort: 'created_at',
          order: 'desc',
          page: pagination.currentPage,
          limit: ITEMS_PER_PAGE,
        };
        
        // 검색어 있으면 추가
        if (searchTerm) {
          params.keyword = searchTerm;
        }
        
        // 카테고리 필터 있으면 추가
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        
        // 판매 가능 상품만 필터링
        if (showOnlyAvailable) {
          params.status = 'active';
        }
        
        const response = await axios.get(`${API_URL}/hunt`, { params });
        
        if (response.data) {
          setProducts(response.data.items || []);
          setPagination({
            currentPage: response.data.currentPage || 1,
            totalPages: response.data.totalPages || 1,
            totalItems: response.data.totalItems || 0
          });
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('상품 목록을 불러오는 중 오류가 발생했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [pagination.currentPage, searchTerm, selectedCategory, showOnlyAvailable]);

  useEffect(() => {
    // URL 쿼리 파라미터 변경 확인
    console.log('현재 URL 쿼리 파라미터:', location.search);
    console.log('검색어 상태:', searchTerm);
    console.log('카테고리 상태:', selectedCategory);
    console.log('거래 가능 필터 상태:', showOnlyAvailable);
    console.log('현재 페이지:', pagination.currentPage);
  }, [location.search, searchTerm, selectedCategory, showOnlyAvailable, pagination.currentPage]);

  useEffect(() => {
    // URL에서 파라미터 가져오기
    const params = new URLSearchParams(location.search);
    const keywordParam = params.get('keyword');
    const categoryParam = params.get('category');
    const statusParam = params.get('status');
    const pageParam = params.get('page');
    
    // 로컬 상태 업데이트 (의존성 배열에 location.search가 있으므로 무한 루프 방지 필요)
    if (keywordParam !== null && keywordParam !== searchTerm) {
      setSearchTerm(keywordParam);
    }
    
    if (categoryParam !== null && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
    
    if (statusParam === 'active' && !showOnlyAvailable) {
      setShowOnlyAvailable(true);
    } else if (statusParam !== 'active' && showOnlyAvailable) {
      setShowOnlyAvailable(false);
    }
    
    if (pageParam !== null) {
      const page = parseInt(pageParam);
      if (!isNaN(page) && page !== pagination.currentPage) {
        setPagination(prev => ({ ...prev, currentPage: page }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]); // location.search가 변경될 때만 실행

  // 페이지 변경 처리
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    updateQueryParams({ page: newPage });
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

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
      'best': '상태 최상',
      'good': '상태 좋음',
      'soso': '상태 양호',
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

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('검색어 적용:', searchTerm);
    // 명시적으로 검색 쿼리 파라미터 설정 및 페이지 1로 설정
    updateQueryParams({ 
      keyword: searchTerm || null, 
      page: 1 
    });
  };

  // 카테고리 필터 핸들러
  const handleCategoryFilter = (category: string) => {
    const newCategory = selectedCategory === category ? '' : category;
    setSelectedCategory(newCategory);
    updateQueryParams({ category: newCategory, page: 1 });
  };
  
  // 거래 가능 필터 핸들러
  const handleAvailableFilter = () => {
    const newValue = !showOnlyAvailable;
    setShowOnlyAvailable(newValue);
    updateQueryParams({ status: newValue ? 'active' : null, page: 1 });
  };

  // 페이지네이션 버튼 생성
  const renderPaginationButtons = () => {
    const buttons = [];
    const { currentPage, totalPages } = pagination;
    
    // 첫 페이지 버튼
    buttons.push(
      <PaginationButton 
        key="first"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        <FaChevronLeft />
        <FaChevronLeft />
      </PaginationButton>
    );
    
    // 이전 페이지 버튼
    buttons.push(
      <PaginationButton 
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FaChevronLeft />
      </PaginationButton>
    );
    
    // 페이지 번호 버튼
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationButton 
          key={i}
          onClick={() => handlePageChange(i)}
          active={i === currentPage}
        >
          {i}
        </PaginationButton>
      );
    }
    
    // 다음 페이지 버튼
    buttons.push(
      <PaginationButton 
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <FaChevronRight />
      </PaginationButton>
    );
    
    // 마지막 페이지 버튼
    buttons.push(
      <PaginationButton 
        key="last"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <FaChevronRight />
        <FaChevronRight />
      </PaginationButton>
    );
    
    return buttons;
  };

  return (
    <DashboardContainer>
      <Title>둘러보기</Title>
      
      {/* 카테고리 필터 */}
      <CategoryFilterContainer>
        {categories.map((category) => (
          <CategoryButton 
            key={category.value}
            selected={selectedCategory === category.value}
            onClick={() => handleCategoryFilter(category.value)}
          >
            <CategoryIcon>
              {category.icon}
            </CategoryIcon>
            <CategoryName>{category.value}</CategoryName>
          </CategoryButton>
        ))}
      </CategoryFilterContainer>
      
      {/* 검색 및 필터 */}
      <SearchContainer>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="검색어를 입력해주세요."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              console.log('검색어 입력:', e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e as unknown as React.FormEvent);
              }
            }}
          />
          <SearchButton type="submit">
            <FaSearch />
          </SearchButton>
        </SearchForm>
        
        <FilterToggle>
          <FilterLabel>거래 가능만 보기</FilterLabel>
          <Toggle 
            isOn={showOnlyAvailable} 
            onChange={handleAvailableFilter} 
          />
        </FilterToggle>
      </SearchContainer>
      
      {/* 상품 목록 */}
      {isLoading ? (
        <LoadingMessage>상품을 불러오는 중입니다...</LoadingMessage>
      ) : products.length === 0 ? (
        <EmptyMessage>등록된 상품이 없습니다.</EmptyMessage>
      ) : (
        <>
          {/* 검색 결과 요약 */}
          <ResultSummary>
            총 <strong>{pagination.totalItems}</strong>개의 상품이 있습니다.
            {searchTerm && <span> "{searchTerm}" 검색 결과입니다.</span>}
            {selectedCategory && <span> 카테고리: {selectedCategory}</span>}
          </ResultSummary>
          
          {/* 상품 목록 */}
          <ProductList>
            {products.map((product) => (
              <ProductCard key={product._id}>
                <ProductLink to={`/product/${product._id}`}>
                  <ProductImageWrapper>
                    {product.imageUrl ? (
                      <ProductImage 
                        src={getImageUrl(product.imageUrl)} 
                        alt={product.title}
                        onError={(e) => {
                          // 접근 가능한 데이터 URI나 로컬 기본 이미지 사용
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMmYyZjIiLz4KPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iIzk5OTk5OSI+SW1hZ2UgRXJyb3I8L3RleHQ+Cjwvc3ZnPg==';
                          console.log('이미지 로드 실패, 기본 이미지로 대체');
                        }}
                      />
                    ) : (
                      <NoImageComponent />
                    )}
                    {product.isFromEverytime && (
                      <SourceBadge>에브리타임</SourceBadge>
                    )}
                  </ProductImageWrapper>
                  
                  <ProductInfo>
                    <ProductTitle>{product.title}</ProductTitle>
                    <ProductPrice>{product.price.toLocaleString()} 원</ProductPrice>
                    
                    <ProductStatusInfo>
                      <StatusBadge available={product.status === 'active'}>
                        {product.status === 'active' ? '거래 가능' : '거래 불가'}
                      </StatusBadge>
                      <ConditionBadge condition={product.condition}>
                        {getConditionText(product.condition)}
                      </ConditionBadge>
                    </ProductStatusInfo>
                    
                    <SellerInfo>
                      <SellerName>{product.author}</SellerName>
                      <MannerScore>A+</MannerScore>
                    </SellerInfo>
                    
                    <ProductMeta>
                      <MetaItem>
                        <FaHeart color="#FA5858" />
                        <span>{product.likes || 0}</span>
                      </MetaItem>
                      <MetaItem>
                        <FaComment color="#666666" />
                        <span>{2}</span>
                      </MetaItem>
                      <ProductDate>{formatDate(product.created_at)}</ProductDate>
                    </ProductMeta>
                  </ProductInfo>
                  
                  {/* 가격 이력 컴포넌트 */}
                  <PriceHistoryContainer product={product} />
                </ProductLink>
              </ProductCard>
            ))}
          </ProductList>
          
          {/* 페이지네이션 */}
          <PaginationContainer>
            {renderPaginationButtons()}
          </PaginationContainer>
          
          {/* 페이지 정보 */}
          <PageInfo>
            {pagination.currentPage} / {pagination.totalPages} 페이지
          </PageInfo>
        </>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;

// 스타일 컴포넌트
const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.T2.fontSize};
  font-weight: ${({ theme }) => theme.typography.T2.fontWeight};
  font-family: ${({ theme }) => theme.typography.T2.fontFamily};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 32px;
`;

const CategoryFilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const CategoryButton = styled.button<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ selected, theme }) => 
    selected ? theme.colors.purple[100] : theme.colors.gray[100]};
  border: ${({ selected, theme }) => 
    selected ? `1px solid ${theme.colors.primary}` : 'none'};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.purple[100]};
  }
`;

const CategoryIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 8px;
  
  & > svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CategoryName = styled.span`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.black};
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 50px;
  overflow: hidden;
  width: 100%;
  max-width: 500px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  
  &:focus {
    outline: none;
  }
`;

const SearchButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: 14px 16px;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.purple[300]};
  }
`;

const ToggleContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:not(:checked) + span {
    background-color: ${({ theme }) => theme.colors.gray[300]};
  }
`;

const ToggleSlider = styled.span<{ isOn: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 24px;
  transition: 0.2s;
  
  &::before {
    content: "";
    position: absolute;
    height: 20px;
    width: 20px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: 0.2s;
    transform: ${({ isOn }) => isOn ? 'translateX(24px)' : 'translateX(0)'};
  }
`;

const FilterToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const ProductList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const ProductCard = styled.div`
  max-height: 240px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProductLink = styled(Link)`
  display: flex;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.black};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ProductImageWrapper = styled.div`
  width: 240px;
  height: 240px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const NoImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.gray[600]};
  
  svg {
    margin-bottom: 8px;
  }
`;

const SourceBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: ${({ theme }) => theme.colors.blue[600]};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
  font-weight: ${({ theme }) => theme.typography.T7.fontWeight};
  padding: 4px 8px;
  border-radius: 4px;
  z-index: 1;
`;

const ProductInfo = styled.div`
  flex: 1;
  padding: 0 16px 16px 16px;
  display: flex;
  flex-direction: column;
`;

const ProductTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.T3.fontSize};
  font-weight: ${({ theme }) => theme.typography.T3.fontWeight};
  font-family: ${({ theme }) => theme.typography.T3.fontFamily};
  margin-bottom: 8px;
`;

const ProductPrice = styled.p`
  font-size: ${({ theme }) => theme.typography.T2.fontSize};
  font-weight: ${({ theme }) => theme.typography.T2.fontWeight};
  font-family: ${({ theme }) => theme.typography.T2.fontFamily};
  margin-bottom: 16px;
`;

const ProductStatusInfo = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const StatusBadge = styled.span<{ available: boolean }>`
  display: inline-block;
  padding: 4px 12px;
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
  padding: 4px 12px;
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

const SellerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
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

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const ProductDate = styled.span`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-left: auto;
`;

const PriceHistoryContainerStyled = styled.div`
  width: 300px;
  flex-shrink: 0;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.purple[100]};
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PriceHistoryTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PriceEntry = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const Price = styled.span`
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  color: ${({ theme }) => theme.colors.black};
`;

const PriceBadge = styled.span<{ type: string }>`
  display: inline-block;
  padding: 4px 12px;
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
  font-weight: ${({ theme }) => theme.typography.T7.fontWeight};
  font-family: ${({ theme }) => theme.typography.T7.fontFamily};
  background-color: ${({ type, theme }) => {
    if (type === 'best') return theme.colors.green[600];
    if (type === 'good') return theme.colors.blue[600];
    if (type === 'bad') return theme.colors.red[300];
    if (type === 'similar') return theme.colors.purple[300];
    return theme.colors.gray[300];
  }};
  color: ${({ theme }) => theme.colors.white};
  border-radius: 50px;
`;

const AiConfidenceBadge = styled.span`
  display: inline-block;
  padding: 2px 6px;
  background-color: ${({ theme }) => theme.colors.green[600]};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
  border-radius: 4px;
  margin-left: 8px;
`;

const LoadingMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-align: center;
  padding: 40px 0;
`;

const EmptyMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-align: center;
  padding: 40px 0;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px 0 16px;
  gap: 8px;
`;

const PaginationButton = styled.button<{ active?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: none;
  background-color: ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.white};
  color: ${({ active, theme }) => 
    active ? theme.colors.white : theme.colors.black};
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${({ active, theme }) => 
      active ? theme.colors.primary : theme.colors.purple[100]};
  }
  
  svg {
    font-size: 12px;
  }
  
  & > svg + svg {
    margin-left: -4px;
  }
`;

const PageInfo = styled.div`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 40px;
`;

const ResultSummary = styled.div`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: 16px;
  
  strong {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  }
  
  span {
    margin-left: 8px;
  }
`;

const PriceHistoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const AnalyzeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
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
`;

const EmptyHistoryMessage = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  padding: 20px 0;
`;

const SourceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
  }
`;

const SourceName = styled.span`
  max-width: 80px;
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