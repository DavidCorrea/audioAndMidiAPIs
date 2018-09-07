import Device from "./device";

const appView = require('./app.html');
require('./app.scss');
document.write(appView);

let device = new Device();

window.AudioContext = window.AudioContext || window.webkitAudioContext;
let context = new AudioContext();
let oscillators = {};
let masterGainNode = context.createGain();
let compressorNode = context.createDynamicsCompressor();

if(navigator.requestMIDIAccess) {
    console.log('¡Tenemos Acceso MIDI!');
} else {
    console.log('La demo se cancela.');
}

let midiSignalIncoming = document.getElementsByClassName('midi-input')[0];

let midiNoteToFrequency = (midiNote) => {
    return Math.pow(2, (midiNote - 69) / 12) * 440;
};

let notes = {
    0: 'C',
    1: 'C#',
    2: 'D',
    3: 'D#',
    4: 'E',
    5: 'F',
    6: 'F#',
    7: 'G',
    8: 'G#',
    9: 'A',
    10: 'A#',
    11: 'B'
};

var midiNoteToName = function(midiNoteNumber) {
    return notes[midiNoteNumber % 12];
};

navigator.requestMIDIAccess().then((midiAccess) => {
    let inputs = midiAccess.inputs;
    let outputs = midiAccess.outputs;
    let notesBeingPlayed = [];

    Array.from(inputs.values()).forEach((midiInput) => {
        midiInput.onmidimessage = (midiMessage) => {
            let midiData = midiMessage.data;

            if(midiData[0] === 144) {
                notesBeingPlayed.push('noteon');
                
                device.changeVelocityDisplayValueTo(midiData[2]);
                device.changeNoteDisplayValueTo(midiNoteToName(midiData[1]));
                device.changeVolumeDisplay(midiData[2] / 127 * 100);

                let oscillator = context.createOscillator();
                let velocity = context.createGain();
                oscillator.type = device.oscillatorType;
                oscillator.frequency.value = midiNoteToFrequency(midiData[1]);
                oscillators[midiData[1]] = oscillator;

                velocity.gain.setValueAtTime(midiData[2] / 127, context.currentTime);
                masterGainNode.gain.setValueAtTime(1, context.currentTime);

                oscillator.connect(velocity);
                velocity.connect(compressorNode);
                compressorNode.connect(masterGainNode);
                masterGainNode.connect(context.destination);

                oscillator.start();
            } else if(midiData[0] === 128) {
                notesBeingPlayed.pop();
                let oscillator = oscillators[midiData[1]];
                oscillator.stop();
                oscillators[midiData[1]] = null;
            }

            if(notesBeingPlayed.length === 0) {
                device.turnOffMidiInDisplay();
                device.changeVolumeDisplay(0);
            } else {
                device.turnOnMidiInDisplay();
            }
        }
    });

}, () => {
    console.log('La demo se cancela.');
});