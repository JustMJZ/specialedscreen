export const ROTATION_SOUNDS = [
  { id: 'none', name: '🔇 None', type: 'none' },
  { id: 'chime', name: '✨ Wind Chime', type: 'synth' },
  { id: 'buzzer', name: '📢 Buzzer', type: 'synth' },
  { id: 'bell', name: '🛎️ School Bell', type: 'synth' },
  { id: 'whistle', name: '🎵 Whistle', type: 'synth' },
  { id: 'marimba', name: '🎹 Marimba', type: 'synth' },
  { id: 'gong', name: '🔔 Gong', type: 'synth' },
  { id: 'birds', name: '🐦 Birds', type: 'synth' },
  { id: 'clap', name: '👏 Clap', type: 'synth' },
  { id: 'train', name: '🚂 Train', type: 'synth' },
];

export const playSynthSound = (soundId, volume = 0.7) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const vol = Math.max(0, Math.min(1, volume));

    // Master volume node
    const master = ctx.createGain();
    master.gain.value = vol;
    master.connect(ctx.destination);

    if (soundId === 'chime') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 1);
        osc.connect(gain); gain.connect(master);
        osc.start(now + i * 0.15); osc.stop(now + i * 0.15 + 1);
      });
    } else if (soundId === 'buzzer') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.value = 220;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain); gain.connect(master);
      osc.start(now); osc.stop(now + 0.5);
    } else if (soundId === 'bell') {
      [830, 1245, 1660].forEach((freq) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.connect(gain); gain.connect(master);
        osc.start(now); osc.stop(now + 1.5);
      });
    } else if (soundId === 'whistle') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
      osc.frequency.linearRampToValueAtTime(800, now + 0.6);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain); gain.connect(master);
      osc.start(now); osc.stop(now + 0.8);
    } else if (soundId === 'marimba') {
      [262, 330, 392, 523, 392, 330].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
        osc.connect(gain); gain.connect(master);
        osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.4);
      });
    } else if (soundId === 'gong') {
      [130, 260, 390].forEach((freq) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3);
        osc.connect(gain); gain.connect(master);
        osc.start(now); osc.stop(now + 3);
      });
    } else if (soundId === 'birds') {
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine';
        const baseFreq = 2000 + Math.random() * 1000;
        osc.frequency.setValueAtTime(baseFreq, now + i * 0.2);
        osc.frequency.linearRampToValueAtTime(baseFreq + 500, now + i * 0.2 + 0.05);
        osc.frequency.linearRampToValueAtTime(baseFreq - 200, now + i * 0.2 + 0.1);
        gain.gain.setValueAtTime(0.15, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.15);
        osc.connect(gain); gain.connect(master);
        osc.start(now + i * 0.2); osc.stop(now + i * 0.2 + 0.15);
      }
    } else if (soundId === 'clap') {
      for (let i = 0; i < 3; i++) {
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.2));
        const source = ctx.createBufferSource(); const gain = ctx.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(0.5, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.1);
        source.connect(gain); gain.connect(master);
        source.start(now + i * 0.15);
      }
    } else if (soundId === 'train') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0.2, now + 0.3);
      gain.gain.setValueAtTime(0.001, now + 0.35);
      gain.gain.setValueAtTime(0.25, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain); gain.connect(master);
      osc.start(now); osc.stop(now + 1.2);
    }

    setTimeout(() => ctx.close(), 4000);
  } catch (e) {
    console.log('Web Audio not supported');
  }
};

export const playSound = (soundId, customSounds, volume = 0.7) => {
  if (soundId === 'none') return;

  const builtIn = ROTATION_SOUNDS.find(s => s.id === soundId);
  if (builtIn && builtIn.type === 'synth') {
    playSynthSound(soundId, volume);
    return;
  }

  const custom = (customSounds || []).find(s => s.id === soundId);
  if (custom && custom.dataUrl) {
    try {
      const audio = new Audio(custom.dataUrl);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch(e => console.log('Audio playback failed:', e.message));
    } catch (e) {
      console.log('Audio playback error');
    }
  }
};
