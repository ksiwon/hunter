import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import RadioGroup from "../components/RadioGroup/RadioGroup";
import BotButton from "../components/BotButton/BotButton";
import { useNavigate } from "react-router-dom";
import { MerchandiseProps } from "../types";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const categories = [
  "모빌리티",
  "냉장고",
  "전자제품",
  "책/문서",
  "기프티콘",
  "원룸/오피스텔",
  "기타",
];
const conditions = [
  "미개봉 / 최상",
  "상태 좋음",
  "양호 / 보통",
  "상태 별로",
  "부품용 / 고장",
];

const Sell: React.FC = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [sellerName, setSellerName] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setSellerName(storedUsername);
    }
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImages((prevImages) => [...prevImages, imageUrl]);
    }
  };

  const handlePostSubmit = async () => {
    if (!title || !category || !condition || !price || !description) {
      alert("모든 필드를 입력해주세요!");
      return;
    }

    if (!sellerName) {
      alert("로그인이 필요합니다!");
      navigate("/"); // Redirect to home or login page
      return;
    }

    const newPost: MerchandiseProps = {
      id: uuidv4(),
      imageSrc: images,
      title,
      status: "available",
      condition: convertConditionToType(condition),
      price,
      sellerName: sellerName,
      date: new Date().toISOString().split("T")[0],
      category: convertCategoryToType(category),
      description,
      deals: [],
    };

    try {
      // 서버로 데이터 전송
      await axios.post(`${BACKEND_URL}/api/merchandises`, newPost);
      alert("게시글이 등록되었습니다!");
      navigate("/content/all");
    } catch (error) {
      console.error("상품 업로드 실패:", error);
      alert("상품 업로드 중 오류가 발생했습니다.");
    }
  };

  const convertConditionToType = (value: string | null) => {
    const conditionMap: Record<
      string,
      "best" | "good" | "average" | "bad" | "very_bad"
    > = {
      "미개봉 / 최상": "best",
      "상태 좋음": "good",
      "양호 / 보통": "average",
      "상태 별로": "bad",
      "부품용 / 고장": "very_bad",
    };
    return conditionMap[value || "양호 / 보통"];
  };

  const convertCategoryToType = (value: string | null) => {
    const categoryMap: Record<
      string,
      | "mobility"
      | "refrigerator"
      | "electronics"
      | "books"
      | "gifticon"
      | "office"
      | "others"
    > = {
      "모빌리티": "mobility",
      "냉장고": "refrigerator",
      "전자제품": "electronics",
      "책/문서": "books",
      "기프티콘": "gifticon",
      "원룸/오피스텔": "office",
      "기타": "others",
    };
    return categoryMap[value || "기타"];
  };

  return (
    <SellWrapper>
      <HeaderToFormWrapper>
        <Header />
        <PageTitle>판매하기</PageTitle>
        <FormWrapper>
          <Section>
            <Label>제목</Label>
            <Input
              type="text"
              placeholder="제목을 입력해주세요."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Section>
          <Section>
            <Label>카테고리</Label>
            <RadioGroupWrapper>
              <RadioGroup options={categories} onChange={setCategory} />
            </RadioGroupWrapper>
          </Section>
          <Section>
            <Label>상태</Label>
            <RadioGroupWrapper>
              <RadioGroup options={conditions} onChange={setCondition} />
            </RadioGroupWrapper>
          </Section>
          <Section>
            <Label>판매 가격</Label>
            <Input
              type="number"
              placeholder="희망 판매가 (원)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Section>
          <Section>
            <Label>내용</Label>
            <TextArea
              placeholder="내용을 입력해주세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Section>
          <Section>
            <Label>사진</Label>
            <ImageUploadWrapper>
              {images.map((image, index) => (
                <UploadedImage key={index} src={image} alt={`Uploaded ${index + 1}`} />
              ))}
              <ImageUploadButton>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                <span>+</span>
              </ImageUploadButton>
            </ImageUploadWrapper>
          </Section>
        </FormWrapper>
      </HeaderToFormWrapper>
      <BotButton
        onPreviousClick={() => window.history.back()}
        onSubmitClick={handlePostSubmit}
        previousLabel="이전"
        submitLabel="게시글 등록"
      />
      <Footer />
    </SellWrapper>
  );
};

export default Sell;

/* Original styled-components */
const SellWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  gap: 64px;
  min-height: 100vh;
  width: 100%;
`;

const HeaderToFormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  width: 100%;
`;

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.T1.size};
  font-weight: ${({ theme }) => theme.typography.T1.weight};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1600px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
`;

const Label = styled.label`
  width: 120px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: 16px;
  font-size: ${({ theme }) => theme.typography.T5.size};
  font-weight: ${({ theme }) => theme.typography.T5.weight};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px 0 0 16px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-family: Pretendard;
  font-size: ${({ theme }) => theme.typography.T5.size};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  outline: none;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: ${({ theme }) => theme.typography.T5.size};
  font-family: Pretendard;
  height: 160px;
  resize: none;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  outline: none;
`;

const RadioGroupWrapper = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
`;

const ImageUploadWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  flex: 1;
`;

const UploadedImage = styled.img`
  width: 240px;
  height: 240px;
  object-fit: cover;
  border-radius: 16px;
`;

const ImageUploadButton = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 240px;
  height: 240px;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  border: none;
  cursor: pointer;
  span {
    font-size: 48px;
    color: ${({ theme }) => theme.colors.primary};
  }
  input {
    display: none;
  }
  border-radius: 16px;
`;
