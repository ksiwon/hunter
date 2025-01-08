// Home.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 임포트
import styled from "styled-components";
import Header from "../components/Header/Header";
import Navigation from "../components/Navigation/Navigation";
import SearchTab from "../components/SearchTab/SearchTab";
import Footer from "../components/Footer/Footer";

const Home: React.FC = () => {
  const navigate = useNavigate(); // useNavigate 선언
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);

  const handleCategoryChange = (category: string | null) => {
    setClickedCategory(category);
  };

  const handleSellButtonClick = () => {
    navigate("/sell"); // Sell 페이지로 이동
  };

  const handleMyDealClick = () => {
    navigate("/mydeal"); // My Deal 페이지로 이동 (예시)
  };

  // Updated onSearch handler
  const handleSearch = (searchTerm: string) => {
    if (searchTerm) {
      navigate(`/content/all?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <HomeWrapper>
      <HeaderIntroWrapper>
        <Header />

        {/* Intro Section */}
        <IntroSection>
          <TextWrapper>
            <SubText>
              헌 가치를 나누는 터, <Highlight>헌터</Highlight> 에서
            </SubText>
            <IntroText>
              새로운 의미를 발견하는 <Highlight>HUN:ter</Highlight> 가 되어보세요
            </IntroText>
          </TextWrapper>
          <ButtonWrapper>
            <ActionButton color="green" onClick={handleSellButtonClick}>
              <ActionIcon src="/assets/icons/sell.png" alt="Sell Icon" />
              판매하기
            </ActionButton>
            <ActionButton color="blue" onClick={handleMyDealClick}>
              <ActionIcon src="/assets/icons/my-deal.png" alt="My Deal Icon" />
              나의 거래
            </ActionButton>
          </ButtonWrapper>
        </IntroSection>
      </HeaderIntroWrapper>

      <SharedContainer>
        {/* Navigation */}
        <Navigation
          clickedCategory={clickedCategory}
          onCategoryChange={handleCategoryChange}
        />
        {/* Search Tab */}
        <SearchSection>
          <SearchTab onSearch={handleSearch} />
        </SearchSection>
      </SharedContainer>

      <Footer />
    </HomeWrapper>
  );
};

export default Home;

// Styled Components (unchanged)
const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0px;
  background-color: ${({ theme }) => theme.colors.purple[100]};
  min-height: 100vh;
`;

const HeaderIntroWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.purple[100]};
  width: 100%;
`;

const IntroSection = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 48px;
  width: 80%;
  gap: 64px;
`;

const TextWrapper = styled.div`
  flex-direction: column;
`;

const IntroText = styled.h1`
  font-size: ${({ theme }) => theme.typography.T3.size};
  font-weight: ${({ theme }) => theme.typography.T1.weight};
  font-family: "Pretendard";
  color: ${({ theme }) => theme.colors.black};
`;

const Highlight = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

const SubText = styled.p`
  font-size: ${({ theme }) => theme.typography.T4.size};
  font-weight: ${({ theme }) => theme.typography.T4.weight};
  font-family: "Pretendard";
  color: ${({ theme }) => theme.colors.black};
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 32px;
`;

const ActionButton = styled.button<{ color: "green" | "blue" }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ color, theme }) =>
    color === "green" ? theme.colors.green[500] : theme.colors.blue[500]};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 8px;
  padding: 16px 16px 12px 16px;
  width: 144px;
  font-size: ${({ theme }) => theme.typography.T5.size};
  font-weight: ${({ theme }) => theme.typography.T4.weight};
  cursor: pointer;
  box-shadow: 0px 8px 8px rgba(0, 0, 0, 0.25);
  transition: background-color 0.3s ease;
  gap: 16px; /* 아이콘과 텍스트 간 간격 */

  &:hover {
    background-color: ${({ color, theme }) =>
    color === "green" ? theme.colors.green[500] : theme.colors.blue[500]}; /* Slightly darker on hover */
  }
`;

const ActionIcon = styled.img`
  width: 80px;
  height: 80px;
`;

const SearchSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const SharedContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%; /* 화면 전체 너비 */
  margin: 0 auto; /* 가운데 정렬 */
  gap: 32px;
  padding: 48px 0;
  background-color: ${({ theme }) => theme.colors.purple[400]};
  box-shadow: ${(props) => "16px 0 16px 0 rgba(0, 0, 0, 0.4)"};
`;
