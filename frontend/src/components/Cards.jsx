import React, { useState, useCallback } from 'react';
import '../css/cards.css';
import { IoCloudUploadOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import FileUploadPopup from './FileUploadPopup';



export default function Cards() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  return (
    <div className='card'>
      <div className="topg">
        <IoDocumentTextOutline size={45} />
        <p>New</p>
      </div>
      <div className="btmg">
        <button onClick={openPopup}>
          <span><IoCloudUploadOutline size={24} /></span>Upload Handout
        </button>
      </div>
      <FileUploadPopup isOpen={isPopupOpen} onClose={closePopup} />
    </div>
  );
}