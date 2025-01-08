import React from "react";
import { ThemeProvider } from "styled-components";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Content from "./pages/Content";
import Item from "./pages/Item";
import theme from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";
import Sell from "./pages/Sell";
import KakaoCallback from "./pages/kakaoCallback";
import { MerchandiseProvider } from "./context/MerchandiseContext";
import { UserProvider } from "./context/UserContext";
import Mydeal from "./pages/Mydeal";

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <GlobalStyle />
              <UserProvider>
                  <MerchandiseProvider>
                      <Router>
                          <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/content/:category" element={<Content />} />
                              <Route path="/content/:category/:id" element={<Item />} />
                              <Route path="/sell" element={<Sell />} />
                              <Route path="/mydeal" element={<Mydeal />} />
                              <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
                              <Route path="*" element={<NotFound />} />
                          </Routes>
                      </Router>
                  </MerchandiseProvider>
              </UserProvider>
        </ThemeProvider>
    );
};

const NotFound: React.FC = () => (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>404 - 페이지를 찾을 수 없습니다.</h1>
    </div>
);

export default App;
