export const ROTATION_SOUNDS = [
  { id: 'none', name: '🔇 None', type: 'none' },
  { id: 'marimba', name: '🎹 Marimba', type: 'synth' },
  { id: 'jingleGlow', name: '🌟 Glow Jingle', type: 'synth' },
  { id: 'jingleRise', name: '🎶 Rise Jingle', type: 'synth' },
  { id: 'jingleCalm', name: '🌈 Calm Jingle', type: 'synth' },
];

let _sharedCtx = null;
const getAudioContext = () => {
  if (!_sharedCtx || _sharedCtx.state === 'closed') {
    _sharedCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _sharedCtx;
};

export const playSynthSound = async (soundId, volume = 0.7) => {
  try {
    const ctx = getAudioContext();
    // Chrome suspends AudioContext until user gesture; must await resume
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const now = ctx.currentTime;
    const vol = Math.max(0, Math.min(1, volume));

    // Master volume node - increased default volume
    const master = ctx.createGain();
    master.gain.value = vol * 1.2; // Boost overall volume by 20%
    master.connect(ctx.destination);

    if (soundId === 'marimba') {
      // Extended marimba melody with higher volume and longer sustain
      [262, 330, 392, 523, 659, 523, 392, 330].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.5, now + i * 0.18); // Increased from 0.3
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.8); // Longer sustain
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.8);
      });
    } else if (soundId === 'jingleGlow') {
      // Longer, more prominent glow jingle with shimmer
      const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1046.5, 783.99, 659.25, 523.25];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, now + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.4, now + i * 0.22 + 0.05); // Increased from 0.22
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.22 + 0.9); // Longer decay
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + i * 0.22);
        osc.stop(now + i * 0.22 + 1.0);
      });
    } else if (soundId === 'jingleRise') {
      // Extended bright rising jingle with more notes and volume
      const base = [262, 330, 392, 494, 587, 659, 784, 880, 988, 1174];
      base.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, now + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.35, now + i * 0.18 + 0.04); // Increased from 0.2
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.7); // Longer decay
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.75);
      });
    } else if (soundId === 'jingleCalm') {
      // Extended calm chordy jingle with more progression
      const chords = [
        [262, 330, 392], // C major
        [294, 370, 440], // D minor
        [330, 415, 494], // E minor
        [349, 440, 523], // F major
        [262, 330, 392], // C major (return)
      ];
      chords.forEach((chord, i) => {
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.001, now + i * 0.5);
          gain.gain.exponentialRampToValueAtTime(0.32, now + i * 0.5 + 0.08); // Increased from 0.18
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.5 + 1.2); // Much longer sustain
          osc.connect(gain);
          gain.connect(master);
          osc.start(now + i * 0.5);
          osc.stop(now + i * 0.5 + 1.3);
        });
      });
    }

  } catch (e) {
    // Web Audio not supported - fail silently
  }
};

export const playSound = (soundId, customSounds, volume = 0.7) => {
  if (soundId === 'none') return;

  const builtIn = ROTATION_SOUNDS.find((s) => s.id === soundId);
  if (builtIn && builtIn.type === 'synth') {
    playSynthSound(soundId, volume);
    return;
  }

  const custom = (customSounds || []).find((s) => s.id === soundId);
  if (custom && custom.dataUrl) {
    try {
      const audio = new Audio(custom.dataUrl);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch(() => {});
    } catch (e) {
      // Audio playback error - fail silently
    }
  }
};
