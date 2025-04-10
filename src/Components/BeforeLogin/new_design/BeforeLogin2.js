import { useState, useEffect, useRef } from 'react';
import React from 'react';
import './BeforeLogin2.css';

import { FaHome, FaInfoCircle, FaConciergeBell, FaRegHandshake, FaUserPlus } from 'react-icons/fa';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';
import first_section_image from './image_folder/first_section_image.png';
import third_section_image from './image_folder/third_section_image.png';
// import gsapBackground from './image_folder/gsapBackground.jpg';
import fifth_section_image from './image_folder/fifth_section_image.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { logoBlack, logoWithNameBlack } from '../../../redux/AllData';

import StackingCards from './../new_design/StackingCards/StackingCards'
// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);
function BeforeLogin2() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 650);

    const [mobileScreen] = useState(window.innerWidth <= 425);


    // Handle screen resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 650)
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const navLinksRef = useRef([]);


    useEffect(() => {

        gsap.to(navLinksRef.current, {
            y: "0px",
            opacity: "1",
            stagger: 0.2,
            duration: 0.8,
            ease: "power2.out"
        });
    }, []);


    const smoothScroll = (e, targetId) => {
        e.preventDefault();
        document.getElementById(targetId)?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });

        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const handleOwnerLogin = () => {
        window.location.href = '/owner';
    };


    const cardData = [
        { icon: "📸", title: "Get Hired Instantly", description: "Showcase your portfolio & attract top clients." },
        { icon: "💼", title: "Rent & Earn", description: "List your camera gear & make passive income." },
        { icon: "🔗", title: "Connect & Collaborate", description: "Expand your network & work with professionals." },
        { icon: "📅", title: "Seamless Bookings", description: "Manage appointments, clients & payments hassle-free." },
        { icon: "📊", title: "Business Insights", description: "Track your growth with real-time analytics." },
        { icon: "📝", title: " Smart Invoicing", description: "Generate professional invoices in one click." }
    ];
    const Links = [
        { id: "first_container", label: "Home" },
        { id: "second_container", label: "About" },
        { id: "third_container", label: "Services" },
        { id: "fourth_container", label: "Steps" },
        { id: "fifth_container", label: "Join" }
    ];

    return (
        <main>
            <nav className="nav">
                {mobileScreen ? (<img src={logoBlack} className='logo_for_mobile' alt='' />) : (<img src={logoWithNameBlack} alt="Logo" className="logo" />)}
                {isMobile ? (
                    <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
                ) : (
                    <ul className="nav-links">
                        {Links.map((label, index) => (
                            <li key={index} ref={el => (navLinksRef.current[index] = el)}>
                                <button onClick={(e) => { smoothScroll(e, label.id) }}>{label.label}</button>
                            </li>
                        ))}
                    </ul>
                )}
                {isMobile && (
                    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        <button className="close-btn" onClick={() => setSidebarOpen(false)}>✖</button>
                        <ul className="nav-links">
                            <li>
                                <button onClick={(e) => smoothScroll(e, 'first_container')}>
                                    <FaHome size={20} /> Home
                                </button>
                            </li>
                            <li>
                                <button onClick={(e) => smoothScroll(e, 'second_container')}>
                                    <FaInfoCircle size={20} /> About
                                </button>
                            </li>
                            <li>
                                <button onClick={(e) => smoothScroll(e, 'third_container')}>
                                    <FaConciergeBell size={20} /> Services
                                </button>
                            </li>
                            <li>
                                <button onClick={(e) => smoothScroll(e, 'fourth_container')}>
                                    <FaRegHandshake size={20} /> Steps
                                </button>
                            </li>
                            <li>
                                <button onClick={(e) => smoothScroll(e, 'fifth_container')}>
                                    <FaUserPlus size={20} /> Join
                                </button>
                            </li>
                        </ul>
                    </div>
                )}

                {isSidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
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
                    <div className="image-placeholder"><img src={first_section_image} alt="" /></div>
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

            <section className="horizontal-scroll-section" id='third_container'>

                <div className="key-feature-image-container">
                    <img src={third_section_image} alt="Photographer Network" />
                </div>

                <div className="key_feature_title">Key Features !</div>

                <div className="cards-container">
                    {cardData.map((card, index) => (
                        <div key={index} className="card">
                            <div className="icon-placeholder">{card.icon}</div>
                            <div className="key_words">
                                <h3 className="feature-title">{card.title}</h3>
                                <p className="feature-description">{card.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Fourth Section */}
            {/* <section className="thriving-section">
                <h2 className="section-title">Your Path to Success Starts Here</h2>
                <p className="section-description">
                    Whether you're a photographer looking for gigs or renting out your gear, our platform connects you with opportunities to grow and thrive.
                </p>
            </section> */}


            <div className="steps-container" id="fourth_container">
                <StackingCards />
            </div>



            {/* Fifth Section */}
            <div className="hero-container" id="fifth_container">
                <div className="hero_image_container"> <img src={fifth_section_image} alt="Logo" /></div>

                <div className="hero-content">
                    <h1>Join Today & Start Growing!</h1>
                    <button className="hero-button" onClick={handleOwnerLogin}>Sign Up Now</button>
                </div>
            </div>

            <footer className="footer-container">
                <div className="footer-content">
                    <div className="footer-section about">
                        <h2>Photography Hub</h2>
                        <p>Connecting photographers with opportunities. Join us to showcase your talent, rent equipment, and grow your career.</p>
                    </div>

                    <div className="footer-section links">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><button onClick={(e) => smoothScroll(e, 'first_container')}>Home</button></li>
                            <li><button onClick={(e) => smoothScroll(e, 'second_container')}>About</button></li>
                            <li><button onClick={(e) => smoothScroll(e, 'third_container')}>Services</button></li>
                            <li><button onClick={(e) => smoothScroll(e, 'fourth_container')}>Steps</button></li>
                            <li><button onClick={(e) => smoothScroll(e, 'fifth_container')}>Join</button></li>
                        </ul>
                    </div>

                    <div className="footer-section contact">
                        <h3>Contact Us</h3>
                        <p>Email: support@photographyhub.com</p>
                        <p>Phone: +1 234 567 890</p>
                        <p>Address: 123 Photography St, New York, NY</p>
                    </div>

                    <div className="footer-section social">
                        <h3>Follow Us</h3>
                        <div className="social-icons">
                            <a href="https://www.facebook.com/YourPage" target="_blank" rel="noopener noreferrer" className="facebook">
                                <FaFacebookF color="#1877F2" size={24} />
                            </a>

                            <a href="https://www.instagram.com/YourPage" target="_blank" rel="noopener noreferrer" className="instagram">
                                <FaInstagram color="#E4405F" size={24} />
                            </a>

                            <a href="https://twitter.com/YourPage" target="_blank" rel="noopener noreferrer" className="twitter">
                                <FaTwitter color="#1DA1F2" size={24} />
                            </a>

                            <a href="https://www.youtube.com/YourChannel" target="_blank" rel="noopener noreferrer" className="youtube">
                                <FaYoutube color="#FF0000" size={24} />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 Photography Hub. All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}

export default BeforeLogin2;