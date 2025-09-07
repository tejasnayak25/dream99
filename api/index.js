let express = require('express');
let app = express();
let path = require('path');
let fs = require("fs");

app.use(express.static(path.join(__dirname, "..", "src")));
app.use(express.json());

app.route("/")
.get((req, res) => {
    res.sendFile(path.join(__dirname, "..", "src", "index.html"));
});

app.route("/api/companies")
.get((req, res) => {
    res.sendFile(path.join(__dirname, "..", "data", "companies.json"));
});

const usersFile = process.env.VERCEL_ENV === 'production' ? path.join("tmp", "data", "users.json") : path.join(__dirname, "..", "data", "users.json");

function loadUsers() {
    if (!fs.existsSync(usersFile)) return {};
    return JSON.parse(fs.readFileSync(usersFile, "utf-8"));
}

function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

app.route("/api/user/:uid/companies")
.get((req, res) => {
    let uid = req.params.uid;
    let users = loadUsers();
    if (users[uid]) {
        res.json({ companies: users[uid].companies });
    } else {
        res.json({ companies: [] });
    }
});

app.route("/api/user/:uid/companies")
.post((req, res) => {
    let uid = req.params.uid;
    let { c } = req.body;
    let users = loadUsers();

    if (!users[uid]) {
        users[uid] = { companies: [] };
    }

    users[uid].companies = Array.from(new Set([...users[uid].companies, c]));

    saveUsers(users);
    res.status(201).json({ companies: users[uid].companies });
});

app.route("/api/user/:uid/companies/:cname")
.delete((req, res) => {
    let uid = req.params.uid;
    let cname = req.params.cname;
    let users = loadUsers();

    if (users[uid]) {
        users[uid].companies = users[uid].companies.filter(c => c.name !== cname);
        saveUsers(users);
    }

    res.status(200).json({ companies: users[uid]?.companies || [] });
});

app.listen(3000, () => {
    console.log("Server is running on PORT 3000");
});