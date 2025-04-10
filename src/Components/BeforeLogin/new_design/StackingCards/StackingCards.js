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
  const cardsRef = useRef([]);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Clear any existing ScrollTriggers
    ScrollTrigger.getAll().forEach(st => st.kill());
    
    const cards = cardsRef.current.filter(Boolean);
    const wrapper = wrapperRef.current;
    const section = sectionRef.current;
    
    // Set initial positions - all cards stacked with initial opacity
    gsap.set(cards, {
      y: (i) => i * 10,
      rotation: (i) => i === 0 ? 0 : (i % 2 === 0 ? -15 : 15),
      opacity: (i) => i < 2 ? 1 : 0.75,  // First two cards fully visible
      scale: (i) => 1 - (i * 0.05),
      zIndex: (i) => cards.length - i,
    });
    
    // Create a ScrollTrigger for the entire section
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${window.innerHeight * 4}`, // Extend scrolling area
      pin: true,
      pinSpacing: true,
      scrub: 1.5, // Smoother scrubbing
      anticipatePin: 1,
      markers: false, // Set to true for debugging
    });
    
    // Create a master timeline for scroll animations
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${window.innerHeight * 4}`,
        scrub: 1.5, // Smoother scrubbing for better opacity transitions
        invalidateOnRefresh: true,
      }
    });
    
    // Phase 1: Fan out cards from stacked position
    const fanOutTl = gsap.timeline();
    
    cards.forEach((card, idx) => {
      if (idx > 0) {
        fanOutTl.to(card, {
          y: (idx) * 50,
          rotation: idx % 2 === 0 ? -15 : 15,
          x: idx % 2 === 0 ? -150 : 150,
          scale: 0.9,
          opacity: (i) => i < 2 ? 1 : 0.85, // First two cards stay fully visible
          duration: 0.5,
          ease: "power1.inOut"
        }, 0);
      }
    });
    
    masterTl.add(fanOutTl);
    
    // Phase 2: Bring cards to center one by one
    cards.forEach((card, idx) => {
      if (idx > 0) {
        const cardTl = gsap.timeline();
        
        // Focus on current card
        cardTl.to(card, {
          rotation: 0,
          y: 0,
          x: 0,
          scale: 1,
          opacity: 1, // All cards fully visible when centered
          zIndex: 100,
          duration: 0.5,
          ease: "back.out(1.7)"
        });
        
        // Move other cards out of the way
        cards.forEach((otherCard, otherIdx) => {
          if (otherIdx !== idx) {
            cardTl.to(otherCard, {
              y: otherIdx < idx ? -100 : 100,
              x: otherIdx % 2 === 0 ? -200 : 200,
              rotation: otherIdx % 2 === 0 ? -20 : 20,
              scale: 0.8,
              opacity: (i) => {
                // Keep first two cards more visible even when not focused
                if (otherIdx < 2) return 0.85;
                return 0.6;
              },
              duration: 0.5,
              ease: "power1.inOut"
            }, "<");
          }
        });
        
        // Pause for a moment
        cardTl.to({}, { duration: 0.3 });
        
        masterTl.add(cardTl, "+=0.5");
      }
    });
    
    // Phase 3: Final spread - fan all cards out in a semicircle
    const finalTl = gsap.timeline();
    
    finalTl.to(cards, {
      y: (i) => Math.sin((i / (cards.length - 1)) * Math.PI) * -120,
      x: (i) => (i / (cards.length - 1) - 0.5) * 500,
      rotation: (i) => (i / (cards.length - 1) - 0.5) * 25,
      scale: 0.85,
      opacity: (i) => i < 2 ? 1 : 0.85, // First two cards stay fully visible
      duration: 1,
      ease: "power2.inOut",
      stagger: 0.05
    });
    
    masterTl.add(finalTl, "+=0.5");
    
    // Add hover effect to increase visibility when mouse is over card
    cards.forEach((card, idx) => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          opacity: 1,
          scale: 0.9,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      card.addEventListener('mouseleave', () => {
        if (idx >= 2) {
          // Only reduce opacity for cards after the first two if not in focus
          gsap.to(card, {
            opacity: 0.85,
            scale: 0.85,
            duration: 0.3,
            ease: "power2.in"
          });
        }
      });
    });
    
    // Responsive adjustments
    window.addEventListener('resize', () => {
      ScrollTrigger.refresh();
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      window.removeEventListener('resize', null);
      
      // Remove event listeners to prevent memory leaks
      cards.forEach(card => {
        card.removeEventListener('mouseenter', null);
        card.removeEventListener('mouseleave', null);
      });
    };
  }, []);

  return (
    <div className="stacking-page-wrapper" ref={sectionRef}>
      <div className="stacking-container" ref={containerRef}>
        <div className="stacking-cards-wrapper" ref={wrapperRef}>
          {stepCards.map((card, idx) => (
            <div
              className={`step-card ${idx === 0 ? 'primary' : idx === 1 ? 'secondary' : 'tertiary'}`}
              id={card.id}
              key={idx}
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
        <div className="scroll-indicator">
          <div className="scroll-icon"></div>
          <p>Scroll to explore</p>
        </div>
      </div>
    </div>
  );
};

export default StackingCards;
