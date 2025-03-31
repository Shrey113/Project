import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './test.css';

gsap.registerPlugin(ScrollTrigger);

const StackingCards = () => {
  // Create a ref to store card DOM nodes
  const cardsRef = useRef([]);

  useEffect(() => {
    const cards = cardsRef.current;
    cards.forEach((card, index) => {
      // Animate scale based on scroll position
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: () => `top bottom-=100`,
          end: () => `top top+=40`,
          scrub: true,
          markers: true,
          invalidateOnRefresh: true
        },
        ease: "none",
        scale: () => 1 - (cards.length - index) * 0.025
      });

      // Pin the card during scroll
      ScrollTrigger.create({
        trigger: card,
        start: "top top",
        pin: true,
        pinSpacing: false,
        markers: true,
        id: 'pin',
        end: 'max',
        invalidateOnRefresh: true,
      });
    });
  }, []);

  return (
    <div>
      <h1>Stacking Cards</h1>
      <div className="container">
        <div className="cards">
          {[1, 2, 3, 4, 5].map((num, idx) => (
            <div
              className="card"
              key={idx}
              style={{ top: 40 + idx * 5 }}
              ref={el => cardsRef.current[idx] = el}
            >
              {num}
            </div>
          ))}
        </div>
      </div>
      <div className="container2"></div>
    </div>
  );
};

export default StackingCards;
