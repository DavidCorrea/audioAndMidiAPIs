class Device {
    constructor() {
        this.midiInDisplay = document.getElementsByClassName('display')[0];

        this.noteDisplayValue = document.getElementById('note-display-value');
        this.velocityDisplayValue = document.getElementById('velocity-display-value');

        this.oscillatorType = 'sawtooth';
        this.oscillatorTypes = ['sine', 'square', 'sawtooth', 'triangle'];
    };

    turnOnMidiInDisplay() {
        this.midiInDisplay.classList.add('receiving');
        this.midiInDisplay.classList.remove('not-receiving');
    };

    turnOffMidiInDisplay() {
        this.midiInDisplay.classList.add('not-receiving');
        this.midiInDisplay.classList.remove('receiving');
    };

    changeVelocityDisplayValueTo(newValue) {
        this.velocityDisplayValue.innerHTML = newValue;
    };

    changeNoteDisplayValueTo(newValue) {
        this.noteDisplayValue.innerHTML = newValue;
    };
}

export default Device;