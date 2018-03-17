import io from 'socket.io-client';
import Keyboard from 'piano-keyboard';
import 'piano-keyboard/index.css';
import Tone from 'Tone';

const analyser = new Tone.Analyser({
  size : 1024,
  type : 'fft',
  smoothing : 0.8
});
const synth = new Tone.Synth({
  oscillator: {
    type: 'fatsawtooth'
  },
  envelope: {
    attack: 0.005,
    decay: 0.1,
    sustain: 0.3,
    release: 1
  }
});
synth.connect(analyser).connect(Tone.Master);

const keyboard = new Keyboard({
  element: document.getElementById('piano'),
  range: ['c3', 'c#6'],
  ally: false
});

keyboard.on('noteOn', (data) => play(data.which, true));
keyboard.on('noteOff', (data) => play(data.which, false));


const socket = io();
socket.on("connect", welcome);

socket.on('time', (timeString) => {
  document.getElementById('server-time').innerHTML = 'Server time: ' + timeString;
});

socket.on("music", (data) => {
  console.log("Received", data);
  switch (data.message) {
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

  if (isOn) {
    synth.triggerAttack(note);
  } else {
    synth.triggerRelease();
  }

  socket.emit("music", {
    message: isOn ? "on" : "off",  // on or off
    note: note  // or midi number or hz
  });
}


const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

function draw() {
  requestAnimationFrame(draw);

  ctx.clearRect(0, 0, canvas.width, canvas.height);  // clear canvas

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgb(0, 0, 0)';

  ctx.beginPath();
  ctx.moveTo(0, 0);

  const dataArray = analyser.getValue();

  const sliceWidth = canvas.width * 1.0 / dataArray.length;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {

    const y = (dataArray[i] + 140) * 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.stroke();
}

draw();