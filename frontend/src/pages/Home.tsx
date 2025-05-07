import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAppSelector } from '../store/hooks';
import axios from 'axios';

// FontAwesome 아이콘 임포트
import { 
  FaSearch, 
  FaBicycle,
  FaSnowflake,
  FaLaptop,
  FaBook,
  FaTicketAlt,
  FaCouch,
  FaFileAlt,
  FaEllipsisH,
  FaImage
} from 'react-icons/fa';

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
}

interface EverytimePost {
  _id: string;
  제목: string;
  내용: string;
  작성자: string;
  created_at: string;
  이미지: string;
  URL: string;
}

const Home: React.FC = () => {
  const { isLoggedIn } = useAppSelector(state => state.auth);
  const [featuredProducts, setFeaturedProducts] = useState<HuntItem[]>([]);
  const [recentProducts, setRecentProducts] = useState<HuntItem[]>([]);
  const [everytimePosts, setEverytimePosts] = useState<EverytimePost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // API URL 설정
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  useEffect(() => {
    // 모든 데이터를 병렬로 가져오기
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 인기 상품 가져오기 (조회수 기준 정렬)
        const featuredResponse = await axios.get(`${API_URL}/hunt`, {
          params: {
            limit: 4,
            sort: 'views',
            order: 'desc'
          }
        });
        
        // 응답 확인 로그
        console.log('인기 상품 응답:', featuredResponse.data);
        
        // 최근 등록 상품 가져오기 (최근 날짜순 정렬)
        const recentResponse = await axios.get(`${API_URL}/hunt`, {
          params: {
            limit: 4,
            sort: 'created_at',
            order: 'desc'
          }
        });
        
        // 응답 확인 로그
        console.log('최근 상품 응답:', recentResponse.data);
        
        // Everytime 데이터 가져오기
        const everytimeResponse = await axios.get(`${API_URL}/everytime`, {
          params: {
            limit: 4
          }
        });
        
        // 응답 확인 로그
        console.log('에브리타임 응답:', everytimeResponse.data);
        
        // 이미지 URL 확인 로그
        if (recentResponse.data.items && recentResponse.data.items.length > 0) {
          console.log('이미지 URL 예시:', recentResponse.data.items[0].imageUrl);
          console.log('변환된 이미지 URL:', getImageUrl(recentResponse.data.items[0].imageUrl));
        }
        
        setFeaturedProducts(featuredResponse.data.items || []);
        setRecentProducts(recentResponse.data.items || []);
        setEverytimePosts(everytimeResponse.data.posts || []);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [API_URL]);

  // 카테고리 아이콘 매핑
  const categoryIcons = [
    { icon: <FaBicycle size={24} />, name: '모빌리티', value: '모빌리티' },
    { icon: <FaSnowflake size={24} />, name: '냉장고', value: '냉장고' },
    { icon: <FaLaptop size={24} />, name: '전자제품', value: '전자제품' },
    { icon: <FaBook size={24} />, name: '책/문서', value: '책/문서' },
    { icon: <FaTicketAlt size={24} />, name: '기프티콘', value: '기프티콘' },
    { icon: <FaCouch size={24} />, name: '원룸', value: '원룸' },
    { icon: <FaFileAlt size={24} />, name: '족보', value: '족보' },
    { icon: <FaEllipsisH size={24} />, name: '기타', value: '기타' },
  ];

  // 상태에 따른 한국어 텍스트 반환
  const getConditionText = (condition: string): string => {
    const conditionMap: { [key: string]: string } = {
      'best': '미개봉 / 최상',
      'good': '상태 좋음',
      'soso': '양호 / 보통',
      'bad': '상태 별로',
      'worst': '부품용 / 미작동',
      'none': '알 수 없음',
      'unknown': '알 수 없음'
    };
    
    return conditionMap[condition] || '알 수 없음';
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 이미지 URL 확인
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl || imageUrl === "") {
      return 'https://via.placeholder.com/200?text=No+Image';
    }
    
    // 이미 완전한 URL인 경우
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // 앞에 /uploads가 있는 경우 (상대경로)
    if (imageUrl.startsWith('/uploads')) {
      return `${process.env.REACT_APP_URL || 'http://localhost:8080'}${imageUrl}`;
    }
    
    // 파일명만 있는 경우 (절대경로)
    return `${process.env.REACT_APP_URL || 'http://localhost:8080'}/uploads/${imageUrl}`;
  };

  return (
    <HomeContainer>
      {/* 히어로 섹션 */}
      <HeroSection>
        <HeroContent>
          <HeroTitle>캠퍼스에서 찾는 믿을 수 있는 거래</HeroTitle>
          <HeroSubtitle>
            HUN:ter에서 학교 내 중고거래를 더 쉽고 안전하게 시작하세요
          </HeroSubtitle>
          
          <SearchBar>
            <SearchIconWrapper>
              <FaSearch color="#A332FF" size={20} />
            </SearchIconWrapper>
            <SearchInput placeholder="찾으시는 상품을 검색해보세요" />
            <SearchButton>검색</SearchButton>
          </SearchBar>
          
          {!isLoggedIn && (
            <CTAButtons>
              <LoginButton to="/login">로그인</LoginButton>
              <RegisterButton to="/register">회원가입</RegisterButton>
            </CTAButtons>
          )}
        </HeroContent>
      </HeroSection>

      {/* 카테고리 섹션 */}
      <SectionContainer>
        <SectionTitle>카테고리</SectionTitle>
        <CategoryGrid>
          {categoryIcons.map((category, index) => (
            <CategoryItem key={category.value} to={`/dashboard?category=${category.value}`}>
              <IconWrapper>
                {category.icon}
              </IconWrapper>
              <CategoryName>{category.name}</CategoryName>
            </CategoryItem>
          ))}
        </CategoryGrid>
      </SectionContainer>

      {/* 인기 상품 섹션 */}
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>인기 상품</SectionTitle>
          <ViewAllLink to="/dashboard">전체보기</ViewAllLink>
        </SectionHeader>
        
        {isLoading ? (
          <LoadingMessage>상품을 불러오는 중입니다...</LoadingMessage>
        ) : featuredProducts.length === 0 ? (
          <EmptyMessage>등록된 상품이 없습니다.</EmptyMessage>
        ) : (
          <ProductGrid>
            {featuredProducts.map(product => (
              <ProductCard key={product._id} to={`/product/${product._id}`}>
                <ProductImageWrapper>
                  {product.imageUrl ? (
                    <ProductImage 
                      src={getImageUrl(product.imageUrl)} 
                      alt={product.title} 
                      onError={(e) => {
                        // 이미지 로드 실패 시 placeholder로 대체
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Image+Error';
                      }}
                    />
                  ) : (
                    <NoImage>
                      <FaImage size={32} color="#DFDFDF" />
                    </NoImage>
                  )}
                  {product.isFromEverytime && (
                    <SourceBadge>에브리타임</SourceBadge>
                  )}
                </ProductImageWrapper>
                <ProductDetails>
                  <ProductTitle>{product.title}</ProductTitle>
                  <ProductPrice>{product.price.toLocaleString()}원</ProductPrice>
                  <ProductMeta>
                    <ProductInfoItem>
                      <ProductInfoLabel>상태:</ProductInfoLabel>
                      <ProductInfoValue>{getConditionText(product.condition)}</ProductInfoValue>
                    </ProductInfoItem>
                    {product.views !== undefined && (
                      <ProductInfoItem>
                        <ProductInfoLabel>조회:</ProductInfoLabel>
                        <ProductInfoValue>{product.views}</ProductInfoValue>
                      </ProductInfoItem>
                    )}
                  </ProductMeta>
                  <SellerName>{product.author}</SellerName>
                </ProductDetails>
              </ProductCard>
            ))}
          </ProductGrid>
        )}
      </SectionContainer>

      {/* 에브리타임 게시글 섹션 */}
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>에브리타임 최신글</SectionTitle>
          <ViewAllLink to="/everytime">전체보기</ViewAllLink>
        </SectionHeader>
        
        {isLoading ? (
          <LoadingMessage>게시글을 불러오는 중입니다...</LoadingMessage>
        ) : everytimePosts.length === 0 ? (
          <EmptyMessage>등록된 게시글이 없습니다.</EmptyMessage>
        ) : (
          <EverytimeGrid>
            {everytimePosts.map(post => (
              <EverytimeCard key={post._id} to={`/everytime/${post._id}`}>
                <EverytimeHeader>
                  <EverytimeTitle>{post.제목}</EverytimeTitle>
                </EverytimeHeader>
                <EverytimeContent>{post.내용.length > 100 ? `${post.내용.substring(0, 100)}...` : post.내용}</EverytimeContent>
                <EverytimeMeta>
                  <EverytimeAuthor>{post.작성자}</EverytimeAuthor>
                  <EverytimeDate>{formatDate(post.created_at)}</EverytimeDate>
                </EverytimeMeta>
              </EverytimeCard>
            ))}
          </EverytimeGrid>
        )}
      </SectionContainer>

      {/* 최근 등록 상품 섹션 */}
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>최근 등록 상품</SectionTitle>
          <ViewAllLink to="/dashboard">전체보기</ViewAllLink>
        </SectionHeader>
        
        {isLoading ? (
          <LoadingMessage>상품을 불러오는 중입니다...</LoadingMessage>
        ) : recentProducts.length === 0 ? (
          <EmptyMessage>등록된 상품이 없습니다.</EmptyMessage>
        ) : (
          <ProductGrid>
            {recentProducts.map(product => (
              <ProductCard key={product._id} to={`/product/${product._id}`}>
                <ProductImageWrapper>
                  {product.imageUrl ? (
                    <ProductImage 
                      src={getImageUrl(product.imageUrl)} 
                      alt={product.title} 
                      onError={(e) => {
                        // 이미지 로드 실패 시 placeholder로 대체
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Image+Error';
                      }}
                    />
                  ) : (
                    <NoImage>
                      <FaImage size={32} color="#DFDFDF" />
                    </NoImage>
                  )}
                  {product.isFromEverytime && (
                    <SourceBadge>에브리타임</SourceBadge>
                  )}
                </ProductImageWrapper>
                <ProductDetails>
                  <ProductTitle>{product.title}</ProductTitle>
                  <ProductPrice>{product.price.toLocaleString()}원</ProductPrice>
                  <ProductMeta>
                    <ProductInfoItem>
                      <ProductInfoLabel>상태:</ProductInfoLabel>
                      <ProductInfoValue>{getConditionText(product.condition)}</ProductInfoValue>
                    </ProductInfoItem>
                    <ProductInfoItem>
                      <ProductInfoLabel>등록일:</ProductInfoLabel>
                      <ProductInfoValue>{new Date(product.created_at).toLocaleDateString()}</ProductInfoValue>
                    </ProductInfoItem>
                  </ProductMeta>
                  <SellerName>{product.author}</SellerName>
                </ProductDetails>
              </ProductCard>
            ))}
          </ProductGrid>
        )}
      </SectionContainer>

      {/* HUN:ter 소개 섹션 */}
      <InfoSection>
        <InfoContent>
          <InfoTitle>HUN:ter는 어떻게 다른가요?</InfoTitle>
          <InfoGrid>
            <InfoCard>
              <InfoCardTitle>학교 인증 시스템</InfoCardTitle>
              <InfoCardText>
                학교 이메일 인증을 통해 실제 학교 구성원 간의 거래만 이루어집니다.
              </InfoCardText>
            </InfoCard>
            <InfoCard>
              <InfoCardTitle>안전한 거래 시스템</InfoCardTitle>
              <InfoCardText>
                매너 점수 시스템과 리뷰 기능으로 신뢰할 수 있는 거래 환경을 제공합니다.
              </InfoCardText>
            </InfoCard>
            <InfoCard>
              <InfoCardTitle>편리한 캠퍼스 내 거래</InfoCardTitle>
              <InfoCardText>
                학교 내에서 직접 만나 거래할 수 있어 배송 걱정이 없습니다.
              </InfoCardText>
            </InfoCard>
          </InfoGrid>
        </InfoContent>
      </InfoSection>
    </HomeContainer>
  );
};

