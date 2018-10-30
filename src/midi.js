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

export function midiNoteToFrequency (midiNote) {
    return Math.pow(2, (midiNote - 69) / 12) * 440;
};

export function midiNoteToName (midiNote) {
    return notes[midiNote % 12];
}

export function isKeyPressedEvent (midiEvent) {
    return midiEvent === 144;
}

export function isKeyReleasedEvent (midiEvent) {
    return midiEvent === 128;
}

export const maxVelocity = 127;