import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './test.css';

gsap.registerPlugin(ScrollTrigger);

const StackingCards = () => {
  // Create a ref to store card DOM nodes
  const cardsRef = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    // Clear any existing ScrollTriggers to prevent duplicates
    ScrollTrigger.getAll().forEach(st => st.kill());
    
    const cards = cardsRef.current.filter(Boolean);
    
    // Create a timeline for better control
    const tl = gsap.timeline();
    
    // Setup animations for each card
    cards.forEach((card, index) => {
      // Animate scale based on scroll position
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: "top bottom-=100",
          end: "top top+=40",
          scrub: 0.5, // Smoother scrubbing
          // markers: false, // Remove in production
          invalidateOnRefresh: true
        },
        ease: "power1.out", // Smoother easing
        scale: () => 1 - (cards.length - index) * 0.025
      });

      // Pin the card during scroll
      ScrollTrigger.create({
        trigger: card,
        start: "top top",
        pin: true,
        pinSpacing: false,
        // markers: false, // Remove in production
        id: `pin-card-${index}`,
        end: 'max',
        invalidateOnRefresh: true,
      });
    });
    
    // Clean up function to prevent memory leaks
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <div className="stacking-page-wrapper" ref={containerRef}>
      <h1 className="stacking-title">Stacking Cards</h1>
      <div className="stacking-container">
        <div className="stacking-cards-wrapper">
          {[1, 2, 3, 4, 5].map((num, idx) => (
            <div
              className="stacking-card-item"
              key={idx}
              style={{ top: 40 + idx * 5 }}
              ref={el => cardsRef.current[idx] = el}
            >
              {num}
            </div>
          ))}
        </div>
      </div>
      <div className="stacking-footer-container"></div>
    </div>
  );
};

export default StackingCards;
