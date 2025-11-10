import { PitchDetector } from "https://esm.sh/pitchy@4";

let audioContext;
let analyzerNode;
let pitchDetector;
let stream;
let notSetup = true;
let exerciseTimeInMs = 6000;
let target_frequency;
let score = 0;

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
        beginChallenge();
    });
    $("#alert-warning").text("");
    setup().then(pauseAudio);
});

async function beginChallenge(){
  if(formIsValid()){
    await resumeAudio();
    document.getElementById("begin_button").disabled = true;
    score = 0;
    let data = $("#new_note_form").serialize();
    getNewNote(data);
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
}

async function resumeAudio(){
  if(audioContext.state === 'suspended'){
    await audioContext.resume();
    console.log('Audio Context Resumed');
  }
}

async function setup() {
  audioContext = await new AudioContext();
  analyzerNode = audioContext.createAnalyser();
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext.createMediaStreamSource(stream).connect(analyzerNode);
  pitchDetector = PitchDetector.forFloat32Array(analyzerNode.fftSize);
  notSetup = false;
  console.log('setup complete');
}

function modelLoaded() {
  document.querySelector('#status').textContent='Model Loaded';
}

async function startPitchDetection(){
  let start = Date.now();
  console.log(`starting at ${new Date(start).toISOString()}`);

  while (Date.now() - start < exerciseTimeInMs) {
    let current_second = Math.ceil((exerciseTimeInMs - (Date.now() - start)) / 1000);
    $('#timer').text(`Time left: ${current_second}`);
    let frequency = getPitch();
    $('#result').text(frequency);
    if(Math.abs(frequency - target_frequency) < 5){ //TODO what should allowable margin be?
        target_frequency = undefined;
        $("#new_note_form").submit();
        score++;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  $('#timer').text(`Time left: 0`);
  console.log(`Finished at ${new Date().toISOString()}`);
  document.querySelector('#result').textContent = 'Done';
  document.getElementById("begin_button").disabled = false;
  //$('#notes_fieldset')[0].disabled = false;
  //$('#strings_fieldset')[0].disabled = false;
}

function getPitch() {
  let input = new Float32Array(analyzerNode.fftSize);
  analyzerNode.getFloatTimeDomainData(input);
  console.log(input.slice(0, 10));
  const [frequency, clarity] = pitchDetector.findPitch(input, audioContext.sampleRate);
  console.log(`clarity: ${clarity}`);
  console.log(`frequency: ${frequency}`);
  return clarity > 0.85 ? frequency : "No pitch detected";
}
