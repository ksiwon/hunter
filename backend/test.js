const http = require("http");

const server = http.createServer((req, res) => {
    console.log("request received");
});

server.listen(3001, () => {
    console.log("server start");
});