
// This code is adapted from the ml5 library example found at this site:
// https://github.com/ml5js/ml5-library/blob/main/examples/javascript/PitchDetection/PitchDetection/sketch.js

let audioContext;
let mic;
let pitch;
let stream;
let notSetup = true;
let exerciseTimeInMs = 10000;

// used only for logging to console
let firstChange;
let firstFrequency;

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
  firstFrequency = true;
  firstChange = true;
  stream.getTracks().forEach((track) => { track.enabled = true; });
  let start = Date.now();
  console.log(`starting at ${String(start).slice(this.length - 5, this.length - 3)}`);
  while (Date.now() - start < exerciseTimeInMs) {
    await getPitch();
  }
  console.log(`Finished at ${String(Date.now()).slice(this.length - 5, this.length - 3)}`);
  document.querySelector('#result').textContent = 'Done';
  stream.getTracks().forEach(function(track) {
    track.enabled = false;
  });
}

async function getPitch(start) {
  return pitch.getPitch(function(err, frequency) {
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
