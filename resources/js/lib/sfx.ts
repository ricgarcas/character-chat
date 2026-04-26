let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!ctx) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
    }
    if (ctx.state === 'suspended') {
        void ctx.resume();
    }
    return ctx;
}

interface BlipOptions {
    freq: number;
    endFreq?: number;
    duration?: number;
    type?: OscillatorType;
    volume?: number;
}

function blip({ freq, endFreq, duration = 0.08, type = 'square', volume = 0.06 }: BlipOptions) {
    if (muted) return;
    const c = getCtx();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
}

export const sfx = {
    move: () => blip({ freq: 520, endFreq: 720, duration: 0.07, volume: 0.04 }),
    moveBack: () => blip({ freq: 520, endFreq: 360, duration: 0.07, volume: 0.04 }),
    select: () => blip({ freq: 880, endFreq: 1320, duration: 0.09, volume: 0.05 }),
    confirm: () => {
        blip({ freq: 660, duration: 0.06, volume: 0.05 });
        setTimeout(() => blip({ freq: 990, duration: 0.09, volume: 0.05 }), 50);
    },
    click: () => blip({ freq: 740, duration: 0.04, type: 'square', volume: 0.035 }),
    setMuted: (m: boolean) => {
        muted = m;
    },
};
