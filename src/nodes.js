export function delayNode (context, delayValue) {
    let delayNode = context.createDelay();
    delayNode.delayTime.value = delayValue;

    return delayNode;
};

export function gainNode (context, gainValue) {
    let gainNode = context.createGain();
    gainNode.gain.setValueAtTime(gainValue, context.currentTime);

    return gainNode;
};

export function oscillatorNode (context, type, frequency) {
    let oscillatorNode = context.createOscillator();
    oscillatorNode.type = type;
    oscillatorNode.frequency.value = frequency;

    return oscillatorNode;
};