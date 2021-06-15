// Dependencies

class Main {
    constructor() {
        this.express = require("express");
        this.app = this.express();
        this.router = this.express.Router();

        this.db = new (require("better-sqlite3"))("./database.db");

        this.app.set("port", 80);
        this.app.set("view engine", "ejs");

        this.app.use(require("cors")())

        this.initWS();
        this.initDB();

        this.app.listen(this.app.get("port"), () => `Website and REST API active and listening on port ${this.app.get("port")}`);
    }

    initWS() {
        let restAPI = require("./restAPI");
        this.app.set("views", "./views");

        this.app.use("/public/", this.express.static("./views/public"));

        this.router.get('/', (req, res) => {
            res.status(200).render("index.ejs");
        });

        this.router.get("/wol", (req, res) => {
            res.status(200).render("wol.ejs");
        });

        this.app.use("/rest", new restAPI(this.db).router);
        this.app.use('/', this.router);
    };

    initDB() {
        this.db.prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, key TEXT NOT NULL, permissionLevel INTEGER NOT NULL)").run();
        this.db.prepare("CREATE TABLE IF NOT EXISTS devices (mac TEXT PRIMARY KEY NOT NULL, hostname TEXT NOT NULL, ip TEXT NOT NULL)").run();
        this.db.pragma("synchronous = 1");
        this.db.pragma("journal_mode = wal");

        console.log("Initialising database and ensuring that the appropriate tables exist")
    }
}
new Main();