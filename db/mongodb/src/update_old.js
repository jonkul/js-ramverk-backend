var express = require('express');
var router = express.Router();
const mongo = require("mongodb").MongoClient;
const dsn =  process.env.DBWEBB_DSN || "mongodb://localhost:27017/mumin";
var name = { name: "Dokument" };
var content = { content: "Det var en gång en liten katt." };

router.get('/', function(req, res, next) {
    const data = {
        data: {
            name: "Dokument",
            msg: "Document inserted into database. "
        }
    };

    insert(dsn, "crowd", docs)
        .catch(err => console.log(err));

    res.json(data);
});

router.get('/:msg', function(req, res, next) {
    const data = {
        data: {
            msg: "Document inserted into database.",
            content: req.params.msg
        }
    };
    var filter = "Dokument1";
    var content = req.params.msg;

    update(dsn, "crowd", filter, content)
        .catch(err => console.log(err));

    res.json(data);
});

/**
 * Reset a collection by removing existing content and insert a default
 * set of documents.
 *
 * @async
 *
 * @param {string} dsn     DSN to connect to database.
 * @param {string} colName Name of collection.
 * @param {string} doc     Documents to be inserted into collection.
 *
 * @throws Error when database operation fails.
 *
 * @return {Promise<void>} Void
 */
async function update(dsn, colName, filter, content) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);
        
    var fil = { name: filter };
    var con = { $set: { content: content } };
    var upsert = { upsert: true };

    //await col.deleteMany();
    await col.updateOne(fil, con, upsert);

    await client.close();
}


module.exports = router;