export default Home;

// 스타일 컴포넌트
const HomeContainer = styled.div`
  width: 100%;
`;

const HeroSection = styled.section`
  background-color: ${({ theme }) => theme.colors.purple[100]};
  padding: 80px 0;
  margin-bottom: 60px;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.T1.fontSize};
  font-weight: ${({ theme }) => theme.typography.T1.fontWeight};
  font-family: ${({ theme }) => theme.typography.T1.fontFamily};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 16px;
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.T3.fontSize};
  font-weight: ${({ theme }) => theme.typography.T3.fontWeight};
  font-family: ${({ theme }) => theme.typography.T3.fontFamily};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 32px;
`;

const SearchBar = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 50px;
  padding: 8px 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const SearchIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  padding: 8px 16px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  
  &:focus {
    outline: none;
  }
`;

const SearchButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 50px;
  padding: 8px 24px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.purple[300]};
  }
`;

const CTAButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
`;

const LoginButton = styled(Link)`
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50px;
  padding: 12px 32px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.purple[100]};
  }
`;

const RegisterButton = styled(Link)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 50px;
  padding: 12px 32px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.purple[300]};
  }
`;

const SectionContainer = styled.section`
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 0 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.T2.fontSize};
  font-weight: ${({ theme }) => theme.typography.T2.fontWeight};
  font-family: ${({ theme }) => theme.typography.T2.fontFamily};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 24px;
`;

