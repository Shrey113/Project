import React, { useState, useEffect } from 'react';
import './OwnerUrlList.css';
import { FaInstagram, FaFacebook, FaPinterest, FaGlobe, FaPlus, FaTrash } from 'react-icons/fa';
import { ConfirmMessage,Server_url} from '../../../../../redux/AllData';
import { useSelector } from 'react-redux';


function OwnerUrlList() {
    const user = useSelector((state) => state.user);
    const user_email = user.user_email;
    
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState(null);

  useEffect(() => {
    fetch(`${Server_url}/owner/social-media-links/${user_email}`)
      .then(res => res.json())
      .then(data => {
        if (data.links) {
          setUrls(data.links);
        }
      })
      .catch(err => console.error('Error fetching links:', err));
  }, [user_email]);

  const getUrlIcon = (url) => {
    const domain = url.toLowerCase();
    if (domain.includes('instagram')) return <FaInstagram className="url-icon instagram" />;
    if (domain.includes('facebook')) return <FaFacebook className="url-icon facebook" />;
    if (domain.includes('pinterest')) return <FaPinterest className="url-icon pinterest" />;
    return <FaGlobe className="url-icon website" />;
  };

  const handleAddUrl = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    
    const formattedUrl = newUrl.includes('://') ? newUrl : `http://${newUrl}`;
    
    if (urls.includes(formattedUrl)) {
      alert('This URL already exists in your list!');
      return;
    }

    try {
      const response = await fetch(`${Server_url}/owner/add-social-media-links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email,
          links: [formattedUrl]
        })
      });

      const data = await response.json();
      if (data.links) {
        setUrls(data.links);
        setNewUrl('');
      }
    } catch (err) {
      console.error('Error adding URL:', err);
      alert('Failed to add URL. Please try again.');
    }
  };

  const handleDeleteUrl = (index) => {
    setUrlToDelete(index);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const urlToRemove = urls[urlToDelete];
      const response = await fetch(`${Server_url}/owner/remove-social-media-links`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email,
          links: [urlToRemove]
        })
      });

      const data = await response.json();
      if (data.links) {
        setUrls(data.links);
      }
    } catch (err) {
      console.error('Error deleting URL:', err);
      alert('Failed to delete URL. Please try again.');
    }
    setShowConfirm(false);
  };

  return (
    <div className='owner-url-list'>
      <h1>My Links</h1>
      
      <form className="url-input-form" onSubmit={handleAddUrl}>
        <input
          type="text"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="Enter website URL"
          className="url-input"
        />
        <button type="submit" className="add-button">
          <FaPlus />
        </button>
      </form>

      <div className="urls-container">
        {urls.length === 0 ? (
          <p className="no-urls">No links added yet. Add your first link above!</p>
        ) : (
          urls.map((url, index) => (
            <div key={index} className="url-item">
              {getUrlIcon(url)}
              <a href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
              <button 
                className="delete-button"
                onClick={() => handleDeleteUrl(index)}
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>

      {showConfirm && (
        <ConfirmMessage
          message_title="Delete URL"
          message="Are you sure you want to delete this URL?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmDelete}
          button_text="Delete"
        />
      )}
    </div>
  );
}

export default OwnerUrlList;
