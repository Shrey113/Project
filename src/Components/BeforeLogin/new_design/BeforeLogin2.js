import { useState, useEffect, useRef } from 'react';
import React from 'react';
import './BeforeLogin2.css';
import first_section_image from './image_folder/first_section_image.png';
import third_section_image from './image_folder/third_section_image.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

function BeforeLogin2() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 650);
    const featuresContainerRef = useRef(null); // Reference to key-features-container
    const featuresGridRef = useRef(null); // Reference to features-grid

    // Handle screen resize
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 650);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // GSAP auto-scroll horizontal effect using useGSAP
    // Inside the BeforeLogin2 component, update the useGSAP hook:
    useGSAP(() => {
        const container = featuresContainerRef.current;
        const grid = featuresGridRef.current;

        if (!container || !grid) return; // Prevent errors if refs are not set

        // const cards = grid.querySelectorAll('.feature-card');
        // console.log("cards", cards.length);
        // if (cards.length === 0) return;

        // Only apply animation if content exceeds viewport width

        gsap.to(grid, {
            x: '-60%',
            duration: 6,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: container,
                // start: 'top 100px',
                // end: 'bottom 100px',
                scrub: true,
                markers: true,
            },
        });

    }, { scope: featuresContainerRef });

    // useGSAP(() => {
    //     gsap.fromTo(
    //         featuresContainerRef.current,
    //         { opacity: 0, y: 50 },  // Initial state
    //         {
    //             opacity: 1,
    //             y: 0,
    //             duration: 2,
    //             ease: "power2.out",
    //             scrollTrigger: {
    //                 trigger: featuresContainerRef.current,
    //                 start: "top 80%", // When section reaches 80% of viewport
    //                 toggleActions: "play none none none",
    //             },
    //         }
    //     );
    // }, []);
    const smoothScroll = (e, targetId) => {
        e.preventDefault();
        document.getElementById(targetId)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const handleOwnerLogin = () => {
        window.location.href = '/owner';
    };

    return (
        <main>
            <nav className="nav">
                <img src={first_section_image} alt="Logo" className="logo" />
                {isMobile ? (
                    <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
                ) : (
                    <ul className="nav-links">
                        <li><button onClick={(e) => smoothScroll(e, 'first_container')}>Home</button></li>
                        <li><button onClick={(e) => smoothScroll(e, 'second_container')}>About</button></li>
                        <li><button onClick={(e) => smoothScroll(e, 'third_container')}>Services</button></li>
                        <li><button onClick={(e) => smoothScroll(e, 'fourth_container')}>Steps</button></li>
                        <li><button onClick={(e) => smoothScroll(e, 'fifth_container')}>Join</button></li>
                    </ul>
                )}
                {isMobile && (
                    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        <button className="close-btn" onClick={() => setSidebarOpen(false)}>✖</button>
                        <ul className="nav-links">
                            <li><button onClick={(e) => smoothScroll(e, 'first_container')}>Home</button></li>
                            <li><button onClick={(e) => smoothScroll(e, 'second_container')}>About</button></li>
                            <li><button onClick={(e) => smoothScroll(e, 'third_container')}>Services</button></li>
                            <li><button onClick={(e) => smoothScroll(e, 'fourth_container')}>Steps</button></li>
                            <li><button onClick={(e) => smoothScroll(e, 'fifth_container')}>Join</button></li>
                        </ul>
                    </div>
                )}
            </nav>

            {/* First Section */}
            <div className="before-login-container" id="first_container">
                <Swiper
                    modules={[Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    autoplay={{ delay: 3000 }}
                    className="swiper-container"
                    loop={true}
                    loopFillGroupWithBlank={true}
                    centeredSlides={true}
                >
                    <SwiperSlide className="swiper-slide">
                        <img src={first_section_image} alt="Slide 1" className="swiper-image" />
                    </SwiperSlide>
                    <SwiperSlide className="swiper-slide">
                        <img src={third_section_image} alt="Slide 3" className="swiper-image" />
                    </SwiperSlide>
                    <SwiperSlide>
                        <img src={first_section_image} alt="Slide 2" className="swiper-image" />
                    </SwiperSlide>
                    <SwiperSlide>
                        <img src={third_section_image} alt="Slide 4" className="swiper-image" />
                    </SwiperSlide>
                </Swiper>
                <div className="content">
                    <div className="text_content">
                        <h1>Join the Largest Photographer <br />Network – Shoot, Rent & Collaborate!</h1>
                        <p>Offer services, rent gear, and grow your career with top professionals.</p>
                    </div>
                    <button className="join-button" onClick={handleOwnerLogin}>Join Now</button>
                </div>
            </div>

            {/* Second Section */}
            <section className="who-we-are-container" id="second_container">
                <div className="content-wrapper">
                    <div className="image-placeholder"></div>
                    <div className="text-content">
                        <h2 className="section-title">A Creative Haven for Photographers</h2>
                        <p className="section-description">
                            Photography isn’t just about capturing moments—it’s about telling stories, evoking emotions, and creating art that lasts forever.
                            Our platform is built for passionate photographers who want to elevate their craft, connect with like-minded professionals,
                            and turn their talent into thriving careers. Whether you’re a seasoned pro or just starting out, we provide the space,
                            the tools, and the community to help you shine.
                        </p>
                        <p className="section-highlight">
                            From booking gigs to renting gear, collaborating on projects, and managing your business seamlessly—this is where your photography
                            journey reaches new heights.
                        </p>
                        <button className="cta-button" onClick={handleOwnerLogin}>Join the Community</button>
                    </div>
                </div>
            </section>

            {/* Third Section with Auto-Scroll Horizontal Effect */}
            <div className="key-features-container" id="third_container" ref={featuresContainerRef}>
                <div className="key-feature-image-container">
                    <img src={third_section_image} alt="Photographer Network" />
                </div>
                <h2 style={{ zIndex: '10' }}>Unlock endless opportunities to grow your photography career!</h2>
                <div className="features-grid" ref={featuresGridRef}>
                    <div className="feature-card">
                        <div className="icon-placeholder">📸</div>
                        <div className="key_words">
                            <h3 className="feature-title">📷 Get Hired Instantly</h3>
                            <p className="feature-description">Showcase your portfolio & attract top clients.</p>
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="icon-placeholder">💼</div>
                        <div className="key_words">
                            <h3 className="feature-title">💰 Rent & Earn</h3>
                            <p className="feature-description">List your camera gear & make passive income.</p>
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="icon-placeholder">🔗</div>
                        <div className="key_words">
                            <h3 className="feature-title">🌍 Connect & Collaborate</h3>
                            <p className="feature-description">Expand your network & work with professionals.</p>
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="icon-placeholder">📅</div>
                        <div className="key_words">
                            <h3 className="feature-title">⚡ Seamless Bookings</h3>
                            <p className="feature-description">Manage appointments, clients & payments hassle-free.</p>
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="icon-placeholder">📊</div>
                        <div className="key_words">
                            <h3 className="feature-title">📈 Business Insights</h3>
                            <p className="feature-description">Track your growth with real-time analytics.</p>
                        </div>
                    </div>
                    <div className="feature-card">
                        <div className="icon-placeholder">📝</div>
                        <div className="key_words">
                            <h3 className="feature-title">📑 Smart Invoicing</h3>
                            <p className="feature-description">Generate professional invoices in one click.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fourth Section */}
            <div className="working_steps" id="fourth_container">
                <h1>How it Works</h1>
            </div>

            {/* Fifth Section */}
            <div className="hero-container" id="fifth_container">
                <div className="hero-content">
                    <h1>Join Today & Start Growing!</h1>
                    <button className="hero-button" onClick={handleOwnerLogin}>Sign Up Now</button>
                </div>
            </div>
        </main>
    );
}

export default BeforeLogin2;