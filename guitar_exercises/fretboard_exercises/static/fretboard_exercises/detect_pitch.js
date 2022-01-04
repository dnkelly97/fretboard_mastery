
// This code is adapted from the ml5 library example found at this site:
// https://github.com/ml5js/ml5-library/blob/main/examples/javascript/PitchDetection/PitchDetection/sketch.js

let audioContext;
let mic;
let pitch;
let stream;
let notSetup = true;
let exerciseTimeInMs = 10000;
const modelURL = 'http://localhost:8000/static/fretboard_exercises/model';


let data = {"strings": [5, 6], "notes": ['A', 'B', 'C']}
function getNote(){
    $.ajax({
        traditional: true,
        headers: { "X-CSRFToken": token },
        url: 'http://localhost:8000/fretboard_exercises/guitar/new_note/',
        type: 'POST',
        data: data,
        success: function(data){
            console.log(data);
            $('#instruction').text(`${data.note} on string ${data.string}`);
        },
        error: function(xhr, status, error) {console.log(error); console.log(xhr); console.log(status);}
    });
}

// used only for logging to console
let firstChange;
let firstFrequency;

async function setup() {
  audioContext = await new AudioContext();
  stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  pitch = await ml5.pitchDetection(modelURL, audioContext, stream, modelLoaded);
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
