const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

app.get("/", (req, res) => {
    res.cookie("kim", "1234", { httpOnly: true });
    res.send("쿠키 생성")
});

app.get("/cookie", (req, res) => {
    console.log(req.cookies);
});

app.get("/delete-cookie", (req, res) => {
    res.clearCookie("kim");
    res.send("쿠키 삭제");
});

app.listen(8080, () => {
    console.log('서버 실행 중');
}); 