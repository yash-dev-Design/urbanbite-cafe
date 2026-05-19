const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 5000;
const ADMIN_USER = "admin490";
const ADMIN_PASS = "22FE1A0490";

app.use(cors());
app.use(express.json());

function requireAdminAuth(req, res, next) {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Basic ")) {
        return res
            .status(401)
            .set("WWW-Authenticate", "Basic realm=\"Admin Area\"")
            .json({ message: "Unauthorized" });
    }

    const base64Credentials = authHeader.split(" ")[1] || "";
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
    const [username, password] = credentials.split(":");

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
        return res
            .status(401)
            .set("WWW-Authenticate", "Basic realm=\"Admin Area\"")
            .json({ message: "Unauthorized" });
    }

    next();
}

app.post("/api/book", (req, res) => {
    const newBooking = req.body;
    const name = String(newBooking.name || "").trim();
    const guests = Number(newBooking.guests || 0);
    const date = String(newBooking.date || "").trim();
    const time = String(newBooking.time || "").trim();
    const phone = String(newBooking.phone || "").trim();
    const seating = String(newBooking.seating || "Any").trim();
    const requests = String(newBooking.requests || "").trim();

    if (!name || guests <= 0 || !date || !time) {
        return res.status(400).json({ message: "Name, guests, date, and time are required." });
    }

    fs.readFile("./data/bookings.json", "utf8", (err, data) => {
        let bookings = [];

        if (!err && data) {
            bookings = JSON.parse(data);
        }

        const nextId = bookings.length
            ? Math.max(...bookings.map((booking) => Number(booking.id) || 0)) + 1
            : 1;

        const bookingToSave = {
            id: nextId,
            name,
            guests,
            date,
            time,
            phone,
            seating,
            requests,
            createdAt: new Date().toISOString(),
        };

        bookings.push(bookingToSave);

        fs.writeFile(
            "./data/bookings.json",
            JSON.stringify(bookings, null, 2),
            (err) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error saving booking",
                    });
                }

                res.json({
                    message: "Booking Successful!",
                });
            }
        );
    });
});

app.get("/api/bookings", requireAdminAuth, (req, res) => {
    fs.readFile("./data/bookings.json", "utf8", (err, data) => {
        if (err) {
            return res.json([]);
        }

        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
