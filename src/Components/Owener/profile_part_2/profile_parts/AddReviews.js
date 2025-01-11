import React, { useState,useEffect } from 'react'
import './AddReviews.css'
import { useSelector } from 'react-redux';



function ReviewBox({ review }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  
  const shouldShowButton = review?.owner_review?.length > maxLength;
  const displayText = isExpanded 
    ? review?.owner_review 
    : review?.owner_review?.slice(0, maxLength) + "...";

  return (
    <div className="review-box">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="avatar">{review.owner_avatar}</div>
          <div className="name-location">
            <div className="name">{review.owner_name}</div>
            <div className="country">
              <span className="flag">🇺🇸</span> {review.owner_country}
            </div>
          </div>
        </div>
        <div className="review-meta">
          <div className="stars">
            {'★'.repeat(review.owner_rating)}
            {'☆'.repeat(5 - review.owner_rating)}
          </div>
          <div className="time-ago">{review.owner_timeAgo}</div>
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
  const user = useSelector(state => state.user);
  const [selectedRating, setSelectedRating] = useState(null);
  const [visibleReviews, setVisibleReviews] = useState(3);

  const [reviewsList, setReviewsList] = useState([]);
  const [reviewData, setReviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);





  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:4000/reviews/get_reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_email: user.user_email }),
        });
        const data = await response.json();
        setReviewsList(data);
      } finally {
          setIsLoading(false);
     
      }
    };

    fetchReviews();
    console.log(user.user_email);
    
  }, [ user.user_email]);

  useEffect(() => {
    const reviewData = {
      total: reviewsList?.length || 0,
      actualTotal: reviewsList?.length || 0,
      ratings: [
        { stars: 5, count: reviewsList?.filter(review => review.owner_rating === 5)?.length || 0 },
        { stars: 4, count: reviewsList?.filter(review => review.owner_rating === 4)?.length || 0 },
        { stars: 3, count: reviewsList?.filter(review => review.owner_rating === 3)?.length || 0 },
        { stars: 2, count: reviewsList?.filter(review => review.owner_rating === 2)?.length || 0 },
        { stars: 1, count: reviewsList?.filter(review => review.owner_rating === 1)?.length || 0 },
      ]
    };
    setReviewData(reviewData);
  }, [reviewsList]);

  const filteredReviews = selectedRating 
    ? reviewsList.filter(review => review.owner_rating === selectedRating)
    : reviewsList;

  const handleShowMore = () => {
    setVisibleReviews(prev => prev + 3);
  };

  const reviewsToShow = filteredReviews.slice(0, visibleReviews);

  return (
    <div id='AddReviews'>
      {isLoading ? (
        <div className="loading-spinner">Loading your reviews...</div>
      ) : (
        <>
          <div className="reviews-header">
            <h2>{reviewData?.total} Reviews</h2>
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
            {reviewData?.ratings?.map((rating) => (
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
            {filteredReviews?.length > 0 ? (
              <>
                {reviewsToShow.map(review => (
                  <ReviewBox key={review.id} review={review} />
                ))}
                
                {visibleReviews < filteredReviews?.length && (
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
        </>
      )}
    </div>
  )
}

export default AddReviews
