const http = require('http');
const fs = require('fs');
const path = require('path');

const webPath = path.join(__dirname, 'index.html');
const errorPath = path.join(__dirname, 'error.html');

const PORT = 4000;
const HOST = 'localhost'
const server = http.createServer(requestHandler)

server.listen(PORT, () => {
    console.log(`server has started listening at ${HOST}:${PORT}`);
})

function requestHandler(req, res){
    if (req.url === "/"){
        getWeb(req, res)
    }
    if (req.url.endsWith(".html") && req.method === "GET"){
        try {
            getRequestedWeb(req, res);
        } catch (error) {
            getErrorWeb(req, res);
        }
    }
}

//.........Function Handlers........
function getWeb(req, res){
    res.setHeader('content-type','text/html')
    res.writeHead(200)
    res.end(fs.readFileSync(webPath));
}

function getRequestedWeb(req, res){
    const file = req.url.split("/")[1]  //http://localhost:4000/index.html
    const actualPath = path.join(__dirname, file)
    const web = fs.readFileSync(actualPath)
    res.setHeader("content-type", "text/html")
    res.writeHead(200)
    res.end(web)
}

function getErrorWeb(req, res){
    res.setHeader("content-type", "text/html")
    res.writeHead(400)
    res.end(fs.readFileSync(errorPath))
}

