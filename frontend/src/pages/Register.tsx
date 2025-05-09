import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { register, clearError } from '../store/slices/authSlice';
import { 
  FaUser, 
  FaUserTag, 
  FaEnvelope, 
  FaLock, 
  FaLockOpen, 
  FaMobile, 
  FaUniversity, 
  FaCreditCard,
  FaComment,
  FaStar,
  FaExclamationTriangle,
  FaGraduationCap,
  FaVenusMars,
  FaTags
} from 'react-icons/fa';

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phoneNumber: '',
    bankName: '은행명',
    accountNumber: '',
    openChatLink: '',
    // 새로 추가된 필드들
    major: '',
    grade: 1,
    gender: 'not_specified',
    interests: [] as string[]
  });
  
  // 관심사 입력을 위한 상태
  const [interestInput, setInterestInput] = useState('');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  useEffect(() => {
    // 이미 로그인 상태라면 홈으로 리다이렉트
    if (isLoggedIn) {
      navigate('/');
    }

    // 컴포넌트 언마운트 시 에러 초기화
    return () => {
      dispatch(clearError());
    };
  }, [isLoggedIn, navigate, dispatch]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      errors.username = '이름을 입력해주세요.';
    }
    
    if (!formData.nickname.trim()) {
      errors.nickname = '닉네임을 입력해주세요.';
    }
    
    if (!formData.email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      errors.email = '유효한 이메일 주소를 입력해주세요.';
    }
    
    if (!emailVerified) {
      errors.email = '이메일 인증을 완료해주세요.';
    }
    
    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
    }
    
    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = '인증번호를 입력해주세요.';
    }
    
    if (!phoneVerified) {
      errors.phoneNumber = '전화번호 인증을 완료해주세요.';
    }
    
    if (formData.bankName === '은행명') {
      errors.bankName = '은행을 선택해주세요.';
    }
    
    if (!formData.accountNumber.trim()) {
      errors.accountNumber = '계좌번호를 입력해주세요.';
    }
    
    if (!formData.openChatLink.trim()) {
      errors.openChatLink = '오픈채팅 링크를 입력해주세요.';
    }
    
    // 새로 추가된 필드들에 대한 유효성 검사
    if (!formData.major.trim()) {
      errors.major = '전공을 입력해주세요.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEmailVerify = () => {
    // 실제로는 이메일 인증 로직 구현
    setEmailVerified(true);
  };

  const handlePhoneVerify = () => {
    // 실제로는 전화번호 인증 로직 구현
    setPhoneVerified(true);
  };
  
  // 관심사 추가 함수
  const handleAddInterest = () => {
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()]
      });
      setInterestInput('');
    }
  };
  
  // 관심사 제거 함수
  const handleRemoveInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(item => item !== interest)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // 비밀번호 확인 필드 제거 (API로 보내지 않음)
    const { passwordConfirm, ...userData } = formData;
    
    dispatch(register(userData));
  };

  return (
    <Container>
      <Title>회원가입</Title>
      
      {error && (
        <ErrorMessage>
          <FaExclamationTriangle size={16} />
          <span>{error}</span>
        </ErrorMessage>
      )}
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>이름</Label>
          <InputWrapper error={!!formErrors.username}>
            <IconWrapper>
              <FaUser color="#A332FF" />
            </IconWrapper>
            <Input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="이름을 입력해주세요."
            />
          </InputWrapper>
          {formErrors.username && <ErrorText>{formErrors.username}</ErrorText>}
        </FormGroup>
        
        <FormGroup>
          <Label>닉네임</Label>
          <InputWrapper error={!!formErrors.nickname}>
            <IconWrapper>
              <FaUserTag color="#A332FF" />
            </IconWrapper>
            <Input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="닉네임을 입력해주세요."
            />
          </InputWrapper>
          {formErrors.nickname && <ErrorText>{formErrors.nickname}</ErrorText>}
        </FormGroup>
        
        <FormGroup>
          <Label>E-Mail</Label>
          <EmailInputContainer error={!!formErrors.email}>
            <IconWrapper>
              <FaEnvelope color="#A332FF" />
            </IconWrapper>
            <EmailInput
              type="text"
              name="email"
              value={formData.email.split('@')[0] || ''}
              onChange={(e) => {
                const localPart = e.target.value;
                const domainPart = formData.email.includes('@') 
                  ? formData.email.split('@')[1] 
                  : 'kaist.ac.kr';
                setFormData({
                  ...formData,
                  email: `${localPart}@${domainPart}`
                });
              }}
              placeholder="이메일 ID"
            />
            <EmailDomain>@kaist.ac.kr</EmailDomain>
            <VerifyButton 
              type="button" 
              onClick={handleEmailVerify}
              verified={emailVerified}
            >
              {emailVerified ? '인증됨' : '인증'}
            </VerifyButton>
          </EmailInputContainer>
          {formErrors.email && <ErrorText>{formErrors.email}</ErrorText>}
        </FormGroup>
        
        <FormGroup>
          <Label>인증번호</Label>
          <VerificationContainer error={!!formErrors.phoneNumber}>
            <IconWrapper>
              <FaMobile color="#A332FF" />
            </IconWrapper>
            <Input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="인증번호를 입력해주세요."
            />
            <VerifyButton 
              type="button" 
              onClick={handlePhoneVerify}
              verified={phoneVerified}
            >
              {phoneVerified ? '확인됨' : '확인'}
            </VerifyButton>
          </VerificationContainer>
          {formErrors.phoneNumber && <ErrorText>{formErrors.phoneNumber}</ErrorText>}
        </FormGroup>
        
        <FormGroup>
          <Label>PW</Label>
          <InputWrapper error={!!formErrors.password}>
            <IconWrapper>
              <FaLock color="#A332FF" />
            </IconWrapper>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="비밀번호를 입력해주세요."
            />
          </InputWrapper>
          {formErrors.password && <ErrorText>{formErrors.password}</ErrorText>}
        </FormGroup>
        
        <FormGroup>
          <Label>PW 확인</Label>
          <InputWrapper error={!!formErrors.passwordConfirm}>
            <IconWrapper>
              <FaLockOpen color="#A332FF" />
            </IconWrapper>
            <Input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="비밀번호를 한번 더 입력해주세요."
            />
          </InputWrapper>
          {formErrors.passwordConfirm && <ErrorText>{formErrors.passwordConfirm}</ErrorText>}
        </FormGroup>
        
        {/* 새로 추가된 전공 필드 */}
        <FormGroup>
          <Label>전공</Label>
          <InputWrapper error={!!formErrors.major}>
            <IconWrapper>
              <FaGraduationCap color="#A332FF" />
            </IconWrapper>
            <Input
              type="text"
              name="major"
              value={formData.major}
              onChange={handleChange}
              placeholder="전공을 입력해주세요."
            />
          </InputWrapper>
          {formErrors.major && <ErrorText>{formErrors.major}</ErrorText>}
        </FormGroup>
        
        {/* 학년 선택 필드 */}
        <FormGroup>
          <Label>학년</Label>
          <InputWrapper>
            <IconWrapper>
              <FaGraduationCap color="#A332FF" />
            </IconWrapper>
            <SelectInput
              name="grade"
              value={formData.grade}
              onChange={handleChange}
            >
              <option value={1}>1학년</option>
              <option value={2}>2학년</option>
              <option value={3}>3학년</option>
              <option value={4}>4학년</option>
              <option value={5}>대학원 1년차</option>
              <option value={6}>대학원 2년차 이상</option>
            </SelectInput>
          </InputWrapper>
        </FormGroup>
        
        {/* 성별 선택 필드 */}
        <FormGroup>
          <Label>성별</Label>
          <InputWrapper>
            <IconWrapper>
              <FaVenusMars color="#A332FF" />
            </IconWrapper>
            <SelectInput
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="not_specified">선택 안함</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </SelectInput>
          </InputWrapper>
        </FormGroup>
        
        {/* 관심사 입력 필드 */}
        <FormGroup>
          <Label>관심사</Label>
          <InterestsContainer>
            <InterestInputContainer>
              <IconWrapper>
                <FaTags color="#A332FF" />
              </IconWrapper>
              <Input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="관심사를 입력해주세요 (예: 전자기기, 스포츠, 음악)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
              />
              <AddButton type="button" onClick={handleAddInterest}>추가</AddButton>
            </InterestInputContainer>
            
            <InterestTags>
              {formData.interests.map((interest, index) => (
                <InterestTag key={index}>
                  {interest}
                  <RemoveTagButton onClick={() => handleRemoveInterest(interest)}>×</RemoveTagButton>
                </InterestTag>
              ))}
            </InterestTags>
          </InterestsContainer>
        </FormGroup>
        
        <FormGroup>
          <Label>매너 지수</Label>
          <MannerScoreText>
            <FaStar color="#FFD700" size={16} />
            <span>A+ (4.3 / 4.3)</span>
          </MannerScoreText>
          <MannerScoreDescription>리뷰 등급에 따라 등급이 하락할 수 있습니다.</MannerScoreDescription>
        </FormGroup>
        
        <FormGroup>
          <Label>계좌 번호</Label>
          <AccountContainer error={!!(formErrors.bankName || formErrors.accountNumber)}>
            <IconWrapper>
              <FaUniversity color="#A332FF" />
            </IconWrapper>
            <BankSelect 
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
            >
              <option value="은행명">은행명</option>
              <option value="국민은행">국민은행</option>
              <option value="신한은행">신한은행</option>
              <option value="우리은행">우리은행</option>
              <option value="하나은행">하나은행</option>
              <option value="농협은행">농협은행</option>
              <option value="카카오뱅크">카카오뱅크</option>
              <option value="토스뱅크">토스뱅크</option>
            </BankSelect>
            <AccountInput
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="계좌 번호를 입력해주세요."
            />
            <IconWrapper>
              <FaCreditCard color="#A332FF" />
            </IconWrapper>
          </AccountContainer>
          {(formErrors.bankName || formErrors.accountNumber) && 
            <ErrorText>{formErrors.bankName || formErrors.accountNumber}</ErrorText>}
        </FormGroup>
        
        <FormGroup>
          <Label>오픈채팅</Label>
          <InputWrapper error={!!formErrors.openChatLink}>
            <IconWrapper>
              <FaComment color="#A332FF" />
            </IconWrapper>
            <Input
              type="text"
              name="openChatLink"
              value={formData.openChatLink}
              onChange={handleChange}
              placeholder="카카오톡 오픈채팅 링크를 입력해주세요."
            />
          </InputWrapper>
          {formErrors.openChatLink && <ErrorText>{formErrors.openChatLink}</ErrorText>}
        </FormGroup>
        
        <ButtonContainer>
          <CancelButton type="button" onClick={() => navigate('/')}>이전</CancelButton>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? '처리 중...' : '회원가입'}
          </SubmitButton>
        </ButtonContainer>
      </Form>
    </Container>
  );
};

