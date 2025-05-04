import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Provider } from 'react-redux';
import { store } from './store';
import { theme } from './styles/theme';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';
import GlobalStyles from './styles/GlobalStyles';

// 컴포넌트 임포트
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// 보호된 라우트 컴포넌트
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { isLoggedIn } = useAppSelector(state => state.auth);
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{element}</>;
};

// 앱 래퍼 컴포넌트 (Redux 접근을 위해)
const AppWrapper = () => {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // 앱 시작 시 현재 사용자 정보 조회
    dispatch(getCurrentUser());
  }, [dispatch]);
  
  return (
    <Router>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

// 메인 앱 컴포넌트
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AppWrapper />
      </ThemeProvider>
    </Provider>
  );
};

export default App;