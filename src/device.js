class Device {
    constructor() {
        this.midiInDisplay = document.getElementsByClassName('display')[0];

        this.noteDisplayValue = document.getElementById('note-display-value');
        this.velocityDisplayValue = document.getElementById('velocity-display-value');

        this.sineButton = document.getElementById('sine-button');
        this.squareButton = document.getElementById('square-button');
        this.sawtoothButton = document.getElementById('sawtooth-button');
        this.triangleButton = document.getElementById('triangle-button');
        
        this.oscillatorType = 'sine';
        this.currentyActiveButton = this.sineButton;

        this.sineButton.onclick = () => {
            this._changeSelectedButtonTo(this.sineButton);
            this.oscillatorType = 'sine';
        };

        this.squareButton.onclick = () => {
            this._changeSelectedButtonTo(this.squareButton);
            this.oscillatorType = 'square';
        };

        this.sawtoothButton.onclick = () => {
            this._changeSelectedButtonTo(this.sawtoothButton);
            this.oscillatorType = 'sawtooth';
        };

        this.triangleButton.onclick = () => {
            this._changeSelectedButtonTo(this.triangleButton);
            this.oscillatorType = 'triangle';
        };

        this.volumeLeft = document.getElementById('volume-left');
        this.volumeRight = document.getElementById('volume-right');
    };

    _changeSelectedButtonTo(newSelectedButton) {
        this.currentyActiveButton.classList.remove('active');
        this.currentyActiveButton.classList.add('inactive');
        this.currentyActiveButton = newSelectedButton;
        this.currentyActiveButton.classList.remove('inactive');
        this.currentyActiveButton.classList.add('active');
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

    changeVolumeDisplay(newPercentage) {
        let height = 100 - newPercentage;
        this.volumeLeft.style.setProperty('clip-path', "polygon(0px " + height + "%, 100% " + height + "%, 100% 100%, 0% 100%)");
        this.volumeRight.style.setProperty('clip-path', "polygon(0px " + height + "%, 100% " + height + "%, 100% 100%, 0% 100%)");
    };
}

export default Device;