// 스타일 컴포넌트
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.T2.fontSize};
  font-weight: ${({ theme }) => theme.typography.T2.fontWeight};
  font-family: ${({ theme }) => theme.typography.T2.fontFamily};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const Label = styled.label`
  min-width: 100px;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  text-align: center;
  border-radius: 4px 0 0 4px;
`;

interface InputWrapperProps {
  error?: boolean;
}

const InputWrapper = styled.div<InputWrapperProps>`
  flex: 1;
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme, error }) => error ? theme.colors.red[600] : theme.colors.gray[200]};
  border-radius: 0 4px 4px 0;
  
  &:focus-within {
    border-color: ${({ theme, error }) => error ? theme.colors.red[600] : theme.colors.primary};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  
  &:focus {
    outline: none;
  }
`;

const EmailInputContainer = styled.div<InputWrapperProps>`
  display: flex;
  flex: 1;
  align-items: center;
  border: 1px solid ${({ theme, error }) => error ? theme.colors.red[600] : theme.colors.gray[200]};
  border-radius: 0 4px 4px 0;
  
  &:focus-within {
    border-color: ${({ theme, error }) => error ? theme.colors.red[600] : theme.colors.primary};
  }
`;

const EmailInput = styled.input`
  padding: 12px 4px 12px 0;
  border: none;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  
  &:focus {
    outline: none;
  }
`;

