const api = "https://womencare.onrender.com";

/* ---------------- SUBMIT COMPLAINT ---------------- */

const form = document.getElementById("form");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const description = document.getElementById("desc").value.trim();

        if (!name || !email || !description) {
            alert("Please fill all fields");
            return;
        }

        const data = { name, email, description };

        try {
            const res = await fetch(api + "/complaints", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            alert("Complaint Submitted!\nComplaint ID: " + result._id);

            form.reset();

        } catch (err) {
            alert("Error submitting complaint");
            console.log(err);
        }
    });
}


/* ---------------- TRACK COMPLAINT ---------------- */

async function track() {
    const cid = document.getElementById("cid");

    if (!cid) return;

    const id = cid.value.trim();

    if (!id) {
        alert("Enter Complaint ID");
        return;
    }

    try {
        const res = await fetch(api + "/complaints/" + id);
        const data = await res.json();

        if (!data || data.status === "Not found") {
            document.getElementById("result").innerText = "Complaint not found";
            return;
        }

        document.getElementById("result").innerHTML = `
            <h3>Complaint Details</h3>
            <p><b>Name:</b> ${data.name}</p>
            <p><b>Email:</b> ${data.email}</p>
            <p><b>Complaint:</b> ${data.description}</p>
            <p><b>Status:</b> ${data.status}</p>
        `;
    } catch (err) {
        document.getElementById("result").innerText = "Error fetching complaint";
        console.log(err);
    }
}


/* make function available globally for button onclick */
window.track = track;