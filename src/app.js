import Device from "./device";
import { isKeyPressedEvent, isKeyReleasedEvent, midiNoteToFrequency, midiNoteToName, maxVelocity } from "./midi";

// jsmidi.davejco.com

const appView = require('./app.html');
require('./app.scss');
document.write(appView);

let device = new Device();
let soundSources = {};

window.AudioContext = window.AudioContext || window.webkitAudioContext;
let context = new AudioContext();

let compressorNode = context.createDynamicsCompressor();

navigator.requestMIDIAccess().then((midiAccess) => {
    let inputs = midiAccess.inputs;

    midiAccess.onstatechange = () => {
        inputs = midiAccess.inputs;
        device.changeNoteDisplayValueTo('-');
        device.changeVelocityDisplayValueTo('-');
    };

    Array.from(inputs.values()).forEach((midiInput) => {
        midiInput.onmidimessage = (midiMessage) => {
            let midiMessageData = midiMessage.data;
            let midiMessageEvent = midiMessageData[0];
            let midiMessageKey = midiMessageData[1];
            let midiMessageVelocity = midiMessageData[2];

            if(isKeyPressedEvent(midiMessageEvent)) {
                device.turnOnMidiInDisplay();
                
                device.changeNoteDisplayValueTo(midiNoteToName(midiMessageKey));
                device.changeVelocityDisplayValueTo(midiMessageVelocity);
                device.changeVolumeDisplay(midiMessageVelocity / maxVelocity * 100);

                let oscillatorNode = context.createOscillator();

                let firstDelayNode = context.createDelay();
                firstDelayNode.delayTime.value = 0.50;
                let firstDelayGainNode = context.createGain();
                firstDelayGainNode.gain.setValueAtTime(0.3, context.currentTime);

                let secondDelayNode = context.createDelay();
                secondDelayNode.delayTime.value = 1;
                let secondDelayGainNode = context.createGain();
                secondDelayGainNode.gain.setValueAtTime(0.08, context.currentTime);

                let gainNode = context.createGain();
                gainNode.gain.setValueAtTime(midiMessageVelocity / maxVelocity, context.currentTime);

                oscillatorNode.type = device.oscillatorType;
                oscillatorNode.frequency.value = midiNoteToFrequency(midiMessageKey);

                oscillatorNode.connect(gainNode);
                gainNode.connect(compressorNode);

                gainNode.connect(firstDelayNode);
                firstDelayNode.connect(firstDelayGainNode);
                firstDelayGainNode.connect(compressorNode);

                gainNode.connect(secondDelayNode);
                secondDelayNode.connect(secondDelayGainNode);
                secondDelayGainNode.connect(compressorNode);

                compressorNode.connect(context.destination);

                oscillatorNode.start();
                soundSources[midiMessageKey] = oscillatorNode;
            } else if(isKeyReleasedEvent(midiMessageEvent)) {
                soundSources[midiMessageKey].stop();
                delete soundSources[midiMessageKey];
            }

            if(Object.keys(soundSources).length === 0) {
                device.turnOffMidiInDisplay();
                device.changeVolumeDisplay(0);
            }
        };
    });
});