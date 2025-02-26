import { useRef } from "react";
import React from 'react'
import { useState } from "react";
import "./OwnerDetails.css";
import { FaLink } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import { CiFacebook } from "react-icons/ci";
import { SiTelegram } from "react-icons/si";
import { FaInstagram } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa6";

function SharePopup({ onClose }) {
    const [copyToClipboardState, setShowCopyToClipboardState] = useState(false);
    const inputRef = useRef(null);
    const copyToClipboard = () => {
        const input = inputRef.current;
        input.select();
        navigator.clipboard.writeText(input.value).then(() => {
            setShowCopyToClipboardState(true)
            setTimeout(() => {
                setShowCopyToClipboardState(false);
            }, 4000);
        });
    };


    return (
        <div className="wrapper_container_for_sharing">
            <div className="popup">
                <header>
                    <span>Share Modal</span>
                    <div className="close" onClick={() => { onClose() }}>&times;</div>
                </header>
                <div className="content">
                    <p>Share this link via</p>
                    <ul className="icons">
                        <a href="https://www.facebook.com" target="_blank" rel="noreferrer"><CiFacebook className="shareableIcons" /></a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer"><FaTwitter className="shareableIcons" /></a>
                        <a href="https://www.instagram.com" target="_blank" rel="noreferrer"><FaInstagram className="shareableIcons" /></a>
                        <a href={`https://wa.me/?text=${encodeURIComponent(window.location.href.replace("search_photographer", "share_profile"))}`} target="_blank" rel="noreferrer"><FaWhatsapp className="shareableIcons" /></a>
                        <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href.replace("search_photographer", "share_profile"))}&text=Check this out!`} target="_blank" rel="noreferrer"><SiTelegram className="shareableIcons" /></a>
                    </ul>
                    <p>Or copy link</p>
                    <div className="field">
                        <FaLink />
                        <input ref={inputRef} type="text" readOnly value={window.location.href.replace("search_photographer", "share_profile")} />
                        <button onClick={copyToClipboard} style={{ cursor: "pointer" }}>Copy</button>
                    </div>
                </div>
            </div>
            {copyToClipboardState && <div className={`copy-success ${copyToClipboardState ? "true" : ""}`} >Link copied to clipboard!</div>}
        </div>
    )
}

export default SharePopup