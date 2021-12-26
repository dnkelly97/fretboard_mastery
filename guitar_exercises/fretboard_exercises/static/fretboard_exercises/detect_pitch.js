
// This code is adapted from the ml5 library example found at this site:
// https://github.com/ml5js/ml5-library/blob/main/examples/javascript/PitchDetection/PitchDetection/sketch.js

let audioContext;
let mic;
let pitch;
let stream;
let notSetup = true;

// used only for logging to console
let firstFrequency = true;
let firstChange = true;

async function setup() {
  audioContext = await new AudioContext();
  stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  pitch = await ml5.pitchDetection('http://localhost:8000/static/fretboard_exercises/model', audioContext, stream, modelLoaded);
  notSetup = false;
  console.log('setup complete:');
}

function modelLoaded() {
  document.querySelector('#status').textContent='Model Loaded';
}

async function startPitchDetection(){
  if(notSetup){
    await setup();
  }
  stream.getTracks().forEach((track) => { track.enabled = true; });
  let pitchInterval;
  setTimeout(() => {
    clearInterval(pitchInterval);
    document.querySelector('#result').textContent = 'Done';
    stream.getTracks().forEach(function(track) {
      track.enabled = false;
    });
    console.log(`timeout executed at ${String(Date.now()).slice(this.length - 5, this.length - 3)}`);
  }, 10000);
  console.log(`timeout set at ${String(Date.now()).slice(this.length - 5, this.length - 3)}`);
  pitchInterval = setInterval(getPitch, 47);
}

function getPitch(start) {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      document.querySelector('#result').textContent = frequency;
      if (firstFrequency) {
        console.log(`first frequency detected at ${String(Date.now()).slice(this.length - 5, this.length - 3)}`);
        firstFrequency = false;
      }
    } else {
      document.querySelector('#result').textContent = 'No pitch detected';
      if (firstChange) {
        console.log(`first change executed at ${String(Date.now()).slice(this.length - 5, this.length - 3)}`);
        firstChange = false;
      }
    }
  })
}
