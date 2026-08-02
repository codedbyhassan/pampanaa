import { useEffect, useState } from 'react';

const SLIDES = [
  {
    kicker: 'The Frontier',
    title: 'Pampanaa',
    body: 'The outer lanes have fallen silent. One interceptor remains on patrol, and the formations are already inbound.',
  },
  {
    kicker: 'Hold The Line',
    title: 'Wave After Wave',
    body: 'Squadrons arrive in choreographed formations. Clear every ship to advance — and brace for a capital-class boss every fifth wave.',
  },
  {
    kicker: 'Escalate',
    title: 'Arm Yourself',
    body: 'Blaster, shotgun, laser, homing missiles and a full-reach flamethrower. Collect multipliers to split your fire into a storm of barrels.',
  },
];

/** Cinematic intro slideshow. Auto-advances, fully skippable. */
export function Splash({ onDone }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      if (index < SLIDES.length - 1) setIndex(index + 1);
      else onDone();
    }, 4200);
    return () => clearTimeout(id);
  }, [index, onDone]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDone]);

  const slide = SLIDES[index];

  return (
    <div className="sg-splash">
      <div className="sg-splash__stars" aria-hidden="true" />
      <div className="sg-splash__inner" key={index}>
        <div className="sg-splash__kicker">{slide.kicker}</div>
        <h1 className="sg-splash__title">{slide.title}</h1>
        <p className="sg-splash__body">{slide.body}</p>
      </div>

      <div className="sg-splash__foot">
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
        <button className="sg-btn sg-btn--sm" onClick={onDone}>
          Skip intro
        </button>
      </div>
    </div>
  );
}

export default Splash;
