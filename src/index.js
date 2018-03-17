import io from 'socket.io-client';
import Tone from 'Tone';

const el = document.getElementById('server-time');
const synth = new Tone.Synth().toMaster();

synth.triggerAttackRelease("C4", "4n");
synth.triggerAttackRelease("D4", "4n");
synth.triggerAttackRelease("E4", "4n");
synth.triggerAttackRelease("F4", "4n");
synth.triggerAttackRelease("G4", "4n");

const socket = io();
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