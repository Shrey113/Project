import React, { useState } from 'react'
import './AddReviews.css'



const reviewsList = [
  {
    id: 1,
    avatar: "L",
    name: "laphilipe",
    country: "United States",
    rating: 5,
    timeAgo: "1 month ago",
    review: "I hired this freelancer to create an ad for my brand, and the experience was outstanding. They brought exceptional creativity to the project, crafting a concept that felt unique and compelling. The ad had a beautiful visual appeal that captured attention instantly – they understood my vision well and delivered beyond my expectations. Their communication was clear and professional throughout the process.",
  },
  {
    id: 2,
    avatar: "J",
    name: "johnsmith",
    country: "Canada",
    rating: 5,
    timeAgo: "2 months ago",
    review: "Working with this professional was an absolute pleasure. They demonstrated incredible attention to detail and a deep understanding of my project requirements. The final product exceeded my expectations in every way possible. They were responsive, met all deadlines, and provided valuable suggestions that improved the overall outcome.",
  },
  {
    id: 3,
    avatar: "M",
    name: "mariagarcia",
    country: "Spain",
    rating: 4,
    timeAgo: "3 months ago",
    review: "Great experience overall! The freelancer was very professional and delivered quality work. They were responsive to feedback and made all requested revisions promptly. The only minor issue was that the initial timeline was slightly delayed, but they communicated this well in advance. Would definitely recommend their services to others looking for similar work.",
  },
  {
    id: 4,
    avatar: "M",
    name: "mariagarcia",
    country: "Spain",
    rating: 4,
    timeAgo: "3 months ago",
    review: "Great experience overall! The freelancer was very professional and delivered quality work. They were responsive to feedback and made all requested revisions promptly. The only minor issue was that the initial timeline was slightly delayed, but they communicated this well in advance. Would definitely recommend their services to others looking for similar work.",
  }
];

const reviewData = {
    total: 2928,
    actualTotal: reviewsList.length,
    ratings: [
      { stars: 5, count: reviewsList.filter(review => review.rating === 5).length },
      { stars: 4, count: reviewsList.filter(review => review.rating === 4).length },
      { stars: 3, count: reviewsList.filter(review => review.rating === 3).length },
      { stars: 2, count: reviewsList.filter(review => review.rating === 2).length },
      { stars: 1, count: reviewsList.filter(review => review.rating === 1).length },
    ]
  };

function ReviewBox({ review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  
  const shouldShowButton = review.review.length > maxLength;
  const displayText = isExpanded 
    ? review.review 
    : review.review.slice(0, maxLength) + "...";

  return (
    <div className="review-box">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="avatar">{review.avatar}</div>
          <div className="name-location">
            <div className="name">{review.name}</div>
            <div className="country">
              <span className="flag">🇺🇸</span> {review.country}
            </div>
          </div>
        </div>
        <div className="review-meta">
          <div className="stars">
            {'★'.repeat(review.rating)}
            {'☆'.repeat(5 - review.rating)}
          </div>
          <div className="time-ago">{review.timeAgo}</div>
        </div>
      </div>
      <div className="review-content">
        <p>
          {displayText}
          {shouldShowButton && (
            <button 
              className="see-more-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? ' Show less' : ' See more'}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

function AddReviews() {
  const [selectedRating, setSelectedRating] = useState(null);
  const [visibleReviews, setVisibleReviews] = useState(3);

  const filteredReviews = selectedRating 
    ? reviewsList.filter(review => review.rating === selectedRating)
    : reviewsList;

  const handleShowMore = () => {
    setVisibleReviews(prev => prev + 3);
  };

  const reviewsToShow = filteredReviews.slice(0, visibleReviews);

  return (
    <div id='AddReviews'>
      <div className="reviews-header">
        <h2>{reviewData.total} Reviews</h2>
        {selectedRating && (
          <button 
            className="clear-filter-btn"
            onClick={() => {
              setSelectedRating(null);
              setVisibleReviews(3);
            }}
          >
            Clear Filter
          </button>
        )}
      </div>
      
      <div className="ratings-container">
        {reviewData.ratings.map((rating) => (
          <div 
            key={rating.stars} 
            className={`rating-row ${selectedRating === rating.stars ? 'selected' : ''}`}
            onClick={() => {
              setSelectedRating(selectedRating === rating.stars ? null : rating.stars);
              setVisibleReviews(3);
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="stars">{rating.stars} Stars</span>
            <div className="rating-bar">
              <div 
                className="rating-fill" 
                style={{ 
                  width: `${(rating.count / reviewData.actualTotal) * 100}%`
                }}
              ></div>
            </div>
            <span className="count">({rating.count})</span>
          </div>
        ))}
      </div>

      <div className="reviews-list">
        {filteredReviews.length > 0 ? (
          <>
            {reviewsToShow.map(review => (
              <ReviewBox key={review.id} review={review} />
            ))}
            
            {visibleReviews < filteredReviews.length && (
              <button 
                className="show-more-btn"
                onClick={handleShowMore}
              >
                Show More Reviews
              </button>
            )}
          </>
        ) : (
          <div className="no-reviews-message">
            No reviews found for {selectedRating} stars rating
          </div>
        )}
      </div>
    </div>
  )
}

export default AddReviews
