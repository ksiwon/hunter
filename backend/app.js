const express = require("express");
const app = express();
const dbConnect = require("./config/dbConnect");
const port = 3002;

dbConnect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("hello node!")
});


app.use("/contacts", require("./routes/contactRoutes"));


app.listen(port, () => {
    console.log(`${port}에서 서버 실행 중`);
});