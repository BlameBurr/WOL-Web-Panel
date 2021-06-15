const wol = require("wake_on_lan");
const localMac = getLocalMac();

function getLocalMac() {
    let nics = require("os").networkInterfaces()
    let mac = ""
    if (nics.eth0) {
        mac = nics.eth0[0].mac;
    } else {
        if (nics.Ethernet) {
            mac = nics.Ethernet[0].mac;
        }
    }
    return mac.toUpperCase();
}

class RESTAPI {
    constructor(db) {
        this.express = require("express");
        this.app = this.express();
        this.router = this.express.Router();
        this.db = db;
        this.nmap = require("node-nmap");

        this.nmap.nmapLocation = "nmap";

        this.router.get("/wol/devices/get", (req, res) => {
            if (!req.query.username || !req.query.key) {
                return res.json({
                    "header": "Error",
                    "content": "Authorisation Failure"
                });
            };
            let username = req.query.username;
            let key = req.query.key;

            let authSuccess = this.authUser(username, key);

            if (!authSuccess) {
                return res.json({
                    "header": "Error",
                    "content": "Authorisation Failure"
                });
            } else {
                let scan = new this.nmap.QuickScan("192.168.0.2-60");
                scan.on("complete", (data) => {
                    let devices = []
                    data.forEach(device => {
                        if (!device.mac) device.mac = localMac;
                        devices.push({
                            "ip": device.ip,
                            "mac": device.mac,
                            "hostname": this.getHostnameByMac(device.mac)
                        });
                    });
                    return res.json({
                        "header": "Devices",
                        "content": devices
                    });
                });
                scan.startScan();
            }
        });

        this.router.get("/wol/devices/new", (req, res) => {
            if (!req.query.username || !req.query.key || !req.query.hostname || !req.query.mac || !req.query.ip) {
                return res.json({
                    "header": "Error",
                    "content": "Authorisation Failure"
                });
            };
            let username = req.query.username;
            let key = req.query.key;
            let hostname = req.query.hostname;
            let mac = req.query.mac.toUpperCase().replace("-", ":");
            let ip = req.query.ip;

            let authSuccess = this.authUser(username, key);

            if (!authSuccess) {
                return res.json({
                    "header": "Error",
                    "content": "Authorisation Failure"
                });
            } else {
                try {
                    this.db.prepare("INSERT INTO devices (mac, hostname, ip) VALUES (?, ?, ?)").run(mac, hostname, ip);
                    res.json({
                        "header": "Success",
                        "content": `${hostname} - ${mac} : has been added to the database`
                    });
                } catch(error) {
                    res.json({
                        "header": "Error",
                        "content": error.message
                    });
                }
            }
        })

        this.router.get("/wol/wake", (req, res) => {
            if (!req.query.username || !req.query.key) {
                return res.json({
                    "header": "Error",
                    "content": "Authorisation Failure"
                });
            }
            if (!req.query.ip && !req.query.mac && !req.query.hostname) {
                return res.json({
                    "header": "Error",
                    "content": "Invalid device identifier, be advised that using an IP or Hostname is unreliable and requires a record for that device in the database."
                });
            }

            let mac = undefined;

            if (req.query.ip && !(req.query.mac || req.query.hostname)) mac = this.db.prepare(`SELECT mac FROM devices WHERE ip = ?`).get(req.query.ip).mac;
            if (req.query.hostname && !(req.query.mac || req.query.ip)) mac = this.db.prepare(`SELECT mac FROM devices WHERE hostname = ?`).get(req.query.hostname).mac;
            if (req.query.mac && !(req.query.hostname || req.query.ip)) mac = req.query.mac;
            if (mac == undefined) {
                return res.json({
                    "header": "Error",
                    "content": "To prevent potentially conflicting identifications and enable proper identification, you must enter one (and only one) valid device identifier type (mac, hostname or ip)"
                });
            };

            mac = mac.replace("-", ":").toUpperCase(); // Just in case
            if (process.platform == "win32") {
                wol.wake(mac, {address: "192.168.0.255"}, (err) => {
                    if (err) {
                        return res.json({
                            "header": "Error",
                            "content": err.message
                        })
                    }
                    return res.json({
                        "header": "Success",
                        "content": `Successfully sent wol request to ${mac}`
                    });
                });
            } else {
                wol.wake(mac, (err) => {
                    if (err) {
                        return res.json({
                            "header": "Error",
                            "content": err.message
                        })
                    }
                    return res.json({
                        "header": "Success",
                        "content": `Successfully sent wol request to ${mac}`
                    });
                })
            }
        });
    }
    
    getUserEntry(username) {
        let usernameArray = username.split(".");
        let name = usernameArray[0].replace("_", " ");
        let id = parseInt(usernameArray[1]);
        
        let result = this.db.prepare("SELECT * FROM users WHERE name = ? AND id = ?").get(name, id);

        if (result === undefined) return -1;
        return result;
    };

    getHostnameByMac(mac) {
        let result = this.db.prepare("SELECT hostname FROM devices WHERE mac = ?").get(mac);

        if (result === undefined) return "Unknown Hostname";
        return result.hostname;
    }

    authUser(username, key) {
        if (username === "" || key === "") return false;
        let result = this.getUserEntry(username);
        return (result.key === key);
    }
}

module.exports = RESTAPI;