const EmailDomain = styled.div`
  padding: 12px 12px 12px 0;
  background-color: transparent;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  display: flex;
  align-items: center;
`;

interface VerifyButtonProps {
  verified?: boolean;
}

const VerifyButton = styled.button<VerifyButtonProps>`
  min-width: 70px;
  padding: 8px 12px;
  background-color: ${({ theme, verified }) => verified ? theme.colors.green[600] : theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 0 4px 4px 0;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme, verified }) => verified ? theme.colors.green[300] : "#8A29D7"};
  }
`;

const VerificationContainer = styled.div<InputWrapperProps>`
  display: flex;
  flex: 1;
  align-items: center;
  border: 1px solid ${({ theme, error }) => error ? theme.colors.red[600] : theme.colors.gray[200]};
  border-radius: 0 4px 4px 0;
  
  &:focus-within {
    border-color: ${({ theme, error }) => error ? theme.colors.red[600] : theme.colors.primary};
  }
`;

const MannerScoreText = styled.div`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 0 4px 4px 0;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MannerScoreDescription = styled.div`
  position: absolute;
  left: 100px;
  top: 100%;
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
  font-weight: ${({ theme }) => theme.typography.T7.fontWeight};
  font-family: ${({ theme }) => theme.typography.T7.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-top: 4px;
`;

const AccountContainer = styled.div<InputWrapperProps>`
  display: flex;
  flex: 1;
  align-items: center;
  border: 1px solid ${({ theme, error }) => error ? theme.colors.red[600] : theme.colors.gray[200]};
  border-radius: 0 4px 4px 0;
  
  &:focus-within {
    border-color: ${({ theme, error }) => error ? theme.colors.red[600] : theme.colors.primary};
  }
`;

const BankSelect = styled.select`
  padding: 12px 16px;
  border: none;
  border-right: 1px solid ${({ theme }) => theme.colors.gray[200]};
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  
  &:focus {
    outline: none;
  }
`;

const AccountInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  
  &:focus {
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  padding: 12px 40px;
  background-color: ${({ theme }) => theme.colors.gray[300]};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

const SubmitButton = styled.button`
  padding: 12px 40px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: pointer;
  
  &:hover {
    background-color: #8A29D7;
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[300]};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.red[100]};
  color: ${({ theme }) => theme.colors.red[600]};
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
`;

const ErrorText = styled.div`
  position: absolute;
  left: 100px;
  top: 100%;
  color: ${({ theme }) => theme.colors.red[600]};
  font-size: ${({ theme }) => theme.typography.T7.fontSize};
  font-weight: ${({ theme }) => theme.typography.T7.fontWeight};
  font-family: ${({ theme }) => theme.typography.T7.fontFamily};
  margin-top: 4px;
`;

const SelectInput = styled.select`
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  
  &:focus {
    outline: none;
  }
`;

const InterestsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
`;

const InterestInputContainer = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: 0 4px 4px 0;
  
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const AddButton = styled.button`
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 0 4px 4px 0;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  cursor: pointer;
  
  &:hover {
    background-color: #8A29D7;
  }
`;

const InterestTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: 4px;
`;

const InterestTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: ${({ theme }) => theme.colors.purple[100]};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 16px;
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.red[600]};
  }
`;

export default Register;