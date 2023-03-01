const { Client } = require("pg");

let DB_URI;

// If we are running in test "mode", uses test db. Otherwise, uses regular db
if (process.env.NODE_ENV === "test") {
    DB_URI = "postgresql:///biztime_test";
} else {
    DB_URI = "postgresql:///biztime";
}

let db = new Client({connectionString: DB_URI});

db.connect();

module.exports = db;