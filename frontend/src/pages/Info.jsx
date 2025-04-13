import React, { useEffect, useState, useRef, useCallback } from 'react';
import constants from "../constants";
import axios from 'axios';
import FeedbackForm from '../components/FeedbackForm';
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

// Improved debounce function that returns a promise for the last invocation
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    return new Promise(resolve => {
      timeout = setTimeout(() => {
        const result = func.apply(context, args);
        resolve(result);
      }, wait);
    });
  };
}

// Function to check if an element is fully or partially within a container's viewport
function isElementInViewport(el, container, threshold = 0.3) {
  if (!el || !container) return false;
  
  const rect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  // Calculate the visible height of the element within the container
  const visibleTop = Math.max(rect.top, containerRect.top);
  const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
  const visibleHeight = visibleBottom - visibleTop;
  
  // Calculate what percentage of the element is visible
  const percentVisible = visibleHeight / rect.height;
  
  // Return true if the percentage visible is greater than the threshold
  return percentVisible > threshold;
}

const Info = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { num, userData } = location.state || {};
  const token = localStorage.getItem('token');
  const [file, setFileData] = useState(null);
  const [error, setError] = useState(null);
  const [allFiles, setAllFiles] = useState(null);
  const [activeSection, setActiveSection] = useState("header-section"); 
  const scrollingProgrammaticallyRef = useRef(false);
  const lastSetActiveRef = useRef("header-section");
  const sectionsRef = useRef([]);
  const scrollContainerRef = useRef(null);
  const scrollListenerRef = useRef(null);
  
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
        const response = await axios.post(
          constants.url + '/numdata',
          { num },
          {
            headers: {
              'x-auth-token': token,
              'ngrok-skip-browser-warning': '69420'
            }
          }
        );
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

  // Save a reference to all section elements
  const collectSections = useCallback(() => {
    // Find all section elements 
    const allSections = document.querySelectorAll('[id$="-section"]');
    
    // Convert to array and sort by Y position for more reliable detection
    const sortedSections = Array.from(allSections).sort((a, b) => {
      return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
    });
    
    // Store in ref for future use
    sectionsRef.current = sortedSections;
    return sortedSections;
  }, []);

  // Find the most visible section
  const findMostVisibleSection = useCallback(() => {
    if (!scrollContainerRef.current || sectionsRef.current.length === 0) return null;
    
    // Get all sections and their visibility status
    const sections = sectionsRef.current;
    
    // First pass: find any section that's "significantly" visible
    let bestSection = null;
    let bestVisibility = 0;
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section) continue;
      
      const rect = section.getBoundingClientRect();
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      
      // How much of the section is visible in the viewport?
      const visibleTop = Math.max(rect.top, containerRect.top);
      const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
      
      // Skip if not visible at all
      if (visibleBottom <= visibleTop) continue;
      
      const visibleHeight = visibleBottom - visibleTop;
      const percentVisible = visibleHeight / rect.height;
      
      // If this section is more visible than the previous best, use it
      if (percentVisible > bestVisibility) {
        bestVisibility = percentVisible;
        bestSection = section;
      }
      
      // If we found a section that's mostly visible, use it immediately
      if (percentVisible > 0.5) {
        return section.id;
      }
    }
    
    // If we found any visible section, return its ID
    if (bestSection && bestVisibility > 0.1) { // At least 10% visible
      return bestSection.id;
    }
    
    // Fallback to finding the section closest to the top of the viewport
    let closestToTop = null;
    let closestDistance = Infinity;
    
    const containerTop = scrollContainerRef.current.getBoundingClientRect().top + 100; // Add offset
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section) continue;
      
      const rect = section.getBoundingClientRect();
      const distanceToTop = Math.abs(rect.top - containerTop);
      
      if (distanceToTop < closestDistance) {
        closestDistance = distanceToTop;
        closestToTop = section;
      }
    }
    
    return closestToTop ? closestToTop.id : null;
  }, []);

  // Debounced function to update active section
  const debouncedUpdateSection = useCallback(
    debounce((ignoreScrolling = false) => {
      // Skip if we're scrolling programmatically, unless explicitly told to check
      if (scrollingProgrammaticallyRef.current && !ignoreScrolling) return;
      
      const mostVisibleSectionId = findMostVisibleSection();
      
      // Only update if we found a valid section and it's different from the current one
      if (mostVisibleSectionId && mostVisibleSectionId !== lastSetActiveRef.current) {
        lastSetActiveRef.current = mostVisibleSectionId;
        setActiveSection(mostVisibleSectionId);
      }
    }, 100),
    [findMostVisibleSection]
  );

  // Setup scroll handler
  useEffect(() => {
    if (!file || file.done !== 1) return;
    
    // Small delay to ensure DOM is ready
    const setupTimer = setTimeout(() => {
      // Find and store the scroll container
      scrollContainerRef.current = document.querySelector('.space-y-6.overflow-scroll');
      if (!scrollContainerRef.current) return;
      
      // Collect all sections
      collectSections();
      
      // Clear any existing listeners
      if (scrollListenerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', scrollListenerRef.current);
      }
      
      // Create a new scroll handler
      scrollListenerRef.current = () => {
        if (!scrollingProgrammaticallyRef.current) {
          debouncedUpdateSection();
        }
      };
      
      // Attach the scroll listener
      scrollContainerRef.current.addEventListener('scroll', scrollListenerRef.current);
      
      // Initial check
      debouncedUpdateSection(true);
    }, 500);
    
    return () => {
      clearTimeout(setupTimer);
      if (scrollContainerRef.current && scrollListenerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', scrollListenerRef.current);
      }
    };
  }, [file, collectSections, debouncedUpdateSection]);

  // Function to scroll to a specific section
  const handleSectionSelect = useCallback((sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const container = document.querySelector('.space-y-6.overflow-scroll');
    if (!container) return;
    
    // Mark that we're scrolling programmatically
    scrollingProgrammaticallyRef.current = true;
    
    // Update active section immediately
    lastSetActiveRef.current = sectionId;
    setActiveSection(sectionId);
    
    // Perform the scroll
    const offsetTop = section.offsetTop;
    container.scrollTo({
      top: offsetTop - 80,
      behavior: 'smooth'
    });
    
    // After scrolling completes, remove the programmatic scrolling flag
    setTimeout(() => {
      scrollingProgrammaticallyRef.current = false;
    }, 1000);
  }, []);

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className='dash'>
      <AsideComp
        userEmail={userData?.email}
        files={allFiles}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onFileSelect={handleSectionSelect}
        activeSection={activeSection}
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
              actionsForWeakStudentsData={file["actionsForWeakStudentsData"] || []}
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
              reflectionData={file["reflectionData"] || []}
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