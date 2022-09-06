


import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

const randomBetween = (min, max) => Math.random() * (max - min) + min;

export class Art {
    constructor(audioContext, canvas, smokeGeo, smokeMaterial) {
        this.smokeGeo = smokeGeo;
        this.smokeMaterial = smokeMaterial;
        this.x = Math.floor(Math.random() * canvas.width);
        this.y = Math.floor(Math.random() * canvas.height);
        this.randomCoordinates(canvas)
        this.width = Math.floor(Math.random() * 50);
        this.random = randomBetween(0, canvas.width);
        this.id = Math.random() * 100000000;
        this.audioContext = audioContext;
        this.oscillator = this.audioContext.createOscillator();
        this.output = this.audioContext.createGain();
        this.oscillator.type = 'sine';
        this.oscillator.start();
        this.output.gain.value = 0.0001
        const convolver = this.audioContext.createConvolver();
        this.convolver = convolver;
        convolver.buffer = this.impulseResponseBuffer(4, 4, false);
        this.output.connect(convolver);
        this.oscillator.connect(this.output);
        this.output.connect(this.audioContext.destination)
        // convolver.connect(this.output);
        convolver.connect(this.audioContext.destination);

        this.output.gain.linearRampToValueAtTime(randomBetween(0.09, 0.39), this.audioContext.currentTime + randomBetween(0, 1))

        this.notes = [
            { q: 261.63, color: 'rgba(97, 7, 181, 1)', r: [97, 7, 181] },
            { q: 311.13, color: 'rgba(63, 5, 117, 1)', r: [63, 5, 117] },
            { q: 349.23, color: 'rgba(130, 10, 245, 1)', r: [130, 10, 245] },
            { q: 392, color: 'rgba(118, 9, 219, 1)', r: [118, 9, 219] },
            { q: 311.13, color: 'rgba(115, 7, 181, 1)', r: [115, 7, 181] },
            { q: 466.16, color: 'rgba(155, 10, 245, 1)', r: [155, 10, 245] },
            { q: 523.25, color: 'rgba(139, 9, 219, 1)', r: [139, 9, 219] },
            { q: 587.33, color: 'rgba(74, 0, 117, 1)', r: [74, 0, 117] },
            { q: 622.25, color: 'rgba(74, 0, 117, 1)', r: [74, 0, 117] }]

        const note = this.notes[Math.floor(Math.random() * this.notes.length)]
        this.note = note.q;
        this.color = note.color;
        this.spectrum = note.r;
        this.width = this.output.gain.value * 100
        const ra = Math.random() < .5 ? Math.random() < .5 ? 4 : 3 : Math.random() < .5 ? 2 : 1
        this.oscillator.frequency.value = this.note / ra;
        this.output.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + randomBetween(3, 10))
        this.particle = this.createParticle();

    }

    randomCoordinates(canvas) {
        const speed = Math.random() * (0.30 - 0.18) + 0.18; //0.1 - 0.35
        const radius = randomBetween(100, 200); // 100 - 500
        const angle = 0;
        const direction = Math.random() < 0.5 ? -1 : 1;
        const circleCenterX = randomBetween(0, canvas.width); //250 - 550
        const circleCenterY = randomBetween(0, canvas.height); //150 - 550
        const sizeOfParticle = randomBetween(1, 3);
        const X = randomBetween(30, 230);
        const Y = randomBetween(290, 360);
        this.particleProperties = [speed, radius, angle, direction, circleCenterX, circleCenterY, sizeOfParticle, X, Y];
    }

    impulseResponseBuffer(duration, decay, reverse) {
        let sampleRate = this.audioContext.sampleRate;
        let length = sampleRate * duration;
        let impulse = this.audioContext.createBuffer(2, length, sampleRate);
        let impulseL = impulse.getChannelData(0);
        let impulseR = impulse.getChannelData(1);

        if (!decay)
            decay = 2.0;
        for (let i = 0; i < length; i++) {
            let n = reverse ? length - i : i;
            impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
            impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        }
        return impulse;
    }

    createParticle() {
        const particle = new THREE.Mesh(this.smokeGeo, this.smokeMaterial);
        particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, 0);
        particle.rotation.z = Math.random() * 360;
        particle.material.opacity = this.output.gain.value * 10
        return particle;
    }


    move() {
        this.particleProperties[0] = this.output.gain.value
        this.random += this.output.gain.value * 5;
        this.y += 2;
        this.x += 2;

        if (this.output.gain.value <= 0) {
            this.oscillator.disconnect()
            this.convolver.disconnect();
            this.output.disconnect();
            console.log(this.convolver, this.output)
        }

    }
}
