import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const KakaoCallback = () => {
    const [userNickname, setUserNickname] = useState(null);
    const navigate = useNavigate();
    const isProcessing = useRef(false); // Prevent duplicate processing

    useEffect(() => {
        if (isProcessing.current) {
            // If already processing, do nothing
            return;
        }
        isProcessing.current = true; // Start processing

        const params = new URL(document.location.toString()).searchParams;
        const code = params.get("code");
        console.log("Authorization Code:", code);

        const grant_type = "authorization_code";
        const client_id = process.env.REACT_APP_RESTAPI_KAKAO_APP_KEY;
        const REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URL;

        // Validate environment variables
        if (!client_id) {
            console.error("REACT_APP_RESTAPI_KAKAO_APP_KEY 환경 변수가 설정되지 않았습니다.");
            return;
        }

        if (!REDIRECT_URI) {
            console.error("REACT_APP_KAKAO_REDIRECT_URL 환경 변수가 설정되지 않았습니다.");
            return;
        }

        if (!code) {
            console.error("URL에 code 파라미터가 없습니다.");
            return;
        }

        // Prevent reuse of authorization code
        const storedCode = sessionStorage.getItem('kakao_auth_code');
        if (code === storedCode) {
            console.error("Authorization code가 이미 사용되었습니다.");
            return;
        } else {
            sessionStorage.setItem('kakao_auth_code', code);
        }

        // Prepare data for token request
        const data = new URLSearchParams();
        data.append('grant_type', grant_type);
        data.append('client_id', client_id);
        data.append('redirect_uri', REDIRECT_URI);
        data.append('code', code);

        console.log("Token Request Data:", data.toString());

        axios.post(
            "https://kauth.kakao.com/oauth/token",
            data,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                },
            }
        )
            .then((res) => {
                console.log("토큰 응답:", res);

                const { access_token } = res.data;

                if (access_token) {
                    console.log(`Bearer ${access_token}`);
                    axios.post(
                        "https://kapi.kakao.com/v2/user/me",
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${access_token}`,
                                "Content-Type": "application/x-www-form-urlencoded",
                            },
                        }
                    )
                        .then((res) => {
                            console.log("사용자 정보 성공:", res);

                            const { id: User_ID, properties } = res.data;
                            const { nickname: User_NICKNAME } = properties;

                            console.log("User_ID:", User_ID);
                            console.log("User_NICKNAME:", User_NICKNAME);

                            if (User_ID && User_NICKNAME) {
                                // Send data to backend
                                axios.post("http://localhost:5001/api/users", {
                                    User_ID,
                                    User_NICKNAME,
                                })
                                    .then((response) => {
                                        console.log("데이터 저장 성공:", response.data);
                                        setUserNickname(User_NICKNAME); // Save nickname in state
                                        navigate("/", { state: { userNickname: User_NICKNAME } }); // Redirect to home
                                    })
                                    .catch((error) => {
                                        console.error("데이터 저장 실패:", error);
                                    });
                            } else {
                                console.error("User_ID 또는 User_NICKNAME이 유효하지 않음");
                            }
                        })
                        .catch((error) => {
                            console.error("카카오 사용자 정보 요청 실패:", error);
                        });
                } else {
                    console.log("access_token 없음");
                }
            })
            .catch((error) => {
                if (error.response) {
                    // Server responded with a status other than 2xx
                    console.error("토큰 요청 실패: ", error.response.data);
                } else if (error.request) {
                    // Request was made but no response received
                    console.error("토큰 요청 실패: 요청이 이루어졌으나 응답을 받지 못했습니다.", error.request);
                } else {
                    // Something happened in setting up the request
                    console.error("토큰 요청 실패: ", error.message);
                }
            });
    }, [navigate]);

    return (
        <div>
            <h4>로그인 중..</h4>
            {userNickname && <p>환영합니다, {userNickname}님!</p>}
        </div>
    );
};

export default KakaoCallback;

