import { useState, useEffect } from "react";
import constants from "../constants";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";
import "../css/feedback.css";
import { IoReturnUpBackSharp } from "react-icons/io5";
import COPOMapping from "./COPOMapping";
import InternalAssessmentTable from "./InternalAssessmentTable";
import ActionsForWeakStudents from "./ActionsForWeakStudents";
import MBAWeeklyTimetable from './MBAWeeklyTimetable';
import EditableCourseDescription from "./EditableCourseDescription";
import CourseSyllabus from "./CourseSyllabus";
import AddField from "./AddFiled";
import WeeklyTimetable from "./WeeklyTimetable";
import { AlertCircle } from "lucide-react";
import COAttainmentAnalysis from "./COAttainmentAnalysis";
import COAssessmentWeightage from "./COAssessmentWeightage";
import COAttainmentCriteria from './COAttainmentCriteria';
import PDFUploader from './PDFUploader';
import TargetAttainment from './TargetAttainment';
import AdvanceAndWeakStudentIdentification from './AdvanceAndWeakStudentIdentification';
import FeedbackAndCorrectiveActions from './FeedbackAndCorrectiveActions';
import FacultyCourseReview from './FacultyCourseReview';
import CourseCodeInput from './CourseCodeInput';
import AssessmentSelection from './AssessmentSelection';
import InstructionsCard from './InstructionsCard';

import ExcelToJson from './ExcelToJson';

