import React from 'react'
import './HorizontalScroll.css'
import third_section_image from './../image_folder/third_section_image.png';

function HorizontalScroll() {
    const cardData = [
        { icon: "📸", title: "Get Hired Instantly", description: "Showcase your portfolio & attract top clients." },
        { icon: "💼", title: "Rent & Earn", description: "List your camera gear & make passive income." },
        { icon: "🔗", title: "Connect & Collaborate", description: "Expand your network & work with professionals." },
        { icon: "📅", title: "Seamless Bookings", description: "Manage appointments, clients & payments hassle-free." },
        { icon: "📊", title: "Business Insights", description: "Track your growth with real-time analytics." },
        { icon: "📝", title: " Smart Invoicing", description: "Generate professional invoices in one click." }
    ];
    return (
        <div className="horizontal-scroll-container">
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
        </div>
    )
}

export default HorizontalScroll