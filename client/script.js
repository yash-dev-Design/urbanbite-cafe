const form = document.getElementById("bookingForm");
const message = document.getElementById("message");
const adminForm = document.getElementById("adminLoginForm");
const adminMessage = document.getElementById("adminMessage");
const bookingList = document.getElementById("bookingList");
const bookingsTableBody = document.querySelector("#bookingsTable tbody");
const bookingCount = document.getElementById("bookingCount");
const adminSection = document.getElementById("admin");
const adminLink = document.getElementById("navAdmin");
const logoutButton = document.getElementById("adminLogoutBtn");
const navLinks = document.querySelectorAll("nav a");

function showAdminSection() {
    adminSection.classList.remove("hidden");
    adminSection.scrollIntoView({ behavior: "smooth" });
}

function hideAdminSection() {
    adminSection.classList.add("hidden");
    bookingList.classList.add("hidden");
    adminMessage.textContent = "";
    logoutButton.classList.add("hidden");
}

adminLink.addEventListener("click", (e) => {
    e.preventDefault();
    showAdminSection();
});

navLinks.forEach((link) => {
    if (link !== adminLink) {
        link.addEventListener("click", () => {
            hideAdminSection();
        });
    }
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const booking = {
        name: document.getElementById("name").value.trim(),
        guests: Number(document.getElementById("guests").value),
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        phone: document.getElementById("phone").value.trim(),
        seating: document.getElementById("seating").value,
        requests: document.getElementById("requests").value.trim(),
    };

    if (!booking.name || booking.guests <= 0 || !booking.date || !booking.time) {
        message.innerText = "Please complete all required booking fields.";
        return;
    }

    const response = await fetch("http://localhost:5000/api/book", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(booking),
    });

    const data = await response.json();
    message.innerText = data.message || "Booking failed.";
    if (response.ok) {
        form.reset();
    }
});

adminForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const adminId = document.getElementById("adminId").value;
    const adminPassword = document.getElementById("adminPassword").value;
    const credentials = btoa(`${adminId}:${adminPassword}`);

    const response = await fetch("http://localhost:5000/api/bookings", {
        headers: {
            Authorization: `Basic ${credentials}`,
        },
    });

    if (!response.ok) {
        adminMessage.innerText = "Login failed. Please check your admin ID and password.";
        bookingList.classList.add("hidden");
        logoutButton.classList.add("hidden");
        return;
    }

    const bookings = await response.json();
    adminMessage.textContent = "";
    bookingList.classList.remove("hidden");
    logoutButton.classList.remove("hidden");
    bookingsTableBody.innerHTML = "";
    bookingCount.textContent = bookings.length;

    if (bookings.length === 0) {
        bookingsTableBody.innerHTML = '<tr><td colspan="9">No bookings found.</td></tr>';
        return;
    }

    bookings.forEach((booking) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.name}</td>
            <td>${booking.guests}</td>
            <td>${booking.date || "-"}</td>
            <td>${booking.time || "-"}</td>
            <td>${booking.phone || "-"}</td>
            <td>${booking.seating || "Any"}</td>
            <td>${booking.requests || "-"}</td>
            <td>${booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "-"}</td>
        `;
        bookingsTableBody.appendChild(row);
    });
    adminForm.reset();
});

logoutButton.addEventListener("click", () => {
    bookingList.classList.add("hidden");
    logoutButton.classList.add("hidden");
    adminMessage.textContent = "Logged out.";
});
