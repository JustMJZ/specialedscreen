export const ROTATION_SOUNDS = [
  { id: 'none', name: '🔇 None', type: 'none' },
  { id: 'chime', name: '✨ Wind Chime', type: 'synth' },
  { id: 'bell', name: '🛎️ School Bell', type: 'synth' },
  { id: 'marimba', name: '🎹 Marimba', type: 'synth' },
  { id: 'train', name: '🚂 Train', type: 'synth' },
  { id: 'jingleGlow', name: '🌟 Glow Jingle', type: 'synth' },
  { id: 'jingleRise', name: '🎶 Rise Jingle', type: 'synth' },
  { id: 'jingleCalm', name: '🌈 Calm Jingle', type: 'synth' },
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
    } else if (soundId === 'bell') {
      [830, 1245, 1660].forEach((freq) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        osc.connect(gain); gain.connect(master);
        osc.start(now); osc.stop(now + 1.5);
      });
    } else if (soundId === 'marimba') {
      [262, 330, 392, 523, 392, 330].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
        osc.connect(gain); gain.connect(master);
        osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.4);
      });
    } else if (soundId === 'train') {
      // Softer "train" cue: low chug + airy steam (less harsh)
      const low = ctx.createOscillator();
      const lowGain = ctx.createGain();
      low.type = 'triangle';
      low.frequency.setValueAtTime(120, now);
      low.frequency.exponentialRampToValueAtTime(90, now + 1.2);
      lowGain.gain.setValueAtTime(0.001, now);
      lowGain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
      lowGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      const chug = ctx.createOscillator();
      const chugGain = ctx.createGain();
      chug.type = 'sine';
      chug.frequency.setValueAtTime(180, now);
      chugGain.gain.setValueAtTime(0.001, now);
      [0.0, 0.25, 0.5, 0.75].forEach((t) => {
        chugGain.gain.exponentialRampToValueAtTime(0.18, now + t + 0.03);
        chugGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.12);
      });

      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.15));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.Q.value = 0.7;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      low.connect(lowGain); lowGain.connect(master);
      chug.connect(chugGain); chugGain.connect(master);
      noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(master);

      low.start(now); low.stop(now + 1.4);
      chug.start(now); chug.stop(now + 1.0);
      noise.start(now); noise.stop(now + 0.6);
    } else if (soundId === 'jingleGlow') {
      // Gentle longer jingle with soft shimmer
      const freqs = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, now + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.25 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.5);
        osc.connect(gain); gain.connect(master);
        osc.start(now + i * 0.25); osc.stop(now + i * 0.25 + 0.6);
      });
    } else if (soundId === 'jingleRise') {
      // Bright rising jingle
      const base = [392, 494, 587, 784, 988, 1174];
      base.forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, now + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.22 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.22 + 0.45);
        osc.connect(gain); gain.connect(master);
        osc.start(now + i * 0.22); osc.stop(now + i * 0.22 + 0.5);
      });
    } else if (soundId === 'jingleCalm') {
      // Calm, longer chordy jingle
      const chords = [
        [262, 330, 392],
        [294, 370, 440],
        [330, 415, 494],
      ];
      chords.forEach((chord, i) => {
        chord.forEach((freq) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.001, now + i * 0.6);
          gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.6 + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.6 + 0.9);
          osc.connect(gain); gain.connect(master);
          osc.start(now + i * 0.6); osc.stop(now + i * 0.6 + 1.0);
        });
      });
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
