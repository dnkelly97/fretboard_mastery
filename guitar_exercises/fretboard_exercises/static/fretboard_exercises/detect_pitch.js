
// This code is adapted from the ml5 library example found at this site:
// https://github.com/ml5js/ml5-library/blob/main/examples/javascript/PitchDetection/PitchDetection/sketch.js

let audioContext;
let mic;
let pitch;

async function startPitch() {
  audioContext ||= new AudioContext();
  stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  pitch = ml5.pitchDetection('http://localhost:8000/static/fretboard_exercises/model', audioContext , stream, modelLoaded);
}

function modelLoaded() {
  document.querySelector('#status').textContent='Model Loaded';
  let pitchInterval;
  setTimeout(() => {
    clearInterval(pitchInterval);
    document.querySelector('#result').textContent = 'Done';
    stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }, 10000);
  pitchInterval = setInterval(getPitch, 50);
}

function getPitch(start) {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      document.querySelector('#result').textContent = frequency;
    } else {
      document.querySelector('#result').textContent = 'No pitch detected';
    }
  })
}

