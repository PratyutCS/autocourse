import React, { useEffect, useState } from 'react';
import constants from "../constants";
import axios from 'axios';
import FeedbackForm from '../components/FeedbackForm';
import { IoReturnUpBackSharp } from "react-icons/io5";
import { useLocation } from 'react-router-dom';
import AsideComp from '../components/AsideComp';
import '../css/dash.css';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
const ErrorDisplay = ({ message }) => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="text-red-500 bg-red-50 px-6 py-4 rounded-lg shadow-sm">
      <p className="font-medium">{message}</p>
    </div>
  </div>
)
const Info = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { num, userData } = location.state || {};
  const token = localStorage.getItem('token');
  const [file, setFileData] = useState(null);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    let pollingInterval = null;

    const fetchFilesData = async () => {
      try {
        const response = await axios.post(constants.url + '/numdata', { num }, {
          headers: { 
            'x-auth-token': token,
            'ngrok-skip-browser-warning': '69420'
          }
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
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className='dash'>
      <AsideComp userEmail={userData.email} files={file} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
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
            internalAssessmentData={file["internalAssessmentData"]}
            actionsForWeakStudentsData={file["actionsForWeakStudentsData"] || ""}
            program={file["Program"] || ""}
            weeklyTimetableData={file["weeklyTimetableData"] || ""}
            mergePDF={file["mergePDF"] || ""}
            coWeightages={file["coWeightages"] || {}}
            coAttainmentCriteria={file["coAttainmentCriteria"] || {}}
            studentData={file["studentData"] || {}}
            targetAttainment={file["targetAttainment"] || {}}
            feedbackData={file["feedbackData"] || {}}
            facultyCourseReview={file["facultyCourseReview"] || ""}
            />
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </div>
    </div>
  );
};

export default Info;
