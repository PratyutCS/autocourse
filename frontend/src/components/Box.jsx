import React from 'react'
import '../css/box.css'
import Cards from "./Cards";
import NewC from  "./NewC";

export default function Box(props) {
  if(props.files != null){
    console.log("files is : "+props.files);
    console.log("files length is : "+props.files.length);
    console.log(props.files[0]);
  }

  return (
    <div className ="box1">
      <Cards/>

      {props.files && props.files.length > 0 ? (
        props.files.map((file, index) => (
          <div key={index} className="file-card">
            <NewC 
              name={(file["course_name"]) || file.filename || "Unknown Course"} 
              num={index} 
            /> 
          </div>
        ))
      ) : (
        <p>No files available.</p>
      )}     
    </div>
  )
}