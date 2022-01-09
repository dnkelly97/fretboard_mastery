
// This code is adapted from the ml5 library example found at this site:
// https://github.com/ml5js/ml5-library/blob/main/examples/javascript/PitchDetection/PitchDetection/sketch.js

let audioContext;
let mic;
let pitch;
let stream;
let notSetup = true;
let exerciseTimeInMs = 30000;
let target_frequency;
const modelURL = 'http://localhost:8000/static/fretboard_exercises/model';


function getNewNote(data){
  $.ajax({
    url: 'http://localhost:8000/fretboard_exercises/guitar/new_note/',
    type: 'POST',
    data: data,
    success: function(data){
//                console.log(data);
        if(document.getElementById('note_info_display').style.display == 'none'){
            document.getElementById('note_info_display').style.display = 'block';
        }
        $('#instruction').text(`${data.note} on string ${data.string}`);
        $('#target_frequency').text(`target frequency: ${data.frequency}`);
        target_frequency = data.frequency;
    },
    error: function(xhr, status, error) {console.log(error); console.log(xhr); console.log(status);}
  });
}

$(document).ready(function(){
    $('#new_note_form').submit(function(e){
        e.preventDefault();
        let data = $(this).serialize();
        getNewNote(data);
    });
});

async function beginChallenge(){
  document.getElementById("begin_button").disabled = true;
  if(notSetup){
    await setup();
  }
  $('#new_note_form').submit();
  startPitchDetection();
}

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
  stream.getTracks().forEach((track) => { track.enabled = true; });
  let start = Date.now();
  console.log(`starting at ${String(start).slice(this.length - 5, this.length - 3)}`);
  while (Date.now() - start < exerciseTimeInMs) {
    let frequency = await getPitch();
    if(Math.abs(frequency - target_frequency) < 5){ //TODO what should allowable margin be?
        target_frequency = undefined;
        $("#new_note_form").submit();
    }
  }
  console.log(`Finished at ${String(Date.now()).slice(this.length - 5, this.length - 3)}`);
  document.querySelector('#result').textContent = 'Done';
  stream.getTracks().forEach(function(track) {
    track.enabled = false;
  });
  document.getElementById("begin_button").disabled = false;
}

async function getPitch(start) {
  return pitch.getPitch(function(err, frequency) {
    if (frequency) {
      document.querySelector('#result').textContent = frequency;
    } else {
      document.querySelector('#result').textContent = 'No pitch detected';
    }
  })
}
