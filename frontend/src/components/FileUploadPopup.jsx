import { useState, useCallback } from 'react';
import '../css/cards.css';
import PropTypes from 'prop-types';
import constants from "../constants";
import { RiCloseFill } from "react-icons/ri";
import axios from 'axios';

const FileUploadPopup = ({ isOpen, onClose }) => {
  const token = localStorage.getItem('token');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]; 
    if (selectedFile) setFile(selectedFile);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    if (file) {
      formData.append('file', file)
    }

    try {
      const response = await axios.post(constants.url + '/upload', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          'x-auth-token': token
        }
      });
      console.log(response);
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
    finally{
      setFile(null);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Upload Handout</h2>
        <form onSubmit={handleSubmit}>
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleFileChange}
              id="file-input"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input">
              {file ? file.name : 'Click or drag file to upload'}
            </label>
          </div>
          <button className='sb-btn' type="submit" disabled={!file}>Submit</button>
        </form>
        <button className='cls' onClick={onClose}><RiCloseFill size={24} /></button>
      </div>
    </div>
  );
};

FileUploadPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FileUploadPopup;