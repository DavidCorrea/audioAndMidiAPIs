import Device from "./device";
import { isKeyPressedEvent, isKeyReleasedEvent, midiNoteToFrequency, midiNoteToName, maxVelocity } from "./midi";
import { delayNode, gainNode, oscillatorNode } from "./nodes";

const appView = require('./app.html');
require('./app.scss');
document.write(appView);

let device = new Device();
let soundSources = {};

window.AudioContext = window.AudioContext || window.webkitAudioContext;
let context = new AudioContext();

let compressorNode = context.createDynamicsCompressor();
let firstDelayNode = delayNode(context, 0.50);
let firstDelayGainNode = gainNode(context, 0.3);
let secondDelayNode = delayNode(context, 1); 
let secondDelayGainNode = gainNode(context, 0.08);

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

                let currentOscillatorNode = oscillatorNode(context, device.oscillatorType, midiNoteToFrequency(midiMessageKey));
                let currentGainNode = gainNode(context, midiMessageVelocity / maxVelocity);
                
                currentOscillatorNode.connect(currentGainNode);
                currentGainNode.connect(compressorNode);

                currentGainNode.connect(firstDelayNode);
                firstDelayNode.connect(firstDelayGainNode);
                firstDelayGainNode.connect(compressorNode);

                currentGainNode.connect(secondDelayNode);
                secondDelayNode.connect(secondDelayGainNode);
                secondDelayGainNode.connect(compressorNode);

                compressorNode.connect(context.destination);

                currentOscillatorNode.start();

                soundSources[midiMessageKey] = { 
                    oscillator: currentOscillatorNode,
                    gain: currentGainNode,
                };
            } else if(isKeyReleasedEvent(midiMessageEvent)) {
                soundSources[midiMessageKey].oscillator.stop();
                delete soundSources[midiMessageKey];
            }

            if(Object.keys(soundSources).length === 0) {
                device.turnOffMidiInDisplay();
                device.changeVolumeDisplay(0);
            }
        };
    });
});