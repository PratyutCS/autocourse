import React, { useEffect } from 'react';
import '../css/box.css';
import Cards from './Cards';
import NewC from './NewC';

export default function Box(props) {

  return (
    <div className="box1">
      <Cards />

      {props.files && props.files.length > 0 ? (
        props.files.map((file, index) => (
          <div key={index} className="file-card">
            <NewC 
              name={file.course_name || file.course_code || file.filename || "Unknown Course"} 
              num={index} 
              userData={props.userData} 
            />
          </div>
        ))
      ) : (
        <p>No files available.</p>
      )}
    </div>
  );
}