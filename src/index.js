import io from 'socket.io-client';
import Tone from 'Tone';

const el = document.getElementById('server-time');
const synth = new Tone.Synth().toMaster();


const socket = io();
socket.on("connect", welcome);

socket.on('time', (timeString) => {
  el.innerHTML = 'Server time: ' + timeString;
});

socket.on("music", (data) => {
  console.log("Received", data);
  switch(data.message) {
    case "on":
      synth.triggerAttack(data.note);
      break;
    case "off":
      synth.triggerRelease();
      break;
    default:
      console.log("Invalid music message received", data);
      break;
  }
});

let alt = true;
setInterval(() => {
  socket.emit("music", {
    message: alt ? "on" : "off",  // on or off
    note: "A4"  // or midi number or hz
  });
  alt = !alt;
}, 500);


function welcome() {
  const t = new Tone.Time("8n");
  ["C4", "E4", "G4", "C5"].forEach((note) => {
    synth.triggerAttackRelease(note, "8n", t.add("8n"));
  });

  console.log("Welcome!");
}
