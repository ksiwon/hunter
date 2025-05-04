import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAppSelector } from '../store/hooks';

// FontAwesome 아이콘 임포트
import { 
  FaSearch, 
  FaMobile, 
  FaTshirt,
  FaBook,
  FaCouch,
  FaGamepad,
  FaRunning,
  FaSprayCan,
  FaCoffee,
  FaMapMarkerAlt,
  FaStar 
} from 'react-icons/fa';

interface ProductItem {
  id: string;
  title: string;
  price: number;
  image: string;
  seller: string;
  rating: number;
  location: string;
}

const Home: React.FC = () => {
  const { isLoggedIn } = useAppSelector(state => state.auth);
  const [featuredProducts, setFeaturedProducts] = useState<ProductItem[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 실제로는 API 호출로 대체
    const fetchProducts = async () => {
      try {
        // 임시 데이터
        const mockFeaturedProducts = [
          {
            id: '1',
            title: '에어팟 프로 2세대 (미개봉)',
            price: 280000,
            image: 'https://via.placeholder.com/200',
            seller: '애플러버',
            rating: 4.8,
            location: '신축학사'
          },
          {
            id: '2',
            title: '맥북 프로 M1 13인치 (상태 A급)',
            price: 1200000,
            image: 'https://via.placeholder.com/200',
            seller: '맥북장인',
            rating: 4.9,
            location: '대학원동'
          },
          {
            id: '3',
            title: '아이패드 에어 5세대 (사용감 있음)',
            price: 650000,
            image: 'https://via.placeholder.com/200',
            seller: '학생판매자',
            rating: 4.5,
            location: '교양분관'
          },
          {
            id: '4',
            title: '갤럭시 워치 5 프로 (풀박스)',
            price: 320000,
            image: 'https://via.placeholder.com/200',
            seller: '시계수집가',
            rating: 4.7,
            location: '서측기숙사'
          }
        ];

        setFeaturedProducts(mockFeaturedProducts);
        setRecentProducts([...mockFeaturedProducts].reverse());
        setIsLoading(false);
      } catch (error) {
        console.error("상품을 불러오는 중 오류가 발생했습니다:", error);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 카테고리 아이콘 매핑
  const categoryIcons = [
    { icon: <FaMobile size={24} />, name: '전자기기' },
    { icon: <FaTshirt size={24} />, name: '의류' },
    { icon: <FaBook size={24} />, name: '도서' },
    { icon: <FaCouch size={24} />, name: '가구/인테리어' },
    { icon: <FaGamepad size={24} />, name: '취미/게임' },
    { icon: <FaRunning size={24} />, name: '스포츠/레저' },
    { icon: <FaSprayCan size={24} />, name: '뷰티/미용' },
    { icon: <FaCoffee size={24} />, name: '생활/주방' },
  ];

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
            <CategoryItem key={index}>
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
        ) : (
          <ProductGrid>
            {featuredProducts.map(product => (
              <ProductCard key={product.id} to={`/product/${product.id}`}>
                <ProductImage src={product.image} alt={product.title} />
                <ProductDetails>
                  <ProductTitle>{product.title}</ProductTitle>
                  <ProductPrice>{product.price.toLocaleString()}원</ProductPrice>
                  <ProductMeta>
                    <ProductLocation>
                      <FaMapMarkerAlt size={14} color="#666666" />
                      <span>{product.location}</span>
                    </ProductLocation>
                    <ProductRating>
                      <FaStar size={14} color="#FFD700" />
                      <span>{product.rating}</span>
                    </ProductRating>
                  </ProductMeta>
                  <SellerName>{product.seller}</SellerName>
                </ProductDetails>
              </ProductCard>
            ))}
          </ProductGrid>
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
        ) : (
          <ProductGrid>
            {recentProducts.map(product => (
              <ProductCard key={product.id} to={`/product/${product.id}`}>
                <ProductImage src={product.image} alt={product.title} />
                <ProductDetails>
                  <ProductTitle>{product.title}</ProductTitle>
                  <ProductPrice>{product.price.toLocaleString()}원</ProductPrice>
                  <ProductMeta>
                    <ProductLocation>
                      <FaMapMarkerAlt size={14} color="#666666" />
                      <span>{product.location}</span>
                    </ProductLocation>
                    <ProductRating>
                      <FaStar size={14} color="#FFD700" />
                      <span>{product.rating}</span>
                    </ProductRating>
                  </ProductMeta>
                  <SellerName>{product.seller}</SellerName>
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
  background-color: white;
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
  color: white;
  border: none;
  border-radius: 50px;
  padding: 8px 24px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: pointer;
  
  &:hover {
    background-color: #8A29D7;
  }
`;

const CTAButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
`;

const LoginButton = styled(Link)`
  background-color: white;
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
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 32px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background-color: #8A29D7;
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

const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 8px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  
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
  background-color: white;
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

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
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
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ProductLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
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
  background-color: white;
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

export default Home;