import Device from "./device";
import { isKeyPressedEvent, isKeyReleasedEvent, midiNoteToFrequency, midiNoteToName, maxVelocity } from "./midi";

const appView = require('./app.html');
require('./app.scss');
document.write(appView);

window.AudioContext = window.AudioContext || window.webkitAudioContext;
let context = new AudioContext();

let device = new Device();

let oscillators = {};
let masterGainNode = context.createGain();
let compressorNode = context.createDynamicsCompressor();
let firstDelayNode = context.createDelay();
let firstDelayGainNode = context.createGain();
firstDelayNode.delayTime.value = 0.50;
let secondDelayNode = context.createDelay();
let secondDelayGainNode = context.createGain();
secondDelayNode.delayTime.value = 1;
let filterNode = context.createBiquadFilter();

navigator.requestMIDIAccess().then((midiAccess) => {
    let inputs = midiAccess.inputs;

    Array.from(inputs.values()).forEach((midiInput) => {
        midiInput.onmidimessage = (midiMessage) => {
            let midiData = midiMessage.data;
            let midiDataEvent = midiData[0];
            let midiDataKey = midiData[1];
            let midiDataVelocity = midiData[2];
            
            if(isKeyPressedEvent(midiDataEvent)) {
                device.turnOnMidiInDisplay();

                device.changeVelocityDisplayValueTo(midiDataVelocity);
                device.changeNoteDisplayValueTo(midiNoteToName(midiDataKey));
                device.changeVolumeDisplay(midiDataVelocity / maxVelocity * 100);

                let oscillatorNode = context.createOscillator();
                let velocityNode = context.createGain();

                oscillatorNode.type = device.oscillatorType;
                oscillatorNode.frequency.value = midiNoteToFrequency(midiDataKey);
                oscillators[midiDataKey] = oscillatorNode;

                velocityNode.gain.setValueAtTime(midiDataVelocity / maxVelocity, context.currentTime);
                masterGainNode.gain.setValueAtTime(1, context.currentTime);

                oscillatorNode.connect(velocityNode);
                velocityNode.connect(compressorNode);
                compressorNode.connect(filterNode);
                
                firstDelayGainNode.gain.setValueAtTime(0.3, context.currentTime);
                compressorNode.connect(firstDelayGainNode);
                firstDelayGainNode.connect(firstDelayNode);
                firstDelayNode.connect(filterNode);

                secondDelayGainNode.gain.setValueAtTime(0.08, context.currentTime);
                compressorNode.connect(secondDelayGainNode);
                secondDelayGainNode.connect(secondDelayNode);
                secondDelayNode.connect(filterNode);

                filterNode.type = "lowshelf";
                filterNode.frequency.setValueAtTime(1000, context.currentTime);
                filterNode.gain.setValueAtTime(25, context.currentTime);

                filterNode.connect(masterGainNode);
                masterGainNode.connect(context.destination);

                oscillatorNode.start();
            } else if(isKeyReleasedEvent(midiDataEvent)) {
                oscillators[midiDataKey].stop();
                delete oscillators[midiDataKey];
            }

            if(Object.keys(oscillators).length === 0) {
                device.turnOffMidiInDisplay();
                device.changeVolumeDisplay(0);
            }
        }
    });
}, () => {
    console.log('La demo se cancela.');
});