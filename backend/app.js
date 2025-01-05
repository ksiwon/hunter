const express = require("express");
const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("hello node!")
});


app.use("/contacts", require("./routes/contactRoutes"));


app.listen(port, () => {
    console.log(`${port}에서 서버 실행 중`);
});