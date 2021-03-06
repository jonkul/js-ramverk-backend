// MongoDB
//const mongo = require("mongodb").MongoClient;
/* const dsn =  process.env.DSN || "mongodb://localhost:27017/mumin"; */

// Express server
const port = process.env.PORT || 1337;
const express = require("express");
const app = express();

const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const index = require('./routes/index');
const hello = require('./routes/hello');
const update = require('./routes/update');
const create = require('./routes/create');
const list = require('./routes/list');
const setup = require('./routes/setup');

//socket.io
const server = require('http').createServer(app);
const io = require("socket.io")(server, {
    cors: {
        // origin: [ "http://localhost:3000", "https://www.student.bth.se"],
        origin: 'https://www.student.bth.se',
            'Access-Control-Allow-Origin': 'https://www.student.bth.se',
        //origin: [ "*"],
        methods: ["GET", "POST"]
    }
});


io.on('connection', function (socket) {
    console.info("User", socket.id, "connected");
    let previousDoc = "";

    socket.on('activeDoc', function (_id) {
        if (previousDoc) {
            socket.leave(previousDoc);
            // io.in(socket.id).socketsLeave(previousDoc);
            console.info(socket.id, "left room", previousDoc);
        }
        
        socket.join(_id);
        console.info(socket.id, "joined room", _id);
        previousDoc = _id;
        console.info(io.sockets.adapter.rooms);
    });

    socket.on('docBodyUpdate', function (active) {
        socket.to(active._id).emit("docBodyUpdate", active);
        console.info("Message emited!");
        console.info(">>> socket id:", socket.id);
        console.info(">>> active.id:", active._id);
        console.info(">>> active.name:", active.name);
        console.info(">>> active.html:", active.html);
    });

    socket.on("disconnecting", () => {
        // console.log(socket.rooms); // the Set contains at least the socket ID
    });

    socket.on("disconnect", () => {
        // socket.rooms.size === 0
    });
});



// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(cors());
//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});

app.use('/', index);
app.use('/hello', hello); // /:msg
app.use('/update', update);
app.use('/create', create);
app.use('/list', list);
app.use('/setup', setup);


// Add routes for 404 and error handling
// Catch 404 and forward to error handler
// Put this last
app.use((req, res, next) => {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title":  err.message,
                "detail": err.message
            }
        ]
    });
});



// Startup server and listen on port
//app.listen(port, () => {
//    console.log(`Server is listening on ${port}`);
//    /* console.log(`DSN is: ${dsn}`); */
// });


const serv = server.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = serv;
