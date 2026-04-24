const api = "https://womencare.onrender.com";

/* ---------------- SUBMIT COMPLAINT ---------------- */

const form = document.getElementById("form");

if(form){

form.addEventListener("submit", async (e)=>{

e.preventDefault();

const name = document.getElementById("name").value.trim();
const email = document.getElementById("email").value.trim();
const description = document.getElementById("desc").value.trim();

if(!name || !email || !description){
alert("Please fill all fields");
return;
}

const data = { name,email,description };

try{

const res = await fetch(api + "/complaints",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(data)
});

const result = await res.json();

alert("Complaint Submitted!\nComplaint ID: " + result._id);

form.reset();

}catch(err){

alert("Error submitting complaint");

}

});

}


/* ---------------- TRACK COMPLAINT ---------------- */

const api = "https://womencare.onrender.com";

async function track() {
    const id = document.getElementById("cid").value.trim();

    if (!id) {
        alert("Enter Complaint ID");
        return;
    }

    try {
        const res = await fetch(api + "/complaints/" + id);
        const data = await res.json();

        if (
            !data ||
            data.status === "Invalid ID" ||
            data.status === "Complaint not found"
        ) {
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


/* ---------------- VOICE SOS ---------------- */

function startVoiceSOS(){

const SpeechRecognition =
window.SpeechRecognition || window.webkitSpeechRecognition;

if(!SpeechRecognition){
alert("Speech recognition not supported in this browser");
return;
}

const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.continuous = true;
recognition.interimResults = false;

recognition.start();

document.getElementById("status").innerText =
"Listening... Say 'help' or 'sos'";

recognition.onresult = function(event){

const speech =
event.results[event.results.length-1][0].transcript.toLowerCase();

console.log("Detected speech:",speech);

document.getElementById("status").innerText =
"You said: " + speech;

if(speech.includes("help") || speech.includes("sos")){

document.getElementById("status").innerText =
"Voice SOS detected! Sending alert...";

recognition.stop();

sendSOS();

}

};

recognition.onerror = function(event){

console.log("Voice error:",event.error);

document.getElementById("status").innerText =
"Voice error: " + event.error;

};

}