import React, { useState, useEffect } from 'react';
import './AllServices.css';
import { useParams } from "react-router-dom";
import { Server_url } from '../../../../../redux/AllData';
import SeletedCard from './SeletedCard';
function AllServices() {

    const [services, setServices] = useState([]);
    const { owner_email } = useParams();
    const [selectedData, setSelectedData] = useState(false);
    const [showSelectedCard, setShowSelectedCard] = useState(false);

    useEffect(() => {
        if (showSelectedCard) {
            document.documentElement.style.overflow = "hidden";
        } else {
            document.documentElement.style.overflow = "auto";
        }
    }, [showSelectedCard]);



    useEffect(() => {
        const fetch_services = async (owner_email) => {
            try {
                const response = await fetch(`${Server_url}/fetch_services_for_preview`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_email: owner_email }),
                });

                if (!response.ok) {
                    console.log("Error:", response.statusText);
                    return;
                }

                const data = await response.json();
                setServices(data.services);

            } catch (error) {
                console.error("Failed to fetch services:", error);
            }
        };

        if (owner_email) {
            fetch_services(owner_email);
        }

    }, [owner_email]);

    const handleItemClick = (item) => {
        setSelectedData(item);
        setShowSelectedCard(true);
    };


    const handleBooking = (serviceId, event) => {
        event.stopPropagation(); // Prevent triggering handleItemClick
        const service = services.find(service => service.id === serviceId);
        if (service) {
            setSelectedData(service);
            setShowSelectedCard(true);
        }
    };

    return (
        <div className="services-container" >
            <h1>Photography Services</h1>
            <div className="services-grid">
                {services.map((service) => (
                    <div key={service.id} className="service-card" onClick={() => handleItemClick(service)}>
                        {/* <h2 className="service-name">{service.service_name}</h2>
                        <p className="service-price">₹{service.price_per_day}/day</p>
                        <button
                            className="book-button"
                            onClick={() => handleBooking(service.id)}
                        >
                            Book Now
                        </button> */}
                        <div className="container_for_services_name">
                            <p>{service.service_name || "Not Available"}</p>
                        </div>

                        <div className="for_service_price_and_book_button">
                            <div className="services_price_container">
                                <div className="rupee_symbol"> ₹</div>
                                <div className="service_price">{service.price_per_day || "Not Available"}</div>
                                <span className="per_day">/Day</span>
                            </div>
                            <hr style={{ width: "98%", marginTop: "5px" }} />
                            <button onClick={(e) => handleBooking(service.id, e)}>Book Service</button>
                        </div>
                    </div>
                ))}
            </div>


            {showSelectedCard && selectedData && (
                <SeletedCard
                    type={"service"}
                    onClose={() => {
                        setShowSelectedCard(false);
                        setSelectedData(null);
                    }}
                    selectedOwner={owner_email}
                    selectedData={selectedData}
                />
            )
            }
        </div>
    );
}

export default AllServices;