import { useState, useEffect, useCallback, useRef } from "react";
import constants from "../constants";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";
import "../css/feedback.css";
import COPOMapping from "./COPOMapping";
import InternalAssessmentTable from "./InternalAssessmentTable";
import { IoMdDownload } from "react-icons/io";
import ActionsForWeakStudents from "./ActionsForWeakStudents";
import MBAWeeklyTimetable from "./MBAWeeklyTimetable";
import EditableCourseDescription from "./EditableCourseDescription";
import CourseSyllabus from "./CourseSyllabus";
import AddField from "./AddFiled";
import WeeklyTimetable from "./WeeklyTimetable";
import COAttainmentAnalysis from "./COAttainmentAnalysis";
import COAssessmentWeightage from "./COAssessmentWeightage";
import COAttainmentCriteria from "./COAttainmentCriteria";
import PDFUploader from "./PDFUploader";
import TargetAttainment from "./TargetAttainment";
import AdvanceAndWeakStudentIdentification from "./AdvanceAndWeakStudentIdentification";
import FeedbackAndCorrectiveActions from "./FeedbackAndCorrectiveActions";
import FacultyCourseReview from "./FacultyCourseReview";
import CourseCodeInput from "./CourseCodeInput";
import AssessmentSelection from "./AssessmentSelection";
import InstructionsCard from "./InstructionsCard";
import ExcelToJson from "./ExcelToJson";
import StudentCOAchievement from "./StudentCOAchievement";
import MidSemReflection from "./MidSemReflection";
import SubmissionSuccessModal from "./SubmissionSuccessModal";
import StudentDataAnalysis from "./StudentDataAnalysis";

