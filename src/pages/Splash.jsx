import { useEffect, useRef, useState } from 'react';
import soundManager from '../components/audio/SoundManager';

const SLIDES = [
  {
    kicker: 'The Frontier',
    title: 'Silence On The Outer Lanes',
    body:
      'Three relay stations went dark in a single rotation. No distress burst, no wreckage, no answer on any band. Command routed the last interceptor still fuelled at the perimeter — yours — into the gap and closed the corridor behind you.',
  },
  {
    kicker: 'The Enemy',
    title: 'They Arrive In Formation',
    body:
      'These are not scavengers. Squadrons descend in choreographed lattices, holding lane discipline while flankers peel off to bracket you. Break the formation and the survivors turn feral. Every fifth wave, a capital-class hull drops out of the dark with layered shields and a temper.',
  },
  {
    kicker: 'The Arsenal',
    title: 'Seven Ways To Answer',
    body:
      'Blaster, shotgun, laser, homing missiles, a full-reach flamethrower, a Tesla arc that chains between hulls, and a cryo lance that freezes them mid-burn. Each gun levels independently — an amplifier only upgrades the weapon in your hands when you grab it.',
  },
  {
    kicker: 'The Salvage',
    title: 'Everything Falls To You',
    body:
      'Wreckage drops amplifiers, shields, cadence boosters and magnets. Pickups sink on their own — get close, or run a magnet, and they come to you. Barrel multipliers split your fire into a storm; nothing is stored between runs, so every sortie is earned fresh.',
  },
  {
    kicker: 'Credits',
    title: 'Pampanaa',
    body:
      'Design, engine, procedural art, synthesized score and interface — built end to end on a hand-written canvas engine. No sprites, no audio files: every ship, explosion and note is generated at runtime. Fly well out there, pilot.',
  },
];

const TITLE = 'PAMPANAA';

/**
 * Cold open: the logo spins like a flipped coin while the wordmark types
 * itself in, then the story slides advance ONLY on input — never on a timer.
 */
export function Splash({ onDone }) {
  const [stage, setStage] = useState('logo');
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const ready = useRef(false);

  // Typewriter wordmark under the spinning logo.
  useEffect(() => {
    if (stage !== 'logo') return undefined;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(TITLE.slice(0, i));
      if (i >= TITLE.length) {
        clearInterval(id);
        ready.current = true;
      }
    }, 130);
    return () => clearInterval(id);
  }, [stage]);

  const advance = () => {
    soundManager.init();
    soundManager.play('ui');
    if (stage === 'logo') {
      if (!ready.current) {
        setTyped(TITLE);
        ready.current = true;
        return;
      }
      setStage('slides');
      return;
    }
    if (index < SLIDES.length - 1) setIndex((i) => i + 1);
    else onDone();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      advance();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (stage === 'logo') {
    return (
      <div className="sg-splash sg-splash--cold" onClick={advance} role="presentation">
        <div className="sg-splash__stars" aria-hidden="true" />
        <div className="sg-coin">
          <img src="./logo.png" alt="Pampanaa" className="sg-coin__face" />
        </div>
        <div className="sg-splash__type">
          {typed}
          <i className="sg-splash__caret" />
        </div>
        <div className="sg-splash__prompt">Press any button to continue</div>
      </div>
    );
  }

  const slide = SLIDES[index];

  return (
    <div className="sg-splash" onClick={advance} role="presentation">
      <div className="sg-splash__stars" aria-hidden="true" />
      <img src="./logo.png" alt="" className="sg-splash__logo" />
      <div className="sg-splash__inner" key={index}>
        <div className="sg-splash__kicker">{slide.kicker}</div>
        <h1 className="sg-splash__title">{slide.title}</h1>
        <p className="sg-splash__body">{slide.body}</p>
      </div>

      <div className="sg-splash__foot" onClick={(e) => e.stopPropagation()} role="presentation">
        <button
          className="sg-btn sg-btn--sm"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Back
        </button>
        <div className="sg-splash__dots">
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              className="sg-splash__dot"
              data-active={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button className="sg-btn sg-btn--sm" onClick={advance}>
          {index === SLIDES.length - 1 ? 'Enter' : 'Next'}
        </button>
        <button className="sg-btn sg-btn--sm" onClick={onDone}>
          Skip
        </button>
      </div>
      <div className="sg-splash__prompt">Click or press any button to continue</div>
    </div>
  );
}

export default Splash;
