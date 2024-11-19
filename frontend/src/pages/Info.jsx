import React, { useEffect, useState } from 'react';
import constants from "../constants";
import axios from 'axios';
import FeedbackForm from '../components/FeedbackForm';
import { IoReturnUpBackSharp } from "react-icons/io5";
import { useLocation } from 'react-router-dom';
import AsideComp from '../components/AsideComp';
import '../css/dash.css'
const Info = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { num } = location.state || {};

  const token = localStorage.getItem('token');
  const [file, setFileData] = useState(null);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    let pollingInterval = null;

    const fetchFilesData = async () => {
      try {
        const response = await axios.post(constants.url + '/numdata', { num }, {
          headers: { 'x-auth-token': token }
        });
        setFileData(response.data);

        if (response.data.done === 1) {
          clearInterval(pollingInterval);
        }
      } catch (error) {
        console.error("Error fetching files data:", error);
        setError('Failed to load data');
        clearInterval(pollingInterval);
      }
    };

    if (num !== undefined) {
      pollingInterval = setInterval(fetchFilesData, 1000);
      fetchFilesData();
    }
    return () => clearInterval(pollingInterval);
  }, [num, token]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='dash'>
      <AsideComp isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
      <div className="right">
          
        <div className="box23 w-full">
          {file && file.done === 1 ? (
            <FeedbackForm
              file={file.filename}
              num={num}
              courseDescription={file["course_description"] || ""}
              coursecode={file['course_code'] || ""}
              coursetitle={file['course_name'] || ""}
              module={file['Module/Semester'] || ""}
              session={file['Session'] || ""}
              courseSyllabus={file["Course Syllabus"] || ""}
              learningResources={file["Learning Resources"] || ""}
              copoMappingData={file["copoMappingData"] || ""}
              internalAssessmentData={file["internalAssessmentData"] }
              actionsForWeakStudentsData={file["actionsForWeakStudentsData"] || ""}
              program = {file["Program"] || ""}
            />
          ) : (
            <p>Loading file information...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Info;