const FeedbackForm = (props) => {
  const token = localStorage.getItem("token");
  const num = props.num;
  
  // Refs for preventing unnecessary reprocessing
  const processingRef = useRef(false);
  const dataProcessedRef = useRef(false);
  
  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [notification, setNotification] = useState({ visible: false, type: '', message: '' });
  const [change, setChange] = useState(false);
  const [isCourseCodeValid, setIsCourseCodeValid] = useState(false);

  // Core form data
  const [coursecode, setCourseCode] = useState(props.coursecode || "");
  const [coursetitle, setCourseTitle] = useState(props.coursetitle || "");
  const [module, setModule] = useState(props.module || "");
  const [session, setSession] = useState(props.session || "");
  const [program, setProgram] = useState(props.program || "");
  
  // Program selection
  const [selectedProgram, setSelectedProgram] = useState(0);
  
  // Student data
  const [studentData, setStudentData] = useState(props.studentData || {});
  const [originalStudentData, setOriginalStudentData] = useState({});


  
  const [isWeightageValid, setIsWeightageValid] = useState(false);
  
  // Content sections data
  const [courseSyllabus, setCourseSyllabus] = useState(
    props.courseSyllabus || [{ srNo: 1, content: "", co: "", sessions: "" }]
  );
  const [learningResources, setLearningResources] = useState({
    textBooks: props.learningResources?.textBooks || [],
    referenceLinks: props.learningResources?.referenceLinks || [],
  });
  const [EditableCourseDescriptionData, setEditableCourseDescriptionData] = useState(props.courseDescription || "");
  const [copoMappingData, setCopoMappingData] = useState(
    props.copoMappingData || { courseOutcomes: {}, mappingData: {} }
  );
  const [internalAssessmentData, setInternalAssessmentData] = useState(
    props.internalAssessmentData || { components: [] }
  );
  const [actionsForWeakStudentsData, setActionsForWeakStudentsData] = useState(
    props.actionsForWeakStudentsData || []
  );
  const [weeklyTimetableData, setWeeklyTimetableData] = useState(props.weeklyTimetableData || null);
  const [coWeightages, setCoWeightages] = useState(props.coWeightages || {});
  const [coAttainmentCriteria, setCoAttainmentCriteria] = useState(props.coAttainmentCriteria || {});
  const [targetAttainment, setTargetAttainment] = useState(props.targetAttainment || {});
  const [reflectionData, setReflectionData] = useState(props.reflectionData || []);
  const [feedbackData, setFeedbackData] = useState(
    props.feedbackData || { quantitativeFeedback: "", qualitativeFeedback: "" }
  );
  const [facultyCourseReview, setFacultyCourseReview] = useState(props.facultyCourseReview || "");
  const [selectedAssessments, setSelectedAssessments] = useState(props.selectedAssessments || []);
  const [learnerCategories, setLearnerCategories] = useState(props.learnerCategories || [[], []]);
  const [par_sem_slowLearner, setPar_sem_slowLearner] = useState(props.par_sem_slowLearner || [[], []]);

  // Program mapping options
  const programOptions = {
    1: "Computer Science Engineering",
    2: "Mechanical Engineering",
    3: "Electronics and Computer Engineering",
    4: "Bachelor of Business Administration (BBA)",
    5: "Bachelor of Commerce BCOM(Hons)",
    6: "Integrated BBA MBA",
    7: "BA (Hons) Libreral Arts",
    8: "BA LLB (Hons)",
    9: "BBA LLB (Hons)",
    10: "MBA",
  };

  console.log("Student Data:", studentData);
  console.log("Student Data:", props.originalStudentData);
  // AUTO-SAVE DEBOUNCER
  // This will ensure auto-save is only triggered after changes have settled
  const autoSaveTimeout = useRef(null);
  
  const debounceAutoSave = useCallback(() => {
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }
    
    autoSaveTimeout.current = setTimeout(() => {
      if (!processingRef.current) {
        processingRef.current = true;
        auto_postData().finally(() => {
          processingRef.current = false;
        });
      }
    }, 2000); // 2 second debounce
  }, []);

  // Initialize program selection from props
  useEffect(() => {
    const programNumber = parseInt(props.program);
    if (programOptions[programNumber]) {
      setSelectedProgram(programNumber);
    } else {
      setSelectedProgram(0);
    }
  }, [props.program]);

  // Notification handling
  const showNotification = (type, message) => {
    setNotification({ visible: true, type, message });
  };

  // Download handler
  const handleDownload = async () => {
    showNotification('loading', 'Preparing your download...');
    try {
      const response = await axios.post(
        constants.url + '/download', 
        { num }, 
        { 
          headers: { 
            'x-auth-token': token, 
            'ngrok-skip-browser-warning': '69420' 
          }, 
          responseType: 'blob' 
        }
      );
      
      if (response.status === 200) {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: 'application/pdf' })
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${coursecode || 'course'}_${coursetitle || 'feedback'}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        showNotification('success', 'File downloaded successfully!');
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      showNotification('error', 'Download failed. Please try again.');
    }
  };

  // OPTIMIZED EVENT HANDLERS
  // These handlers mark data as changed but don't trigger instant saves
  
  const handleWeakStudentsChange = useCallback((updatedData) => {
    setActionsForWeakStudentsData(updatedData);
    setChange(true);
  }, []);

  const handleReflectionChange = useCallback((updatedData) => {
    setReflectionData(updatedData);
    setChange(true);
  }, []);

  const handleCourseSyllabusChange = useCallback((data) => {
    if (data) {
      setCourseSyllabus(data);
      setChange(true);
    }
  }, []);

  const EditableCourseDescriptionDataChange = useCallback((data) => {
    setEditableCourseDescriptionData(data);
    setChange(true);
  }, []);

  const handleCOPOMappingChange = useCallback((data) => {
    const newData = { ...copoMappingData };

    if (data.courseOutcomes) {
      newData.courseOutcomes = data.courseOutcomes;
    }

    if (data.mappingData) {
      newData.mappingData = data.mappingData;
    }

    setCopoMappingData(newData);
    setChange(true);
  }, [copoMappingData]);

  const handleInternalAssessmentChange = useCallback((data) => {
    if (data && data.components) {
      setInternalAssessmentData({
        components: data.components,
      });
      setChange(true);
    }
  }, []);

  const handleLearningResourcesChange = useCallback((updatedFields, fieldType) => {
    setLearningResources((prevState) => ({
      ...prevState,
      [fieldType]: updatedFields,
    }));
    setChange(true);
  }, []);

  const handleCoAttainmentCriteriaSave = useCallback((criteria) => {
    setCoAttainmentCriteria(criteria);
    setPar_sem_slowLearner([[], []]);
    setLearnerCategories([[], []]);
  }, []);

  const handleAssessmentSelectionChange = useCallback((selected) => {
    setSelectedAssessments(selected);
    setPar_sem_slowLearner([[], []]);
    setChange(true);
  }, []);

  const handleTargetAttainmentSave = useCallback((criteria) => {
    setTargetAttainment(criteria);
  }, []);

  const handleLearners = useCallback((learnerCategoriess) => {
    setLearnerCategories(learnerCategoriess);
  }, []);

  const handlePar_sem_slowLearner = useCallback((learnerCategoriesss) => {
    setPar_sem_slowLearner(learnerCategoriesss);
  }, []);

  const handleFeedbackChange = useCallback((data) => {
    setFeedbackData(data);
    setChange(true);
  }, []);

  // CRITICAL FIX: The optimized handler for ExcelToJSON data
  // This prevents the infinite loop of updates
  const handleStudentDataSave = useCallback((data) => {
    // Skip if no data or already processing
    if (!data || processingRef.current) return;
    
    // For first load, always process the data
    if (!dataProcessedRef.current) {
      dataProcessedRef.current = true;
      
      if (data.studentData && data.originalStudentData) {
        setStudentData(data.studentData);
        setOriginalStudentData(data.originalStudentData);
      } else {
        // Handle legacy format
        setStudentData({ 
          maxMarks: data.maxMarks || {}, 
          data: data.data || [] 
        });
        
        setOriginalStudentData({ 
          maxMarks: data.maxMarks || {}, 
          data: data.originalData || [] 
        });
      }
      
      return;
    }
    
    // For subsequent updates, check if data has actually changed
    let shouldUpdate = false;
    let newStudentData;
    let newOriginalStudentData;
    
    if (data.studentData && data.originalStudentData) {
      newStudentData = data.studentData;
      newOriginalStudentData = data.originalStudentData;
      
      // Only update if data actually changed (basic length check)
      shouldUpdate = 
        newStudentData.data?.length !== studentData.data?.length ||
        newOriginalStudentData.data?.length !== originalStudentData.data?.length;
    } else {
      // Legacy format
      newStudentData = { 
        maxMarks: data.maxMarks || {}, 
        data: data.data || [] 
      };
      
      newOriginalStudentData = { 
        maxMarks: data.maxMarks || {}, 
        data: data.originalData || [] 
      };
      
      // Only update if data actually changed (basic length check)
      shouldUpdate = 
        newStudentData.data?.length !== studentData.data?.length ||
        newOriginalStudentData.data?.length !== originalStudentData.data?.length;
    }
    
    if (shouldUpdate) {
      console.log("Student data actually changed, updating state");
      setStudentData(newStudentData);
      setOriginalStudentData(newOriginalStudentData);
      setChange(true);
    } else {
      console.log("No change in student data, skipping update");
    }
  }, [studentData.data?.length, originalStudentData.data?.length]);

  // Course code validation
  const validateCourseCode = useCallback((code) => {
    // Empty is not valid
    if (!code || code.length === 0) {
      setIsCourseCodeValid(false);
      return;
    }

    // Must be exactly 7 characters
    if (code.length !== 7) {
      setIsCourseCodeValid(false);
      return;
    }

    const firstThree = code.substring(0, 3);
    const lastFour = code.substring(3);

    const isFirstThreeAlpha = /^[a-zA-Z]+$/.test(firstThree);
    const isLastFourNumeric = /^[0-9]+$/.test(lastFour);

    if (isFirstThreeAlpha && isLastFourNumeric) {
      setIsCourseCodeValid(true);
    } else {
      setIsCourseCodeValid(false);
    }
  }, []);

  // Validate criteria for form submission
  const validateCriteria = useCallback(() => {
    return Object.keys(coAttainmentCriteria).every((co) => {
      const { full, partial } = coAttainmentCriteria[co];
      return parseFloat(full) > parseFloat(partial);
    });
  }, [coAttainmentCriteria]);

  const validateTargetAttainment = useCallback(() => {
    return Object.keys(targetAttainment).every((co) => {
      const { full, partial } = targetAttainment[co];
      return parseFloat(full) > parseFloat(partial);
    });
  }, [targetAttainment]);

  // AUTO-SAVE IMPLEMENTATION
  const auto_postData = async () => {
    // Generate timestamp for modification
    let last_modified =
      new Date().toLocaleString("en-IN", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }) +
      ", " +
      new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

    // Check if all validation is passing before submission
    if (!isWeightageValid) {
      setCoWeightages(props.coWeightages || {});
    }
    if (!validateCriteria()) {
      setCoAttainmentCriteria(props.coAttainmentCriteria || {});
    }
    if (!validateTargetAttainment()) {
      setTargetAttainment(props.targetAttainment || {});
    }
    if (!isCourseCodeValid) {
      setCourseCode(props.coursecode || "");
    }

    if (num !== undefined) {
      if (selectedProgram <= 0 || selectedProgram > 10) {
        return; // Don't auto-save without selecting a program
      }

      try {
        const response = await axios.post(
          constants.url + "/form",
          {
            program: selectedProgram,
            num,
            coursecode,
            coursetitle,
            module,
            session,
            EditableCourseDescriptionData,
            courseSyllabus,
            learningResources,
            copoMappingData,
            internalAssessmentData,
            actionsForWeakStudentsData,
            weeklyTimetableData,
            coWeightages,
            coAttainmentCriteria,
            studentData,
            originalStudentData,
            targetAttainment,
            feedbackData,
            facultyCourseReview,
            learnerCategories,
            selectedAssessments,
            par_sem_slowLearner,
            last_modified,
            reflectionData,
          },
          {
            headers: {
              "x-auth-token": token,
              "ngrok-skip-browser-warning": "69420",
            },
          }
        );
        console.log("[auto] Form auto-saved successfully");
      } catch (error) {
        console.error("Error auto-saving form:", error);
      }
    }
  };

  // MANUAL FORM SUBMISSION
  const postData = async () => {
    let last_modified =
      new Date().toLocaleString("en-IN", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }) +
      ", " +
      new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
  
    if (num !== undefined) {
      if (selectedProgram <= 0 || selectedProgram > 10) {
        alert("Please select a valid program option before submitting.");
        return;
      }
  
      try {
        setIsLoading(true);
        const response = await axios.post(
          constants.url + "/form",
          {
            program: selectedProgram,
            num,
            coursecode,
            coursetitle,
            module,
            session,
            EditableCourseDescriptionData,
            courseSyllabus,
            learningResources,
            copoMappingData,
            internalAssessmentData,
            actionsForWeakStudentsData,
            weeklyTimetableData,
            coWeightages,
            coAttainmentCriteria,
            studentData,
            originalStudentData,
            targetAttainment,
            feedbackData,
            facultyCourseReview,
            learnerCategories,
            selectedAssessments,
            par_sem_slowLearner,
            last_modified,
            reflectionData,
          },
          {
            headers: {
              "x-auth-token": token,
              "ngrok-skip-browser-warning": "69420",
            },
          }
        );
        console.log("Form submitted successfully:", response.data);
        setSubmitSuccess(true);
      } catch (error) {
        console.error("Error submitting form:", error);
        showNotification('error', 'An error occurred while submitting the form.');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Wrong number of the file cannot save. Check with admin...");
    }
  };

  // EFFECT HOOKS FOR INITIALIZATION AND STATE UPDATES
  
  // Course code validation
  useEffect(() => {
    validateCourseCode(coursecode);
  }, [coursecode, validateCourseCode]);
  
  // Auto-save trigger after change flag is set
  useEffect(() => {
    if (change) {
      console.log("Change detected, scheduling auto-save");
      setChange(false);
      debounceAutoSave();
    }
  }, [change, debounceAutoSave]);

  // SEARCHABLE DROPDOWN COMPONENT
  const SearchableDropdown = ({ options, value, onChange }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // Filter options based on search term
    const filteredOptions = Object.entries(options).filter(([_, label]) =>
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get the selected program label
    const selectedLabel = options[value] || "Select a program";

    return (
      <div className="relative w-full">
        <div
          className={`flex items-center border ${
            value ? "border-[#FFB255]" : "border-gray-300"
          } rounded-md overflow-hidden`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-2 flex-grow cursor-pointer flex items-center justify-between">
            <span
              className={value ? "font-medium text-gray-800" : "text-gray-500"}
            >
              {selectedLabel}
            </span>
            {value > 0 && (
              <span className="ml-2 bg-[#FFB255] text-white text-xs px-2 py-0.5 rounded-full">
                Selected
              </span>
            )}
          </div>
          <button
            className={`p-2 ${
              value ? "bg-[#FFB255] text-white" : "bg-gray-100 text-gray-700"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? "▲" : "▼"}
          </button>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg overflow-hidden">
            <input
              type="text"
              placeholder="Search programs..."
              className="p-3 w-full border-b focus:outline-none focus:border-[#FFB255]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(([programValue, label]) => (
                  <div
                    key={programValue}
                    className={`p-3 cursor-pointer flex items-center justify-between ${
                      parseInt(programValue) === value
                        ? "bg-[#FFB255] bg-opacity-20 border-l-4 border-[#FFB255] text-[#FFB255] font-medium"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      onChange(parseInt(programValue));
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    <span>{label}</span>
                    {parseInt(programValue) === value && (
                      <svg
                        className="w-5 h-5 text-[#FFB255]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-center">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // NOTIFICATION COMPONENT
  const Notification = () => {
    if (!notification.visible) return null;
    
    let icon;
    let bgColor = "bg-[#FFB255]";
    let textColor = "text-white";
    
    switch(notification.type) {
      case 'success':
        icon = (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
        bgColor = "bg-green-500";
        break;
      case 'error':
        icon = (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
        bgColor = "bg-red-500";
        break;
      case 'loading':
        icon = (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        );
        break;
      default:
        icon = (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
    
    return (
      <div className="fixed top-6 right-6 z-50">
        <div className={`${bgColor} ${textColor} flex items-center gap-3 py-3 px-4 rounded-lg shadow-lg max-w-xs animate-fade-in`}>
          <div className="flex-shrink-0">
            {icon}
          </div>
          <p className="text-sm font-medium">{notification.message}</p>
          <button 
            onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
            className="ml-auto text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  // RENDER THE COMPONENT
  return (
    <div className="p-5 gap-[2rem] h-screen flex flex-col bg-[#FFFEFD]">
      {notification.visible && <Notification />}
      
      <SubmissionSuccessModal
        isOpen={submitSuccess}
        onClose={() => {
          setSubmitSuccess(false);
          window.location.reload();
        }}
        onDownload={handleDownload}
      />
      
      <div
        id="header-section"
        className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-md p-5 border border-gray-200 mb-6 transition-all hover:shadow-lg"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 text-gray-700 font-medium transition-all duration-300 px-4 py-2.5 rounded-xl bg-white/70 hover:bg-white border border-gray-200 hover:border-amber-200 hover:shadow-sm"
            aria-label="Go back to files"
          >
            <svg
              className="w-5 h-5 text-amber-500 transform group-hover:-translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Files</span>
          </button>

          {/* Status & Submit Button Section */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Validation Status Pills - Compact version */}
            <div className="hidden md:flex items-center gap-1.5 mr-3 bg-white/80 p-1.5 rounded-xl border border-gray-200">
              <div
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  isWeightageValid ? "bg-green-500" : "bg-red-400"
                }`}
                title="Weightage validation"
              ></div>
              <div
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  validateCriteria() ? "bg-green-500" : "bg-red-400"
                }`}
                title="Criteria validation"
              ></div>
              <div
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  validateTargetAttainment() ? "bg-green-500" : "bg-red-400"
                }`}
                title="Target attainment validation"
              ></div>
              <div
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  selectedProgram !== 0 ? "bg-green-500" : "bg-gray-300"
                }`}
                title="Program selected"
              ></div>
              <div
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  isCourseCodeValid ? "bg-green-500" : "bg-gray-300"
                }`}
                title="Course code validation"
              ></div>
            </div>

            {/* Submit Button */}
            <button
              onClick={postData}
              className={`relative transition-all duration-300 text-white font-medium rounded-xl px-6 py-3 flex items-center gap-2 ${
                isWeightageValid &&
                validateCriteria() &&
                validateTargetAttainment() &&
                selectedProgram !== 0 &&
                isCourseCodeValid
                  ? "bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={
                !isWeightageValid ||
                !validateCriteria() ||
                !validateTargetAttainment() ||
                selectedProgram === 0 ||
                !isCourseCodeValid ||
                isLoading
              }
            >
              <span className="relative z-10">
                {isLoading ? "Submitting..." : "Submit Form"}
              </span>
              {isWeightageValid &&
              validateCriteria() &&
              validateTargetAttainment() &&
              selectedProgram !== 0 &&
              isCourseCodeValid ? (
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v1"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Validation Messages - Elegantly styled */}
        {(!isWeightageValid ||
          !validateCriteria() ||
          !validateTargetAttainment()) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {!isWeightageValid && (
              <div className="text-red-600 text-sm flex items-center bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 shadow-sm">
                <svg
                  className="w-4 h-4 mr-2 flex-shrink-0 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>CO Assessment weightages must add up to 100%</span>
              </div>
            )}

            {!validateCriteria() && (
              <div className="text-red-600 text-sm flex items-center bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 shadow-sm">
                <svg
                  className="w-4 h-4 mr-2 flex-shrink-0 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  CO Attainment Criteria: Fully attained must be greater than
                  partially attained
                </span>
              </div>
            )}

            {!validateTargetAttainment() && (
              <div className="text-red-600 text-sm flex items-center bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 shadow-sm">
                <svg
                  className="w-4 h-4 mr-2 flex-shrink-0 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>
                  Target Attainment: Fully attained must be greater than or
                  equal to partially attained
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6 overflow-scroll">
        <InstructionsCard />

        <div className="grid grid-cols-2 gap-4">
          {/* Program Section */}
          <div
            className={`bg-white p-6 rounded-lg shadow-sm border ${
              selectedProgram === 0 ? "border-red-600" : "border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
                1
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Program</h2>
            </div>
            <SearchableDropdown
              options={programOptions}
              value={selectedProgram}
              onChange={(value) => {
                setSelectedProgram(value);
                setChange(true);
              }}
            />
          </div>

          {/* Course Code Section */}
          <div
            className={`bg-white p-6 rounded-lg shadow-sm border ${
              !isCourseCodeValid ? "border-red-600" : "border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
                2
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Course Code
              </h2>
            </div>
            <CourseCodeInput
              value={coursecode}
              onChange={(value) => {
                setCourseCode(value);
                setChange(true);
              }}
            />
          </div>

          {/* Course Title Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
                3
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Course Title
              </h2>
            </div>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-md transition-all resize-none text-gray-700"
              placeholder="Enter course title here..."
              value={coursetitle}
              onChange={(e) => {
                setCourseTitle(e.target.value);
                setChange(true);
              }}
              rows="2"
            />
          </div>

          {/* Module/Semester Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
                4
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Module/Semester
              </h2>
            </div>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-md transition-all resize-none text-gray-700"
              placeholder="Enter module/semester here..."
              value={module}
              onChange={(e) => {
                setModule(e.target.value);
                setChange(true);
              }}
              rows="2"
            />
          </div>

          {/* Session Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
                5
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Session</h2>
            </div>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-md transition-all resize-none text-gray-700"
              placeholder="Enter session here..."
              value={session}
              onChange={(e) => {
                setSession(e.target.value);
                setChange(true);
              }}
              rows="2"
            />
          </div>
        </div>

        {/* Course Description Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
              6
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Course Description and its objectives
            </h2>
          </div>
          <EditableCourseDescription
            courseDescription={EditableCourseDescriptionData}
            onChange={EditableCourseDescriptionDataChange}
          />
        </div>

        {/* CO-PO Mapping Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
              7
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Course Outcomes and CO-PO Mapping
            </h2>
          </div>
          <COPOMapping
            program={selectedProgram.toString()}
            onSave={handleCOPOMappingChange}
            initialData={copoMappingData}
            key={`copo-${selectedProgram}`}
          />
        </div>
        
        <CourseSyllabus
          onSave={handleCourseSyllabusChange}
          initialData={courseSyllabus}
        />

        {/* Internal Assessments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              9
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Weekly Time-Table
            </h2>
          </div>
          <div className="p-4 rounded-lg">
            {selectedProgram === 6 || selectedProgram === 10 ? (
              <MBAWeeklyTimetable
                initialData={weeklyTimetableData}
                onChange={(newTimetable) => {
                  setWeeklyTimetableData(newTimetable);
                  setChange(true);
                }}
              />
            ) : (
              <WeeklyTimetable
                initialData={weeklyTimetableData}
                onChange={(newTimetable) => {
                  setWeeklyTimetableData(newTimetable);
                  setChange(true);
                }}
              />
            )}
          </div>
        </div>
        
        {/* Excel to JSON to extract student data */}
        <ExcelToJson 
          onSave={handleStudentDataSave} 
          initialData={props.originalStudentData} 
          selectedProgram={selectedProgram}
        />

        {/* CO Assessment weightage Section */}
        <div
          className={`bg-white rounded-xl shadow-sm border ${
            !isWeightageValid ? "border-red-600" : "border-gray-100"
          } mt-8`}
        >
          <COAssessmentWeightage
            copoMappingData={copoMappingData}
            studentData={studentData}
            initialWeightages={coWeightages}
            onChange={(weightages) => {
              setCoWeightages(weightages);
              setChange(true);
            }}
            onValidationChange={(isValid) => setIsWeightageValid(isValid)}
          />
        </div>

        {/* Student Data Analysis */}
        <StudentDataAnalysis studentData={studentData}/>

        {/* CO Attainment Criteria Section with error border if invalid */}
        <div
          className={`bg-white rounded-xl shadow-sm border ${
            !validateCriteria() ? "border-red-600" : "border-gray-100"
          }`}
        >
          <COAttainmentCriteria
            copoMappingData={copoMappingData}
            initialCriteria={coAttainmentCriteria}
            onSave={handleCoAttainmentCriteriaSave}
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              13
            </div>
            <h2 className="section-title text-xl font-semibold">
              Low / Medium / Advance Learner Identification on the basis of Mid-Semester/Internal Assessments
            </h2>
          </div>
          <AssessmentSelection
            studentData={studentData}
            selectedAssessments={selectedAssessments}
            onChange={handleAssessmentSelectionChange}
          />
          <StudentCOAchievement
            selectedAssessments={selectedAssessments}
            coWeightages={coWeightages}
            studentData={studentData}
            coAttainmentCriteria={coAttainmentCriteria}
            learnerCategories={par_sem_slowLearner}
            onSave={handlePar_sem_slowLearner}
          />
        </div>
        
        <div
          className={`bg-white rounded-xl shadow-sm border ${
            !validateTargetAttainment() ? "border-red-600" : "border-gray-100"
          }`}
        >
          <TargetAttainment
            copoMappingData={copoMappingData}
            initialCriteria={targetAttainment}
            onSave={handleTargetAttainmentSave}
          />
        </div>

        <COAttainmentAnalysis
          coWeightages={coWeightages}
          studentData={studentData}
          coAttainmentCriteria={coAttainmentCriteria}
          copoMappingData={copoMappingData}
          targetAttainment={targetAttainment}
        />
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              11
            </div>
            <h2 className="section-title text-xl font-semibold">
              Details of Internal Assessments, Weightages, Due dates and mapping to CO
            </h2>
          </div>
          <InternalAssessmentTable
            onSave={handleInternalAssessmentChange}
            initialData={internalAssessmentData}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
              12
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Mid-Semester/Internal Assessment Question papers with sample solutions
            </h2>
          </div>
          <PDFUploader
            num={num}
            assignmentType="Assignment1"
            onUploadSuccess={(filename) => {
              console.log("File uploaded:", filename);
            }}
            onDeleteSuccess={() => {
              console.log("File deleted");
            }}
          />
        </div>
        
        <MidSemReflection
          label="Reflections"
          initialData={reflectionData}
          onSave={handleReflectionChange}
        />
        
        <ActionsForWeakStudents
          label="Actions Taken for Low Performers"
          initialData={actionsForWeakStudentsData}
          onSave={handleWeakStudentsChange}
        />
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
              16
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Endsem Question Paper with Sample Solutions
            </h2>
          </div>
          <PDFUploader
            num={num}
            assignmentType="Endterm"
            onUploadSuccess={(filename) => {
              console.log("File uploaded:", filename);
            }}
            onDeleteSuccess={() => {
              console.log("File deleted");
            }}
          />
        </div>
        
        <AdvanceAndWeakStudentIdentification
          coWeightages={coWeightages}
          studentData={studentData}
          coAttainmentCriteria={coAttainmentCriteria}
          learnerCategories={learnerCategories}
          onSave={handleLearners}
        />
         
        <FeedbackAndCorrectiveActions
          initialData={feedbackData}
          onSave={handleFeedbackChange}
        />
        
        <FacultyCourseReview
          initialData={facultyCourseReview}
          onSave={(data) => {
            setFacultyCourseReview(data);
            setChange(true);
          }}
        />

        {/* Learning Resources Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
              23
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Learning Resources
            </h2>
          </div>
          <div className="space-y-6">
            <AddField
              label="Text Book"
              initialData={learningResources.textBooks}
              onChange={(updatedFields) =>
                handleLearningResourcesChange(updatedFields, "textBooks")
              }
            />
            <AddField
              label="Reference Link"
              initialData={learningResources.referenceLinks}
              onChange={(updatedFields) =>
                handleLearningResourcesChange(updatedFields, "referenceLinks")
              }
            />
          </div>
        </div>
      </div>
      
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export default FeedbackForm;