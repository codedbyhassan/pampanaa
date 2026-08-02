import { useState } from 'react';

export function Credits({ onBack }) {
  return (
    <section className="sg-credits">
      <div className="sg-credits__content">
        <h2 className="sg-subtitle">About Pampanaa</h2>
        
        <div className="sg-credits__section">
          <h3 className="sg-credits__heading">Game History</h3>
          <p className="sg-credits__text">
            Pampanaa is an homage to classic arcade games like Chicken Invaders that inspired a generation of players. Built entirely in JavaScript and React, this project celebrates the arcade spirit with formation-based shooting, strategic difficulty scaling, and satisfying gameplay loops.
          </p>
        </div>

        <div className="sg-credits__section">
          <h3 className="sg-credits__heading">Developer</h3>
          <p className="sg-credits__text">
            Created by a solo developer passionate about arcade games and web technologies.
          </p>
          <div className="sg-credits__developer">
            <div className="sg-credits__dev-item">
              <span className="sg-credits__dev-label">Name</span>
              <span className="sg-credits__dev-value">Boakye Hassan Agyemang</span>
            </div>
            <div className="sg-credits__dev-item">
              <span className="sg-credits__dev-label">Location</span>
              <span className="sg-credits__dev-value">Kumasi, Ashanti Region, Ghana</span>
            </div>
            <div className="sg-credits__dev-item">
              <span className="sg-credits__dev-label">Email</span>
              <a href="mailto:poundsghst@gmail.com" className="sg-credits__dev-link">poundsghst@gmail.com</a>
            </div>
            <div className="sg-credits__dev-item">
              <span className="sg-credits__dev-label">Phone</span>
              <a href="tel:+233256918104" className="sg-credits__dev-link">+233 25 691 8104</a>
            </div>
            <div className="sg-credits__dev-item">
              <span className="sg-credits__dev-label">GitHub</span>
              <a href="https://github.com/codedbyhassan" target="_blank" rel="noopener noreferrer" className="sg-credits__dev-link">
                codedbyhassan
              </a>
            </div>
            <div className="sg-credits__dev-item">
              <span className="sg-credits__dev-label">Website</span>
              <a href="https://hassanagyemang.vercel.app" target="_blank" rel="noopener noreferrer" className="sg-credits__dev-link">
                hassanagyemang.vercel.app
              </a>
            </div>
          </div>
        </div>

        <div className="sg-credits__section">
          <h3 className="sg-credits__heading">Built With</h3>
          <p className="sg-credits__text">
            JavaScript · React · Canvas API · IndexedDB · Web Audio API
          </p>
        </div>

        <div className="sg-credits__section">
          <h3 className="sg-credits__heading">Thanks</h3>
          <p className="sg-credits__text">
            Thanks to everyone who plays Pampanaa, provides feedback, or contributes to making this game better. Your support means everything.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Credits;
