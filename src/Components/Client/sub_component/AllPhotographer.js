import { React, useState } from "react";
import "./CSS Files/AllPhotographer.css";
import mainImage from "./../../../Assets/BeforeLogin/mainImage.png";

function AllPhotographer() {
  const [stars] = useState(5);
  const rating = 4;
  return (
    <div className="all_photographer_main" id="all_photogrpaher">
      <div className="heading_and_show_all">
        <h1>All Photographer</h1>
        <button>Show All</button>
      </div>

      <div className="photographer_wrapper">
        <div className="photographer_image_with_details">
          <div className="ratings">
            {[...Array(stars)].map((_, index) => (
              <span
                key={index}
                className="star"
                style={{ color: index < rating ? "gold" : "#ccc" }}
              >
                &#9733;
              </span>
            ))}
            <span className="rating_value">({rating}/5)</span>
          </div>
          <div className="specialization_of_photographer">Pre Wedding </div>
          <div className="main_image_of_Photographer">
            <img src={mainImage} alt="" />
          </div>
          <div className="name_and_location">
            <h1>Shrey Patel</h1>
            <p>Vadodara Gujarat</p>
          </div>
        </div>
        <div className="photographer_about_details">
          <div className="price_info">
            <h3>Pricing Details</h3>
            <ul>
              <li>
                <strong>Starting Package:</strong> $500 per event (6 hours
                coverage)
              </li>
              <li>
                <strong>Hourly Rate:</strong> $100/hr for additional hours
              </li>
              <li>
                <strong>Pre-Wedding Shoots:</strong> $700 (includes 20 edited
                photos)
              </li>
            </ul>
            <p>Get in touch for customized packages tailored to your needs!</p>
          </div>
          <div className="about_info">
            <h3>About the Photographer</h3>
            <p>
              <strong>John Doe</strong> is an award-winning photographer with
              over
              <strong> 8 years</strong> of experience in capturing timeless
              memories. His expertise spans across weddings, fashion shoots, and
              commercial photography. Known for his{" "}
              <strong>artistic vision</strong> and
              <strong> attention to detail</strong>, John ensures every photo
              tells a beautiful story.
            </p>

            <p>
              <strong>Specialties:</strong> Candid Shots, Destination Weddings,
              Pre-Wedding Shoots, and Traditional Ceremonies.
            </p>
          </div>
          <button className="call_to_action_photographer">
            Book Your Shoot Today
          </button>
        </div>
      </div>

      <div className="photographer_wrapper">
        <div className="photographer_image_with_details">
          <div className="ratings">
            {[...Array(stars)].map((_, index) => (
              <span
                key={index}
                className="star"
                style={{ color: index < rating ? "gold" : "#ccc" }}
              >
                &#9733;
              </span>
            ))}
            <span className="rating_value">({rating}/5)</span>
          </div>
          <div className="specialization_of_photographer">Pre Wedding </div>
          <div className="main_image_of_Photographer">
            <img src={mainImage} alt="" />
          </div>
          <div className="name_and_location">
            <h1>Shrey Patel</h1>
            <p>Vadodara Gujarat</p>
          </div>
        </div>
        <div className="photographer_about_details">
          <div className="price_info">
            <h3>Pricing Details</h3>
            <ul>
              <li>
                <strong>Starting Package:</strong> $500 per event (6 hours
                coverage)
              </li>
              <li>
                <strong>Hourly Rate:</strong> $100/hr for additional hours
              </li>
              <li>
                <strong>Pre-Wedding Shoots:</strong> $700 (includes 20 edited
                photos)
              </li>
            </ul>
            <p>Get in touch for customized packages tailored to your needs!</p>
          </div>
          <div className="about_info">
            <h3>About the Photographer</h3>
            <p>
              <strong>John Doe</strong> is an award-winning photographer with
              over
              <strong> 8 years</strong> of experience in capturing timeless
              memories. His expertise spans across weddings, fashion shoots, and
              commercial photography. Known for his{" "}
              <strong>artistic vision</strong> and
              <strong> attention to detail</strong>, John ensures every photo
              tells a beautiful story.
            </p>

            <p>
              <strong>Specialties:</strong> Candid Shots, Destination Weddings,
              Pre-Wedding Shoots, and Traditional Ceremonies.
            </p>
          </div>
          <button className="call_to_action_photographer">
            Book Your Shoot Today
          </button>
        </div>
      </div>
    </div>
  );
}
export default AllPhotographer;
