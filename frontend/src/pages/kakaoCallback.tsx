import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


const KakaoCallback = () => {
    const [userNickname, setUserNickname] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URL(document.location.toString()).searchParams;
        const code = params.get("code");
        const grant_type = "authorization_code"
        const client_id = `${process.env.REACT_APP_RESTAPI_KAKAO_APP_KEY}`
        const REDIRECT_URI = `${process.env.REACT_APP_KAKAO_REDIRECT_URL}`

        axios
            .post(
                `https://kauth.kakao.com/oauth/token?grant_type=${grant_type}&client_id=${client_id}&redirect_uri=${REDIRECT_URI}&code=${code}`,
                {},
                {
                    headers: {
                        "Content-type":
                            "application/x-www-form-urlencoded;charset=utf-8",
                    },
                }
            )
            .then((res) => {
                console.log(res);

                const { access_token } = res.data;

                if (access_token) {
                    console.log(`Bearer ${access_token}`);
                    axios
                        .post(
                            "https://kapi.kakao.com/v2/user/me",
                            {},
                            {
                                headers: {
                                    Authorization: `Bearer ${access_token}`,
                                    "Content-type": "application/x-www-form-urlencoded",
                                },
                            }
                        )
                        .then((res) => {
                            console.log("데이터 성공 : ");
                            console.log(res);

                            const { id: User_ID, properties } = res.data; // `id`는 유저 고유 ID
                            const { nickname: User_NICKNAME } = properties; // 닉네임은 `properties.nickname`

                            console.log("User_ID:", User_ID);
                            console.log("User_NICKNAME:", User_NICKNAME);


                            if (User_ID && User_NICKNAME) {
                                // 백엔드로 데이터 전송
                                axios
                                    .post("http://localhost:5001/api/users", {
                                        User_ID,
                                        User_NICKNAME,
                                    })
                                    .then(() => {
                                        setUserNickname(User_NICKNAME); // 닉네임 상태 저장
                                        navigate("/", { state: { userNickname: User_NICKNAME } }); // 홈 화면으로 이동
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

            });

    }, []);
    return (
        <div>
            <h4>로그인 중..</h4>
        </div>
    );
};



export default KakaoCallback;
