import { Tone } from "tone";
import { Midi } from "@tonejs/midi";
import { Player } from "tone";
import { Buffer } from "tone";
import { Draw } from "tone";
import { Transport } from "tone";
// import UnmuteButton from "unmute";
import mobile from "is-mobile";
import convert from "color-convert";

const height = mobile() ? window.innerHeight + "px" : "100vh";

// styles
const buttonStyle = `
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 150px;
  background: yellow;
  cursor: pointer;
`;

const messageStyle = `
  font-family: monospace;
  font-size: 2em;
`;

const messageStyleSmall = `
  font-family: monospace;
  font-size: 2em;
`;
const appContainerStyle = `
  display: grid;
  height: ${height};
  width: 100%;
  align-items: center;
  justify-items: center;
  box-sizing: border-box;
`;

const innerGridStyle = ` 
  position: relative;
  display: grid;
  height: 100%;
  width: 100%;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  box-sizing: border-box;
`;

const containerGridStyle = `
  display: grid;
  height: 100%;
  width: 100%;
  align-items: center;

  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;
  box-sizing: border-box;
  
`;

// create start button
const startButton = document.createElement("div");
startButton.style = buttonStyle;
startButton.addEventListener("click", start);
startButton.setAttribute("id", "start");

const replayButton = document.createElement("div");
replayButton.style = buttonStyle;
replayButton.addEventListener("click", replay);
replayButton.setAttribute("id", "replay");

const startText = document.createElement("span");
startText.style = messageStyle;
startText.innerText = "start";

const replayText = document.createElement("span");
replayText.style = messageStyle;
replayText.innerText = "play again";

const soundMessage = document.createElement("span");
soundMessage.style = messageStyleSmall;
soundMessage.innerText = "(turn on sound)";

// apply button styles
startButton.appendChild(startText);
startButton.appendChild(soundMessage);
replayButton.appendChild(replayText);

// create grids
const appContainer = document.createElement("div");
appContainer.setAttribute("id", "appContainer");

const containerGrid = document.createElement("div");
appContainer.setAttribute("id", "containerGrid");

const gridOne = document.createElement("div");
appContainer.setAttribute("id", "gridOne");

const gridTwo = document.createElement("div");
appContainer.setAttribute("id", "gridTwo");

// apply styles
appContainer.style = appContainerStyle;
containerGrid.style = containerGridStyle;
gridOne.style = innerGridStyle;
gridTwo.style = innerGridStyle;

// append elements
document.body.appendChild(appContainer);
appContainer.appendChild(startButton);

// create Tone.Player
const player = new Player({
  url: "./audio/bachAudio.mp3",
  fadeIn: 0,
  fadeOut: 0.1,
}).toMaster();
player.sync().start();

// on audio load, schedule drawing
Buffer.on("load", () => {
  draw();
});

//-----------------------------------------------------------------------
function shiftToBlue(val) {
  const shifted = parseFloat(val) + 240;
  if (shifted >= 360) {
    return shifted - 360;
  }
  return shifted;
}