const FeedbackForm = (props) => {
  const token = localStorage.getItem("token");

  let num = props.num;
  const [isLoading, setIsLoading] = useState(false);
  const [coursecode, setCourseCode] = useState("");
  const [coursetitle, setCourseTitle] = useState("");
  const [module, setModule] = useState("");
  const [session, setSession] = useState("");
  const [program, setProgram] = useState("");

  const [courseSyllabus, setCourseSyllabus] = useState([
    {
      srNo: 1,
      content: "",
      co: "",
      sessions: "",
    },
  ]);
  const [learningResources, setLearningResources] = useState({
    textBooks: [],
    referenceLinks: [],
  });

  const [EditableCourseDescriptionData, setEditableCourseDescriptionData] =
    useState("");
  const [copoMappingData, setCopoMappingData] = useState({
    courseOutcomes: {},
    mappingData: {},
  });

  const [internalAssessmentData, setInternalAssessmentData] = useState({
    components: [],
  });
  const [actionsForWeakStudentsData, setActionsForWeakStudentsData] = useState(
    []
  );
  const [weeklyTimetableData, setWeeklyTimetableData] = useState(null);

  const handleWeakStudentsChange = (updatedData) => {
    setActionsForWeakStudentsData(updatedData);
  };

  const handleCourseSyllabusChange = (data) => {
    if (data) {
      setCourseSyllabus(data);
    }
  };

  const EditableCourseDescriptionDataChange = (data) => {
    setEditableCourseDescriptionData(data);
  };

  const handleCOPOMappingChange = (data) => {
    const newData = { ...copoMappingData };

    if (data.courseOutcomes) {
      newData.courseOutcomes = data.courseOutcomes;
    }

    if (data.mappingData) {
      newData.mappingData = data.mappingData;
    }

    setCopoMappingData(newData);
  };

  const handleInternalAssessmentChange = (data) => {
    if (data && data.components) {
      setInternalAssessmentData({
        components: data.components,
      });
    }
  };

  const handleLearningResourcesChange = (updatedFields, fieldType) => {
    setLearningResources((prevState) => ({
      ...prevState,
      [fieldType]: updatedFields,
    }));
  };

  const [coWeightages, setCoWeightages] = useState(props.coWeightages || {});
  const [isWeightageValid, setIsWeightageValid] = useState(false);



  const [coAttainmentCriteria, setCoAttainmentCriteria] = useState({});
  const [targetAttainment, setTargetAttainment] = useState({});

  const handleCoAttainmentCriteriaSave = (criteria) => {
    setCoAttainmentCriteria(criteria);
  };
  const handleTargetAttainmentSave = (criteria) => {
    setTargetAttainment(criteria);
  };

  const [learnerCategories, setLearnerCategories] = useState({
    advancedLearners: [],
    mediumLearners: [],
    slowLearners: []
  });

  const handleLearners = (learnerCategories) => {
    console.log("this ran");
    setLearnerCategories(learnerCategories);
  };

  useEffect(() => {
    setLearnerCategories(props.learnerCategories || {
      advancedLearners: [],
      mediumLearners: [],
      slowLearners: []
    });
  }, [props.learnerCategories]);

  const [studentData, setStudentData] = useState([]);

  const handleStudentDataSave = (data) => {
    setStudentData(data);
  };

  const [feedbackData, setFeedbackData] = useState({
    quantitativeFeedback: "",
    qualitativeFeedback: ""
  });

  useEffect(() => {
    setFeedbackData(props.feedbackData || {
      quantitativeFeedback: "",
      qualitativeFeedback: ""
    });
  }, [props.feedbackData]);

  const handleFeedbackChange = (data) => {
    setFeedbackData(data);
  };

  const [facultyCourseReview, setFacultyCourseReview] = useState("");

  useEffect(() => {
    setFacultyCourseReview(props.facultyCourseReview || "");
  }, [props.facultyCourseReview]);

  const validateCourseCode = (code) => {
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
  };

  const [selectedAssessments, setSelectedAssessments] = useState(props.selectedAssessments || []);

  useEffect(() => {
    setSelectedAssessments(props.selectedAssessments || []);
  }, [props.selectedAssessments]);



  const [par_sem_slowLearner, setPar_sem_slowLearner] = useState(props.par_sem_slowLearner || []);

  useEffect(() => {
    setPar_sem_slowLearner(props.par_sem_slowLearner || []);
  }, [props.par_sem_slowLearner]);


  /////////////////////////////////////////**Use Effect**//////////////////////////

  const [isCourseCodeValid, setIsCourseCodeValid] = useState(false);

  useEffect(() => {
    validateCourseCode(coursecode);
  }, [coursecode]);

  useEffect(() => {
    setStudentData(props.studentData || {});
    // console.log("SAVED STUDENT DATA", studentData);
  }, [props.studentData]);

  useEffect(() => {
    setCoAttainmentCriteria(props.coAttainmentCriteria || "");
  }, [props.coAttainmentCriteria]);

  useEffect(() => {
    setTargetAttainment(props.targetAttainment || "");
  }, [props.targetAttainment]);

  useEffect(() => {
    setCourseCode(props.coursecode || "");
  }, [props.coursecode]);


  useEffect(() => {
    setCoWeightages(props.coWeightages || {});
  }, [props.coWeightages]);

  useEffect(() => {
    setCourseTitle(props.coursetitle || "");
  }, [props.coursetitle]);

  useEffect(() => {
    setModule(props.module || "");
  }, [props.module]);

  useEffect(() => {
    setSession(props.session || "");
  }, [props.session]);

  useEffect(() => {
    setProgram(props.program || "");
  }, [props.program]);

  useEffect(() => {
    setCourseSyllabus(
      props.courseSyllabus || [
        {
          srNo: 1,
          content: "",
          co: "",
          sessions: "",
        },
      ]
    );
  }, [props.courseSyllabus]);

  useEffect(() => {
    setLearningResources({
      textBooks: props.learningResources?.textBooks || [],
      referenceLinks: props.learningResources?.referenceLinks || [],
    });
  }, [props.learningResources]);

  useEffect(() => {
    setEditableCourseDescriptionData(props.courseDescription || "");
  }, [props.courseDescription]);

  useEffect(() => {
    setCopoMappingData(
      props.copoMappingData || {
        courseOutcomes: {},
        mappingData: {},
      }
    );
  }, [props.copoMappingData]);

  useEffect(() => {
    setInternalAssessmentData(
      props.internalAssessmentData || {
        components: [],
      }
    );
  }, [props.internalAssessmentData]);

  useEffect(() => {
    if (props.actionsForWeakStudentsData) {
      setActionsForWeakStudentsData(props.actionsForWeakStudentsData);
    }
  }, [props.actionsForWeakStudentsData]);

  useEffect(() => {
    setWeeklyTimetableData(props.weeklyTimetableData || null);
  }, [props.weeklyTimetableData]);


  useEffect(() => {
    const loadSavedData = () => {
      try {
        if (props.weeklyTimetableData) {
          setWeeklyTimetableData(props.weeklyTimetableData);
          return;
        }

        const savedData = localStorage.getItem(`formData_${num}`);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (parsedData.weeklyTimetableData) {
            setWeeklyTimetableData(parsedData.weeklyTimetableData);
          }
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    };

    loadSavedData();
  }, [num, props.weeklyTimetableData]);

  const [selectedProgram, setSelectedProgram] = useState(0);

  useEffect(() => {
    const programNumber = parseInt(props.program);
    if (programOptions[programNumber]) {
      setSelectedProgram(programNumber);
    } else {
      setSelectedProgram(0);
    }
  }, [props.program]);

  const programOptions = {
    1: 'Computer Science Engineering',
    2: 'Mechanical Engineering',
    3: 'Electronics and Computer Engineering',
    4: 'Bachelor of Business Administration (BBA)',
    5: 'Bachelor of Commerce BCOM(Hons)',
    6: 'Integrated BBA MBA',
    7: 'BA (Hons) Libreral Arts',
    8: 'BA LLB (Hons)',
    9: 'BBA LLB (Hons)',
    10: 'MBA'
  };

  const SearchableDropdown = ({ options, value, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Filter options based on search term
    const filteredOptions = Object.entries(options).filter(([_, label]) =>
      label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get the selected program label
    const selectedLabel = options[value] || "Select a program";

    return (
      <div className="relative w-full">
        {/* Search input with selected value prominently displayed */}
        <div
          className={`flex items-center border ${value ? 'border-[#FFB255]' : 'border-gray-300'} rounded-md overflow-hidden`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-2 flex-grow cursor-pointer flex items-center justify-between">
            {/* Show selected value prominently */}
            <span className={value ? 'font-medium text-gray-800' : 'text-gray-500'}>
              {selectedLabel}
            </span>

            {/* Status indicator for selected items */}
            {value > 0 && (
              <span className="ml-2 bg-[#FFB255] text-white text-xs px-2 py-0.5 rounded-full">
                Selected
              </span>
            )}
          </div>
          <button
            className={`p-2 ${value ? 'bg-[#FFB255] text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? '▲' : '▼'}
          </button>
        </div>

        {/* Search field appears when dropdown is open */}
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
                    className={`p-3 cursor-pointer flex items-center justify-between
                      ${parseInt(programValue) === value
                        ? "bg-[#FFB255] bg-opacity-20 border-l-4 border-[#FFB255] text-[#FFB255] font-medium"
                        : "hover:bg-gray-100"}`}
                    onClick={() => {
                      onChange(parseInt(programValue));
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                  >
                    <span>{label}</span>
                    {parseInt(programValue) === value && (
                      <svg className="w-5 h-5 text-[#FFB255]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-center">No results found</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const validateCriteria = () => {
    return Object.keys(coAttainmentCriteria).every(co => {
      const { full, partial } = coAttainmentCriteria[co];
      return parseFloat(full) > parseFloat(partial);
    });
  };

  const validateTargetAttainment = () => {
    return Object.keys(targetAttainment).every(co => {
      const { full, partial } = targetAttainment[co];
      // Adjust the operator if you need 'greater than or equal to'
      return parseFloat(full) > parseFloat(partial);
    });
  };


  const postData = async () => {
    if (!isWeightageValid) {
      alert("Please ensure all CO Assessment weightages add up to 100% before submitting.");
      return;
    }
    if (!validateCriteria()) {
      alert("Please ensure that the 'Min. % marks (fully attained)' are greater than or equal to 'Min. % marks (partially attained)' for all COs.");
      return;
    }
    if (!validateTargetAttainment()) {
      alert("Please ensure that in Target Attainment, the 'Min. % students (fully attained)' are greater than or equal to 'Min. % students (partially attained)' for all COs.");
      return;
    }
    if (!isCourseCodeValid) {
      alert("Please enter a valid course code (3 letters followed by 4 numbers).");
      return;
    }
    if (num !== undefined) {
      if (selectedProgram === 0) {
        alert("Please select a valid program option before submitting.");
        return;
      }
      try {
        setIsLoading(true);
        // console.log("Preparing to save data:", {weeklyTimetableData,});

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
            targetAttainment,
            feedbackData,
            facultyCourseReview,
            learnerCategories,
            selectedAssessments,
            par_sem_slowLearner,
          },
          {
            headers: {
              "x-auth-token": token,
              "ngrok-skip-browser-warning": "69420"
            }
          }
        );

        console.log("Server response:", response.data);
        window.location.reload();
      } catch (error) {
        console.error("Error submitting form data:", error);
        alert("Error saving data. Please check console for details.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-5 gap-[2rem] h-screen flex flex-col bg-[#FFFEFD]">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-xl">
        {/* Back button with enhanced hover effects */}
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-300 px-5 py-2.5 rounded-lg hover:bg-gray-100 relative overflow-hidden"
        >
          <span className="absolute inset-0 w-0 bg-gray-200 opacity-30 transition-all duration-300 group-hover:w-full"></span>
          <IoReturnUpBackSharp className="text-xl transform group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium relative z-10">Back to Files</span>
        </button>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Validation messages with improved visibility and animations */}
          {!isWeightageValid && (
            <span className="text-red-600 text-sm flex items-center bg-red-50 px-3 py-2 rounded-lg animate-pulse">
              <AlertCircle className="w-4 h-4 mr-2 animate-bounce" />
              <span>CO Assessment weightages must add up to 100%</span>
            </span>
          )}

          {!validateCriteria() && (
            <span className="text-red-600 text-sm flex items-center bg-red-50 px-3 py-2 rounded-lg animate-pulse">
              <AlertCircle className="w-4 h-4 mr-2 animate-bounce" />
              <span>CO Attainment Criteria fully attained must be greater than partially attained</span>
            </span>
          )}
          {!validateTargetAttainment() && (
            <span className="text-red-600 text-sm flex items-center bg-red-50 px-3 py-2 rounded-lg animate-pulse">
              <AlertCircle className="w-4 h-4 mr-2 animate-bounce" />
              <span>Target Attainment fully attained must be greater than or equal to partially attained</span>
            </span>
          )}

          {/* Submit button with enhanced interactive effects */}
          <button
            onClick={postData}
            className={`relative overflow-hidden transition-all duration-300 text-white font-semibold rounded-lg px-8 py-3.5
        ${isWeightageValid && validateCriteria() && validateTargetAttainment() && selectedProgram !== 0 && isCourseCodeValid
                ? "bg-[#FFB255] hover:bg-[#f5a543] shadow-md hover:shadow-lg transform hover:-translate-y-1"
                : "bg-gray-400 cursor-not-allowed opacity-75"
              }`}
            disabled={!isWeightageValid || !validateCriteria() || !validateTargetAttainment() || selectedProgram === 0 || !isCourseCodeValid}
          >
            <span className={`absolute inset-0 h-full w-full bg-white opacity-10 
        ${isWeightageValid && validateCriteria() && validateTargetAttainment() && selectedProgram !== 0 && isCourseCodeValid ? "animate-pulse-slow" : ""}`}>
            </span>

            <div className="flex items-center gap-2">
              <span className="relative z-10">Submit Form</span>
              {isWeightageValid && validateCriteria() && validateTargetAttainment() && selectedProgram !== 0 && isCourseCodeValid ? (
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v1" />
                </svg>
              )}
            </div>

            {/* Visual tooltip that appears on hover when button is disabled */}
            {(!isWeightageValid || !validateCriteria() || !validateTargetAttainment() || selectedProgram === 0 || !isCourseCodeValid) && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-gray-800 bg-opacity-90 text-white text-xs p-2 rounded-lg transition-opacity duration-300">
                {!isWeightageValid && "Fix weightage values"}
                {!validateCriteria() && "Fix attainment criteria"}
                {!validateTargetAttainment() && "Fix attainment criteria"}
                {selectedProgram === 0 && "Select a program"}
                {!isCourseCodeValid && "Enter a valid course code"}
              </div>
            )}
          </button>

          {/* Progress indicator for form completion status */}
          <div className="hidden md:flex items-center gap-1 ml-2">
            <div className={`h-2 w-2 rounded-full ${isWeightageValid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-2 rounded-full ${validateCriteria() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-2 rounded-full ${validateTargetAttainment() ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-2 rounded-full ${selectedProgram !== 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-2 rounded-full ${isCourseCodeValid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </div>

      <div className="space-y-6 overflow-scroll">
        <InstructionsCard />


        <div className="grid grid-cols-2 gap-4">
          {/* Program Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
                1
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Program</h2>
            </div>

            {/* Replace the original select with the SearchableDropdown */}
            <SearchableDropdown
              options={programOptions}
              value={selectedProgram}
              onChange={(value) => setSelectedProgram(value)}
            />
          </div>

          {/* Course Code Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
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
              onChange={(value) => setCourseCode(value)}
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
              onChange={(e) => setCourseTitle(e.target.value)}
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
              onChange={(e) => setModule(e.target.value)}
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
              onChange={(e) => setSession(e.target.value)}
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
            program={selectedProgram.toString()} // Pass the selected program directly
            onSave={handleCOPOMappingChange}
            initialData={copoMappingData}
            key={`copo-${selectedProgram}`} // Add a key that changes when program changes to force re-mount
          />
        </div>

        {/* Internal Assessments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              8
            </div>
            <h2 className="section-title text-xl font-semibold">
              Details of all Assessments, weightages and due dates
            </h2>
          </div>
          <InternalAssessmentTable
            onSave={handleInternalAssessmentChange}
            initialData={internalAssessmentData}
          />
        </div>

        {/* Excel to json to extract student data*/}
        <ExcelToJson
          onSave={handleStudentDataSave}
          initialData={studentData}
        />

        {/* CO Assessment weightage Section */}
        <COAssessmentWeightage
          copoMappingData={copoMappingData}
          studentData={studentData}
          initialWeightages={coWeightages}
          onChange={(weightages) => {
            setCoWeightages(weightages);
            // console.log('Updated weightages:', weightages);
          }}
          onValidationChange={(isValid) => setIsWeightageValid(isValid)}
        />

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              11
            </div>
            <h2 className="section-title text-xl font-semibold">
              Select Assessments for Partial Semester Slow Learner Analysis
            </h2>
          </div>
          <AssessmentSelection
            studentData={studentData}
            selectedAssessments={selectedAssessments}
            onChange={(selected) => setSelectedAssessments(selected)}
          />
        </div>

        <COAttainmentCriteria
          copoMappingData={copoMappingData}
          initialCriteria={coAttainmentCriteria}
          onSave={handleCoAttainmentCriteriaSave}
        />

        <TargetAttainment
          copoMappingData={copoMappingData}
          initialCriteria={targetAttainment}
          onSave={handleTargetAttainmentSave}
        />


        <COAttainmentAnalysis
          coWeightages={coWeightages}
          studentData={studentData}
          coAttainmentCriteria={coAttainmentCriteria}
          copoMappingData={copoMappingData}
          targetAttainment={targetAttainment}
        />

        <AdvanceAndWeakStudentIdentification
          coWeightages={coWeightages}
          studentData={studentData}
          coAttainmentCriteria={coAttainmentCriteria}
          learnerCategories={learnerCategories}
          onSave={handleLearners}
        />

        {/* Course Syllabus Section */}
        <CourseSyllabus
          onSave={handleCourseSyllabusChange}
          initialData={courseSyllabus}
        />

        {/* Learning Resources Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
              17
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

        {/* Weekly Time-Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              18
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Weekly Time-Table
            </h2>
          </div>
          <div className="p-4 rounded-lg">
            {selectedProgram === 6 || selectedProgram === 10 ? ( // 6 is Integrated BBA MBA
              <MBAWeeklyTimetable
                initialData={weeklyTimetableData}
                onChange={(newTimetable) => {
                  setWeeklyTimetableData(newTimetable);
                }}
              />
            ) : (
              <WeeklyTimetable
                initialData={weeklyTimetableData}
                onChange={(newTimetable) => {
                  setWeeklyTimetableData(newTimetable);
                }}
              />
            )}
          </div>
        </div>

        {/* Actions for Weak Students */}
        <ActionsForWeakStudents
          label="Actions Taken for Weak Students"
          initialData={actionsForWeakStudentsData}
          onSave={handleWeakStudentsChange}
        />
        {/* Add the component inside your return statement, where you want it to appear*/}
        <PDFUploader
          num={num}
          onUploadSuccess={(filename) => {
            // Handle successful upload
            console.log('File uploaded:', filename);
          }}
          onDeleteSuccess={() => {
            // Handle successful deletion
            console.log('File deleted');
          }}
          initialFileName={props.mergePDF} // Pass the initial filename if available
        />

        <FeedbackAndCorrectiveActions
          initialData={feedbackData}
          onSave={handleFeedbackChange}
        />

        {/* Faculty Course Review */}
        <FacultyCourseReview
          initialData={facultyCourseReview}
          onSave={(data) => setFacultyCourseReview(data)}
        />

        {/* Loading Spinner */}
        {isLoading && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default FeedbackForm;
