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
  const [allFiles, setAllFiles] = useState(null);
  const [activeSection, setActiveSection] = useState("program-section"); // Default active section
  
  // Fetch all files for the sidebar
  useEffect(() => {
    const fetchAllFiles = async () => {
      try {
        const filesResponse = await axios.get(constants.url + "/files", {
          headers: { 
            "x-auth-token": token,
            "ngrok-skip-browser-warning": "69420"
          },
        });
        setAllFiles(filesResponse.data);
      } catch (error) {
        console.error("Error fetching all files:", error);
      }
    };

    fetchAllFiles();
  }, [token]);

  // Fetch single file data
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

  // Set up intersection observer to track which section is currently visible
  useEffect(() => {
    const observerOptions = {
      root: document.querySelector('.space-y-6.overflow-auto'),
      rootMargin: '0px',
      threshold: 0.5, // Element is considered "visible" when 50% is in view
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all section elements
    const sectionElements = document.querySelectorAll('[id$="-section"]');
    sectionElements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      sectionElements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, [file]); // Re-run when file data is loaded

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // Custom handler for file selection in info view - this will navigate to sections
  const handleSectionSelect = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId); // Update active section when clicked
    }
  };

  return (
    <div className='dash'>
      <AsideComp 
        userEmail={userData?.email} 
        files={allFiles} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onFileSelect={handleSectionSelect}
        activeSection={activeSection} // Pass active section to sidebar
      />
      <div className="right h-screen overflow-hidden">
      <div className="box23 w-full h-full">
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
              coWeightages={file["coWeightages"] || {}}
              coAttainmentCriteria={file["coAttainmentCriteria"] || {}}
              studentData={file["studentData"] || {}}
              targetAttainment={file["targetAttainment"] || {}}
              feedbackData={file["feedbackData"] || {}}
              facultyCourseReview={file["facultyCourseReview"] || ""}
              learnerCategories={file["learnerCategories"] || [[],[]]}
              selectedAssessments={file["selectedAssessments"] || []}
              par_sem_slowLearner={file["par_sem_slowLearner"] || [[],[]]}
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