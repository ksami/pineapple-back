import io from 'socket.io-client';
import Keyboard from 'piano-keyboard';
import 'piano-keyboard/index.css';
import Tone from 'Tone';

const el = document.getElementById('server-time');
const synth = new Tone.Synth().toMaster();
const keyboard = new Keyboard({
  element: document.getElementById('piano'),
  range: ['c3', 'd6'],
  ally: false
});

keyboard.on('noteOn', (data) => play(data.which, true));
keyboard.on('noteOff', (data) => play(data.which, false));


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


function welcome() {
  const t = new Tone.Time("8n");
  ["C4", "E4", "G4", "C5"].forEach((note) => {
    synth.triggerAttackRelease(note, "8n", t.add("8n"));
  });

  console.log("Welcome!");
}

function play(midiNote, isOn) {
  const note = new Tone.Frequency(midiNote, "midi").toNote();

  if(isOn) {
    synth.triggerAttack(note);
  } else {
    synth.triggerRelease();
  }

  socket.emit("music", {
    message: isOn ? "on" : "off",  // on or off
    note: note  // or midi number or hz
  });
}