//-----------------------------------------------------------------------
function scale(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

//-----------------------------------------------------------------------
// schedule drawing based on midi note times
async function draw() {
  //
  // get midi data
  const keysOne = await Midi.fromUrl("./midi/bachKeys1.mid");
  const keysTwo = await Midi.fromUrl("./midi/bachKeys2.mid");

  // get notes from first track
  const keysOneNotes = keysOne.tracks[0].notes;
  const keysTwoNotes = keysTwo.tracks[0].notes;

  //loop through keysOneNotes
  keysOneNotes.forEach((note) => {
    let time = note.time;
    let duration = note.duration;
    // schedule append element based on note.time
    Transport.schedule(function (time) {
      Draw.schedule(function () {
        const element = document.createElement("div");
        const row = Math.floor(scale(note.midi, 55, 72, 1, 18));
        element.style.gridArea = `1 / ${row}/ 19 / ${row}`;

        //********************** HSL COLOR ************************/

        // const hue = scale(note.midi, 55, 72, 240, 300);
        // const saturation = 100;
        // const lightness = scale(note.midi, 55, 72, 40, 50);
        // element.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        //********************** CMYK COLOR ************************/
        const cmykVar = scale(note.midi, 55, 72, 0, 100);
        const rgb = convert.cmyk.rgb([50, 100 - cmykVar, 62, 0]);
        element.style.background = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

        //********************** LAB COLOR ************************/
        // const labVariant = scale(note.midi, 55, 72, -128, 128);
        // const rgb = convert.lab.rgb([80, -69, labVariant]);
        // console.log(labVariant);
        // element.style.background = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

        gridOne.appendChild(element);

        // schedule remove element after note duration
        Draw.schedule(function () {
          gridOne.removeChild(element);
        }, time + duration + 0.05);
      }, time);
    }, time);
  });

  keysTwoNotes.forEach((note) => {
    let time = note.time;
    let duration = note.duration;
    // schedule append element based on note.time
    Transport.schedule(function (time) {
      Draw.schedule(function () {
        const element = document.createElement("div");
        const row = Math.floor(scale(note.midi, 55, 72, 1, 18));
        element.style.gridArea = `1 / ${row}/ 19 / ${row}`;

        //********************** HSL COLOR ************************/
        // const hue = scale(note.midi, 55, 72, 0, 70);
        // const saturation = 100;
        // const lightness = scale(note.midi, 55, 72, 40, 50);
        // element.style.background = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        //********************** CMYK COLOR ************************/

        const cmykVar = scale(note.midi, 55, 72, 0, 100);
        const rgb = convert.cmyk.rgb([0, 100 - cmykVar, 62, 0]);
        element.style.background = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

        //********************** LAB COLOR ************************/

        // const labLightness = scale(note.midi, 55, 72, 0, 100);
        // const rgb = convert.lab.rgb([labLightness, 46, 70]);
        // element.style.background = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        gridTwo.appendChild(element);

        // schedule remove element after note duration
        Draw.schedule(function () {
          gridTwo.removeChild(element);
        }, time + duration + 0.05);
      }, time);
    }, time);
  });
}

//-----------------------------------------------------------------------
function replay() {
  Transport.stop();
  Transport.position = 0;
  appContainer.removeChild(replayButton);
  appContainer.appendChild(containerGrid);
  containerGrid.appendChild(gridTwo);
  containerGrid.appendChild(gridOne);
  // Player.seek(0);
  Transport.start();
}

//-----------------------------------------------------------------------

// start transport
let overlayRGB = convert.cmyk.rgb([0, 100, 62, 0]);
const overlayStyle = `
position: absolute;
background-color: rgb(${overlayRGB[0]}, ${overlayRGB[1]}, ${overlayRGB[2]});
  width: 100%;
  height: 100%;

  opacity: .2;
`;

const underlayStyle = `
background-color: white;
width: 100%;
height: 100%;
position: absolute;
opacity: 1; 
`;
function start() {
  const unmuteButton = document.querySelector("#unmute-button");

  //unmuteButton.click();
  appContainer.removeChild(startButton);

  const underlay = document.createElement("div");
  underlay.style = underlayStyle;
  // appContainer.appendChild(underlay);

  appContainer.appendChild(containerGrid);
  containerGrid.appendChild(gridTwo);
  containerGrid.appendChild(gridOne);

  const overlay = document.createElement("div");
  appContainer.appendChild(overlay);
  overlay.style = overlayStyle;

  setTimeout(() => {
    let overlayRGB = convert.cmyk.rgb([100, 100, 62, 0]);

    overlay.style = `
    position: absolute;
    background-color: rgb(${overlayRGB[0]}, ${overlayRGB[1]}, ${overlayRGB[2]});
      width: 100%;
      height: 100%;
      transition-property: background-color opacity;
      transition-duration: 5s;
      opacity: .2;
    `;
  }, 1000);

  setTimeout(() => {
    console.log("done");
    appContainer.removeChild(containerGrid);
    appContainer.appendChild(replayButton);
  }, player.buffer.duration * 1000);

  // setInterval(() => {
  //   overlay.style = `background-color: cmyk(50, 0, 50, 0);
  //   width: 100%;
  //   height: 100%;
  //   position: absolute;
  //   opacity: 0.5;`;
  // }, 1);

  //

  // Transport.loop = true;
  // Transport.bpm.value = 114;
  // Transport.loopStart = 0;
  // Transport.loopEnd = player.buffer.duration;
  const pressed = unmuteButton.getAttribute("aria-pressed");
  if (mobile({ tablet: true })) {
    unmuteButton.click();
  }
  Transport.start();

  document.body.removeChild(unmuteButton);
}

//
// const pianoTrack = visualizerSquare({ vertical, pathToFiles, colorScheme }); // // get all starts and store that in Set

// containerGrid.appendChild(pianoTrack); // return container element
// then can append

// path to midi file, vertical/horizontal/all

//
