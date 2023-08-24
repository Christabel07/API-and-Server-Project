const http = require("http");
const path = require("path");
const fs = require("fs");

const itemsPath = path.join(__dirname, "items.json");

const PORT = 8000;
const HOSTNAME = "localhost";

const server = http.createServer(requestHandler);
server.listen(PORT, () => {
    console.log(`server is listening at ${HOSTNAME}:${PORT}`);
})

function requestHandler(req, res){
    if (req.url === '/items' && req.method === 'POST'){
        postItem(req, res);
    }

    if (req.url === "/items" && req.method === "GET"){
        getAllItems(req, res);
    }

    if (req.url.startsWith("/items/") && req.method === "GET"){
        getOneItem(req, res);
    }

    if (req.url.startsWith("/items/") && req.method === "PUT"){
        updateItem(req, res);
    }

    if (req.url.startsWith("/items/") && req.method === "DELETE"){
        deleteItem(req, res);
    }
}

//function handlers
//To post or create an item
function postItem(req, res){
const readItems = fs.readFileSync(itemsPath)
const itemsObj = JSON.parse(readItems)

//Using incremental Id for the items
const lastId = itemsObj[itemsObj.length-1].id
const newId = lastId + 1

const body =[];
req.on("data", (chunk) => {
    body.push(chunk);
});
req.on("end", () => {
const parsedBody = Buffer.concat(body).toString()
const itemToPost = JSON.parse(parsedBody)

itemsObj.push({
    ...itemToPost,
id: newId  //incremental Id
//id: Math.floor(Math.random() * 500).toString() //Random Id
})

fs.writeFile(itemsPath, JSON.stringify(itemsObj), (err) => {
    if(err){
        serverError(req, res)
    }
    res.end(JSON.stringify(itemToPost))
});
});
}

//To Get All Items
function getAllItems(req, res){
    fs.readFile(itemsPath, "utf8", (err, data) => {
        if (err){
            serverError()
        }
        res.end(data)
    });
}

//To Get One Item
function getOneItem(req, res){
const id = req.url.split("/")[2] //http:localhost:4000/items/id
const items = fs.readFileSync(itemsPath)
const itemsObj = JSON.parse(items)

const itemIndex = itemsObj.findIndex((item) => {
    return item.id === parseInt(id) 
});
if (itemIndex === -1){
    return clientError(req, res)
}
res.end(JSON.stringify(itemsObj[itemIndex]));
}

//Update an Item
function updateItem(req, res){
const id = req.url.split("/")[2]

const items = fs.readFileSync(itemsPath)
const itemsObj = JSON.parse(items)

const body = []
req.on("data", (chunk) => {
    body.push(chunk)
})
req.on("end", () => {
const parsedBody = Buffer.concat(body).toString()
const updateBody = JSON.parse(parsedBody);

const itemIndex = itemsObj.findIndex((item) => {
    return item.id === parseInt(id) 
});
if (itemIndex === -1){
    return clientError(req, res)
}
itemsObj[itemIndex] = { ...itemsObj[itemIndex], ...updateBody };

fs.writeFile(itemsPath, JSON.stringify(itemsObj), (err) => {
    if (err){
        return serverError(req, res)
    }
    res.end(JSON.stringify(itemsObj[itemIndex]));
})
})
}

//Delete an Item
function deleteItem(req, res){
const id = req.url.split("/")[2]

const items = fs.readFileSync(itemsPath)
const itemsObj = JSON.parse(items)   

const itemIndex = itemsObj.findIndex((item) => {
    return item.id === parseInt(id) 
});
if (itemIndex === -1){
    return clientError(req, res)
}
itemsObj.splice(itemIndex, 1)

fs.writeFile(itemsPath, JSON.stringify(itemsObj), (err) => {
    if (err){
        return serverError(req, res)
    }
    res.end("Item successfully deleted");
});
}

//Error Handlers
function serverError(req, res){
    res.writeHead("500");
    res.end("Internal server error");
}

function clientError(req, res){
    res.writeHead("404")
    res.end("Invalid id! Enter a correct item id")
}

