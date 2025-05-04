import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/slices/authSlice';
import { FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { isLoggedIn, loading, error } = useAppSelector(state => state.auth);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    dispatch(login({ email, password }));
  };
  
  return (
    <Container>
      <LoginForm onSubmit={handleSubmit}>
        <Title>로그인</Title>
        
        {error && (
          <ErrorMessage>
            <FaExclamationTriangle size={16} />
            <span>{error}</span>
          </ErrorMessage>
        )}
        
        <InputGroup>
          <Label htmlFor="email">이메일</Label>
          <InputWrapper>
            <IconWrapper>
              <FaEnvelope color="#A332FF" />
            </IconWrapper>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
          </InputWrapper>
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="password">비밀번호</Label>
          <InputWrapper>
            <IconWrapper>
              <FaLock color="#A332FF" />
            </IconWrapper>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </InputWrapper>
        </InputGroup>
        
        <SubmitButton type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </SubmitButton>
        
        <Footer>
          <Register to="/register">회원가입</Register>
          <div>
            <ForgotLink to="/forgot-password">비밀번호 찾기</ForgotLink>
          </div>
        </Footer>
      </LoginForm>
    </Container>
  );
};

// 스타일 컴포넌트
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
`;

const LoginForm = styled.form`
  width: 100%;
  max-width: 450px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.colors.white};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.T2.fontSize};
  font-weight: ${({ theme }) => theme.typography.T2.fontWeight};
  font-family: ${({ theme }) => theme.typography.T2.fontFamily};
  text-align: center;
  margin-bottom: 32px;
  color: ${({ theme }) => theme.colors.primary};
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.black};
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.gray[300]};
  border-radius: 8px;
  transition: all 0.2s;
  
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: none;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  
  &:focus {
    outline: none;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  margin-top: 24px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.typography.T4.fontSize};
  font-weight: ${({ theme }) => theme.typography.T4.fontWeight};
  font-family: ${({ theme }) => theme.typography.T4.fontFamily};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #8A29D7;
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[300]};
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;

const Register = styled(Link)`
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ForgotLink = styled(Link)`
  font-size: ${({ theme }) => theme.typography.T6.fontSize};
  font-weight: ${({ theme }) => theme.typography.T6.fontWeight};
  font-family: ${({ theme }) => theme.typography.T6.fontFamily};
  color: ${({ theme }) => theme.colors.gray[600]};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.red[100]};
  color: ${({ theme }) => theme.colors.red[600]};
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: ${({ theme }) => theme.typography.T5.fontSize};
  font-weight: ${({ theme }) => theme.typography.T5.fontWeight};
  font-family: ${({ theme }) => theme.typography.T5.fontFamily};
`;

export default Login;