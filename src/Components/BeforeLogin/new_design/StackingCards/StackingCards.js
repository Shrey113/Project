import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './StackingCards.css';
import { CheckCircle, Users, Camera, DollarSign } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const stepCards = [
  {
    id: 'first-step',
    icon: <CheckCircle size={40} className="icon-purple" />,
    title: 'Sign Up',
    description: 'Create a profile in minutes.',
  },
  {
    id: 'second-step',
    icon: <Camera size={40} className="icon-blue" />,
    title: 'List Your Services or Gear',
    description: 'Showcase your work or rent out equipment.',
  },
  {
    id: 'third-step',
    icon: <Users size={40} className="icon-green" />,
    title: 'Get Hired & Collaborate',
    description: 'Connect with photographers and clients.',
  },
  {
    id: 'four-step',
    icon: <DollarSign size={40} className="icon-yellow" />,
    title: 'Earn & Grow',
    description: 'Expand your network and income.',
  }
];

const StackingCards = () => {
  // Create a ref to store card DOM nodes
  const cardsRef = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    ScrollTrigger.getAll().forEach(st => st.kill());  // Cleanup existing ScrollTriggers

    const cards = cardsRef.current.filter(Boolean);

    // Create ScrollTrigger for the footer section
    const footerTrigger = ScrollTrigger.create({
      trigger: ".footer-container",   // Footer trigger class or id
      start: "top bottom",            // Trigger when the top of the footer reaches the bottom of the viewport
      end: "bottom bottom",           // End when the bottom of the footer reaches the bottom of the viewport
      onEnter: () => {
        // Unpin the cards when entering the footer
        cards.forEach((card, index) => {
          ScrollTrigger.getById(`pin-card-${index}`).kill(); // Kill the pinning effect
        });
      },
      onLeaveBack: () => {
        // Reapply pinning when leaving the footer section
        cards.forEach((card, index) => {
          // Reapply the pinning and animation effects for each card
          ScrollTrigger.create({
            trigger: card,
            start: "top 20px",
            pin: true,
            pinSpacing: false,
            id: `pin-card-${index}`,
            end: 'max',
            invalidateOnRefresh: true,
            scrub: true,
          });
        });
      },
    });

    // Create animation and pinning effect for each card
    cards.forEach((card, index) => {
      gsap.to(card, {
        scrollTrigger: {
          trigger: card,
          start: "top center",
          end: "top top+=40",
          scrub: 1,
          invalidateOnRefresh: true
        },
        ease: "power1.out",
      });

      // Add ScrollTrigger for rotation control
      ScrollTrigger.create({
        trigger: card,
        start: "top 40%", // When the top of the card reaches 40% from the top of viewport
        end: "bottom 40%", // When the bottom of the card passes 40% mark
        onEnter: () => {
          // Don't apply to the first card
          if (index !== 0) {
            card.classList.add('no-degree');
          }
        },
        onLeaveBack: () => {
          // Don't apply to the first card
          if (index !== 0) {
            card.classList.remove('no-degree');
          }
        },
        invalidateOnRefresh: true
      });

      // Pin the card initially
      ScrollTrigger.create({
        trigger: card,
        start: "top 20px",
        pin: true,
        pinSpacing: false,
        id: `pin-card-${index}`,
        end: 'max',
        invalidateOnRefresh: true,
        scrub: true,
      });
    });

    // Cleanup function
    return () => {
      footerTrigger.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);


  return (
    <div className="stacking-page-wrapper" ref={containerRef}>
      <div className="stacking-container">
        <div className="stacking-cards-wrapper">
          {stepCards.map((card, idx) => (
            <div
              className={`step-card ${idx === 0 ? 'fixed' : idx % 2 === 0 ? 'odd' : 'even'}`}
              id={card.id}
              key={idx}
              style={{ top: 40 + idx * 5, maxWidth: "400px", maxHeight: "300px" }}
              ref={(el) => {
                if (el) cardsRef.current[idx] = el;
              }}
            >
              <div className="card-content">
                <div className="icon-container">{card.icon}</div>
                <h3 className="step-title">{card.title}</h3>
                <p className="step-description">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StackingCards;
