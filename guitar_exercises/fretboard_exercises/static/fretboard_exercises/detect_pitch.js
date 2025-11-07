
// This code is adapted from the ml5 library example found at this site:
// https://github.com/ml5js/ml5-library/blob/main/examples/javascript/PitchDetection/PitchDetection/sketch.js

let audioContext;
let mic;
let pitch;
let stream;
let notSetup = true;
let exerciseTimeInMs = 6000;
let target_frequency;
let score = 0;
const modelURL = 'http://localhost:8000/static/fretboard_exercises/model';


function formIsValid(){
  let data = $("#new_note_form").serialize();
  return data.includes("notes=") && data.includes("strings=");
}

function getNewNote(data){
  $.ajax({
    url: 'http://localhost:8000/fretboard_exercises/guitar/new_note/',
    type: 'POST',
    data: data,
    success: function(data){
      if(document.getElementById('note_info_display').style.display == 'none'){
        document.getElementById('note_info_display').style.display = 'block';
      }
      $('#instruction').text(`${data.note} on string ${data.string}`);
      $('#target_frequency').text(`target frequency: ${data.frequency}`);
      $('#score').text(`Score: ${score}`);
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
    $("#alert-warning").text("");
    setup().then(pauseAudio);
});

async function beginChallenge(){
  if(formIsValid()){
    await resumeAudio();
    document.getElementById("begin_button").disabled = true;
    score = 0;
    $('#new_note_form').submit();
    //$('#notes_fieldset')[0].disabled = true;
    //$('#strings_fieldset')[0].disabled = true;
    startPitchDetection().then(pauseAudio);
  }
  else{
    $("#alert-warning").text("At least one string and at least one note must be selected to begin challenge.");
  }
}

function pauseAudio(){
  audioContext.suspend().then(() => {
    console.log('Audio Context Suspended');
  });
  stream.getTracks().forEach((track) => { track.enabled = false; });
}

async function resumeAudio(){
  if(audioContext.state === 'suspended'){
    await audioContext.resume();
    console.log('Audio Context Resumed');
  }
  stream.getTracks().forEach((track) => { track.enabled = true; });
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
  await getPitch();
  let start = Date.now();
  console.log(`starting at ${new Date(start).toISOString()}`);
  let i = 0;
  while (Date.now() - start < exerciseTimeInMs) {
    let current_second = String(exerciseTimeInMs + 1000 - (Date.now() - start)).slice(this.length - 5, this.length - 3);
    $('#timer').text(`Time left: ${current_second}`);
    let frequency = await getPitch();
    console.log(`detected frequency: ${frequency} ${i}`);
    if(Math.abs(frequency - target_frequency) < 5){ //TODO what should allowable margin be?
        target_frequency = undefined;
        $("#new_note_form").submit();
        score++;
    }
    i++;
  }
  $('#timer').text(`Time left: 0`);
  console.log(`Finished at ${new Date().toISOString()}`);
  document.querySelector('#result').textContent = 'Done';
  document.getElementById("begin_button").disabled = false;
  //$('#notes_fieldset')[0].disabled = false;
  //$('#strings_fieldset')[0].disabled = false;
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
