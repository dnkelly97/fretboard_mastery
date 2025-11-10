import { PitchDetector } from "https://esm.sh/pitchy@4";

let audioContext;
let analyzerNode;
let pitchDetector;
let stream;
let exerciseTimeInMs = 6000;
let target_frequency;
let score = 0;
const TARGET_FREQUENCY_MARGIN = 5; //TODO what should allowable margin be?

$(document).ready(function(){
  overrideFormSubmit();
  $("#alert-warning").text("");
  setup().then(pauseAudio);
});

function overrideFormSubmit()
{
  $('#new_note_form').submit(function(e){
    e.preventDefault();
    if(formIsValid()){
      runChallenge();
    }
    else{
      $("#alert-warning").text("At least one string and at least one note must be selected to begin challenge.");
    }
  });
}

async function setup() {
  audioContext = new AudioContext();
  analyzerNode = audioContext.createAnalyser();
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext.createMediaStreamSource(stream).connect(analyzerNode);
  pitchDetector = PitchDetector.forFloat32Array(analyzerNode.fftSize);
  enableForm();
  console.log('setup complete');
}

function enableForm()
{
  $('#begin_button').prop('disabled', false);
  //$('#notes_fieldset')[0].disabled = false;
  //$('#strings_fieldset')[0].disabled = false;
}

function disableForm()
{
  $('#begin_button').prop('disabled', true);
  //$('#notes_fieldset')[0].disabled = true;
  //$('#strings_fieldset')[0].disabled = true;
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

function formIsValid(){
  let data = $("#new_note_form").serialize();
  return data.includes("notes=") && data.includes("strings=");
}

async function runChallenge(){
  await challengeSetup();
  let startTime = Date.now();
  await runPitchDetection(startTime)
  challengeTeardown(startTime);
}

async function challengeSetup()
{
  await resumeAudio();
  disableForm();
  score = 0;
  getNewNote();
}

function getNewNote(){
  target_frequency = undefined;
  let data = $("#new_note_form").serialize();
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

async function runPitchDetection(startTime)
{
  console.log(`starting at ${new Date(startTime).toISOString()}`);
  while (challengeTimerNotElapsed(startTime)) 
  {
    let frequency = getPitch();
    showUpdatedTimeLeft(startTime);
    showUpdatedResult(frequency);
    if(correctNotePlayed(frequency))
    {
      getNewNote();
      score++;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

function challengeTimerNotElapsed(startTime)
{
  return Date.now() - startTime < exerciseTimeInMs;
}

function getPitch() 
{
  let input = new Float32Array(analyzerNode.fftSize);
  analyzerNode.getFloatTimeDomainData(input);
  console.log(input.slice(0, 10));
  const [frequency, clarity] = pitchDetector.findPitch(input, audioContext.sampleRate);
  console.log(`clarity: ${clarity}`);
  console.log(`frequency: ${frequency}`);
  return clarity > 0.85 ? frequency : "No pitch detected";
}

function showUpdatedTimeLeft(startTime)
{
  let current_second = Math.ceil((exerciseTimeInMs - (Date.now() - startTime)) / 1000);
  $('#timer').text(`Time left: ${Math.max(current_second, 0)}`);
}

function showUpdatedResult(result)
{
  $('#result').text(result);
}

function correctNotePlayed(frequency)
{
  return Math.abs(frequency - target_frequency) < TARGET_FREQUENCY_MARGIN;
}

function challengeTeardown(startTime)
{
  console.log(`Finished at ${new Date().toISOString()}`);
  showUpdatedTimeLeft(startTime);
  showUpdatedResult('Done');
  enableForm();
  pauseAudio();
}