const ViewAllLink = styled(Link)`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CategoryItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.purple[100]};
    transform: translateY(-4px);
  }
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  background-color: ${({ theme }) => theme.colors.purple[100]};
  border-radius: 50%;
  margin-bottom: 12px;
  
  & > svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CategoryName = styled.span`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.black};
  margin-top: 12px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled(Link)`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.black};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
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
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.gray[100]};
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
`;

const ProductDetails = styled.div`
  padding: 16px;
`;

const ProductTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductPrice = styled.p`
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 12px;
`;

const ProductMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
`;

const ProductInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProductInfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const ProductInfoValue = styled.span`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.black};
`;

const SellerName = styled.p`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
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

// 에브리타임 관련 스타일 컴포넌트
const EverytimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EverytimeCard = styled(Link)`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.2s;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.black};
  display: flex;
  flex-direction: column;
  height: 200px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const EverytimeHeader = styled.div`
  margin-bottom: 12px;
`;

const EverytimeTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EverytimeContent = styled.p`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const EverytimeMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const EverytimeAuthor = styled.span`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
`;

const EverytimeDate = styled.span`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
`;

const InfoSection = styled.section`
  background-color: ${({ theme }) => theme.colors.purple[100]};
  padding: 60px 0;
  margin-bottom: 60px;
`;

const InfoContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const InfoTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.T2.fontSize};
  font-weight: ${({ theme }) => theme.typography.T2.fontWeight};
  font-family: ${({ theme }) => theme.typography.T2.fontFamily};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin-bottom: 40px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const InfoCardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 16px;
`;

const InfoCardText = styled.p`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`;