import { useState, useEffect } from "react";
import constants from "../constants";
import axios from "axios";
import LoadingSpinner from "./LoadingSpinner";
import "../css/feedback.css";
import { IoReturnUpBackSharp } from "react-icons/io5";
import COPOMapping from "./COPOMapping";
import InternalAssessmentTable from "./InternalAssessmentTable";
import ActionsForWeakStudents from "./ActionsForWeakStudents";
import ExcelUploader from "./ExcelUploader";
import EditableCourseDescription from "./EditableCourseDescription";
import CourseSyllabus from "./CourseSyllabus";
import AddField from "./AddFiled";
import WeeklyTimetable from "./WeeklyTimetable";
import PDFUploader from "./PDFUploader";
import { Check, X, AlertCircle } from "lucide-react";
import COAttainmentAnalysis from "./COAttainmentAnalysis";
import COAssessmentWeightage from "./COAssessmentWeightage";
import COAttainmentCriteria from './COAttainmentCriteria';
const FeedbackForm = (props) => {
  const token = localStorage.getItem("token");

  const [aqis, setaqis] = useState(props.aqis || "")


  useEffect(() => {
    setaqis(props.aqis || "");
    console.log("aqis lol", aqis);
  }, [props.aqis]);

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
    tableMode: 'manual',
    imagePath: null,
    imageFileName: null
  });


  const [studentListData, setStudentListData] = useState([]);
  const [weakStudentsData, setWeakStudentsData] = useState([]);
  const [marksDetailsData, setMarksDetailsData] = useState([]);
  const [attendanceReportData, setAttendanceReportData] = useState([]);
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
  // const saveToBackend = async (data) => {
  //   try {
  //     const response = await fetch('http://localhost:3000/upload-image', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'x-auth-token': localStorage.getItem('token')
  //       },
  //       body: JSON.stringify({
  //         courseOutcomes: data.courseOutcomes,
  //         mappingData: data.mappingData,
  //         tableMode: data.tableMode,
  //         imagePath: data.imagePath,
  //         imageFileName: data.imageFileName
  //       })
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to save data');
  //     }

  //     const result = await response.json();
  //     console.log('Data saved successfully:', result);
  //   } catch (error) {
  //     console.error('Error saving data:', error);
  //     // Handle error appropriately
  //   }
  // };


  const handleCOPOMappingChange = (data) => {
    const newData = { ...copoMappingData };

    if (data.tableMode) {
      newData.tableMode = data.tableMode;
    }

    if (data.courseOutcomes) {
      newData.courseOutcomes = data.courseOutcomes;
    }

    if (data.mappingData) {
      if (data.tableMode === 'image' && data.imagePath) {
        newData.imagePath = data.imagePath;
        newData.imageFileName = data.imageFileName;
        newData.mappingData = data.mappingData;
        // Clear manual mapping data when switching to image mode
        // newData.mappingData = {};
      } else {
        newData.mappingData = data.mappingData;
      }
    }

    setCopoMappingData(newData);

    // Save to backend
    // saveToBackend(newData);
  };

  const handleStudentStatusChange = async (uniqueId, newStatus) => {
    // Update local state
    setWeakStudentsData((prevData) =>
      prevData.map((student) =>
        student.uniqueId === uniqueId
          ? { ...student, status: newStatus }
          : student
      )
    );

    // If status is Accepted, save to backend
    if (newStatus === "Accepted") {
      try {
        const studentToSave = weakStudentsData.find(
          (student) => student.uniqueId === uniqueId
        );

        // Make API call to save the student data
        await saveWeakStudent(studentToSave);
      } catch (error) {
        console.error("Error saving student data:", error);
        // Optionally add error handling UI feedback
      }
    }
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

  const handleCoAttainmentCriteriaSave = (criteria) => {
    setCoAttainmentCriteria(criteria);
  };
  /////////////////////////////////////////**Use Effect**//////////////////////////

  useEffect(() => {
    setCoAttainmentCriteria(props.coAttainmentCriteria || "");
  }, [props.coAttainmentCriteria]);

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
    setStudentListData(props.studentListData || []);
  }, [props.studentListData]);

  useEffect(() => {
    const weakStudents =
      props.weakStudentsData?.map((student) => ({
        ...student,
        status: student.status || "Pending",
      })) || [];
    setWeakStudentsData(weakStudents);
  }, [props.weakStudentsData]);

  useEffect(() => {
    setMarksDetailsData(props.marksDetailsData || []);
  }, [props.marksDetailsData]);

  useEffect(() => {
    setAttendanceReportData(props.attendanceReportData || []);
  }, [props.attendanceReportData]);

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

  const [uploadedFiles, setUploadedFiles] = useState({
    studentList: props.studentList || null,
    weakstudent: props.weakstudent || null,
    assignmentsTaken: props.assignmentsTaken || null,
    marksDetails: props.marksDetails || null,
    attendanceReport: props.attendanceReport || null,
  });

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
  const [selectedProgram, setSelectedProgram] = useState('');

  const handleFileChange = (fileData, identifier) => {
    console.log("Handling file change:", identifier, fileData);

    const { content } = fileData;

    // Check if content is valid
    if (!content || !Array.isArray(content)) {
      console.error("Invalid file content");
      return;
    }

    // Common data extraction
    const studentList = content.map((row) => ({
      uniqueId: row["Unique Id"] || row["uniqueId"] || row["ID"],
      studentName: row["Student Name"] || row["studentName"] || row["Name"],
    }));

    const marksDetails = content.map((row) => ({
      uniqueId: row["Unique Id"],
      studentName: row["Student Name"],
      totalMarks: parseFloat(row["Total Marks"]),
      grade: row["Grade"],
      // Add other relevant fields
    }));

    const attendanceReport = content.map((row) => ({
      uniqueId: row["Unique Id"],
      studentName: row["Student Name"],
      attendance: parseFloat(row["Attendance"]),
    }));

    const weakStudents = marksDetails.filter(
      (student) => student.totalMarks < 90
    );

    setStudentListData(studentList);
    setMarksDetailsData(marksDetails);
    setAttendanceReportData(attendanceReport);
    setWeakStudentsData(weakStudents);
    setUploadedFiles((prev) => ({
      ...prev,
      [identifier]: fileData,
    }));
  };
  const saveWeakStudent = async (studentData) => {
    const response = await fetch("/api/save-weak-student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error("Failed to save student data");
    }

    return await response.json();
  };
  const removeRejectedStudents = () => {
    setWeakStudentsData((prevData) =>
      prevData.filter((student) => student.status !== "Rejected")
    );

  };
  const programOptions = ['CSE', 'ME', 'ECOM', 'ECT'];

  const validateCriteria = () => {
    return Object.keys(coAttainmentCriteria).every(co => {
      const { full, partial } = coAttainmentCriteria[co];
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
    if (num !== undefined) {
      try {
        setIsLoading(true);
        console.log("Preparing to save data:", {
          weeklyTimetableData,
          // other data...
        });

        const response = await axios.post(
          constants.url + "/form",
          {
            program,
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
            uploadedFiles,
            weeklyTimetableData,
            studentListData,
            weakStudentsData,
            marksDetailsData,
            attendanceReportData,
            coWeightages,
            coAttainmentCriteria,
          },
          {
            headers: { "x-auth-token": token },
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
      <div className="bg-white rounded-xl shadow-md p-5 flex justify-between items-center">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          <IoReturnUpBackSharp className="text-xl" />
          <span className="font-medium">Back to Files</span>
        </button>
        <div className="flex items-center gap-4">
          {!isWeightageValid && (
            <span className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              CO Assessment weightages must add up to 100%
            </span>
          )}
          {!validateCriteria() && (
            <span className="text-red-600 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              CO Attainment Criteria fully attained must be greater than partially attained
            </span>
          )}
          <button
            onClick={postData}
            className={`${isWeightageValid && validateCriteria()
              ? "bg-[#FFB255] hover:bg-[#f5a543]"
              : "bg-gray-400 cursor-not-allowed"
              } transition-colors text-white font-semibold rounded-lg px-8 py-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5`}
            disabled={!isWeightageValid || !validateCriteria()}
          >
            Submit Form
          </button>
        </div>
      </div>




      <div className="space-y-6 overflow-scroll">
        <div className="bg-white rounded-xl shadow-md p-6 border-t border-r border-b border-l-4 border-[#FFB255] ">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-[#FFB255]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Important Instructions
              </h3>
              <div className="space-y-2 text-gray-600">
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-[#FFB255] rounded-full mr-2"></span>
                  All fields in this form are editable and can be modified as needed.
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-[#FFB255] rounded-full mr-2"></span>
                  The initial data has been automatically extracted from your course handout using AI.
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-[#FFB255] rounded-full mr-2"></span>
                  Please review all information carefully as AI-extracted data may not be 100% accurate.
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-[#FFB255] rounded-full mr-2"></span>
                  You can save your progress at any time using the Submit Form button.
                </p>
              </div>
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm text-orange-700">
                  <span className="font-semibold">Pro Tip:</span> Take your time to verify each section, especially numerical data and dates, before final submission.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Program Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
                1
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Program</h2>
            </div>
            {/* Textarea for Program Details */}
            <textarea
              className="w-full p-3 border border-gray-200 rounded-md transition-all resize-none text-gray-700 mb-4"
              placeholder="Enter program details here..."
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              rows="2"
            />
            {/* Radio Button Section */}
            <div>
              <p className="mb-2 text-gray-700 font-medium">Select Program Option:</p>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="" disabled>Select a program</option>
                {programOptions.map((programOption) => (
                  <option key={programOption} value={programOption}>
                    {programOption}
                  </option>
                ))}
              </select>
            </div>
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
            <textarea
              className="w-full p-3 border border-gray-200 rounded-md transition-all resize-none text-gray-700"
              placeholder="Enter course code here..."
              value={coursecode}
              onChange={(e) => setCourseCode(e.target.value)}
              rows="2"
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
            onSave={handleCOPOMappingChange}
            initialData={copoMappingData}
          />
        </div>

        {/* Internal Assessments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              8
            </div>
            <h2 className="section-title text-xl font-semibold">
              Details of all Assessments; weightages, due dates
            </h2>
          </div>
          <InternalAssessmentTable
            onSave={handleInternalAssessmentChange}
            initialData={internalAssessmentData}
          />
        </div>

        {/* CO Assessment weightage Section */}
        <COAssessmentWeightage
          copoMappingData={copoMappingData}
          internalAssessmentData={internalAssessmentData}
          initialWeightages={coWeightages}
          onChange={(weightages) => {
            setCoWeightages(weightages);
            console.log('Updated weightages:', weightages);
          }}
          onValidationChange={(isValid) => setIsWeightageValid(isValid)}
        />

        <COAttainmentCriteria
          copoMappingData={copoMappingData}
          initialCriteria={coAttainmentCriteria}
          onSave={handleCoAttainmentCriteriaSave}
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
              12
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
              13
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Weekly Time-Table
            </h2>
          </div>
          <div className="p-4 rounded-lg">
            <WeeklyTimetable
              initialData={weeklyTimetableData}
              onChange={(newTimetable) => {
                setWeeklyTimetableData(newTimetable);
              }}
            />
          </div>
        </div>

        {/* Registered Student List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              14
            </div>
            <h2 className="section-title text-xl font-semibold">
              Registered Student List
            </h2>
          </div>
          <ExcelUploader
            title="Student List"
            identifier="studentList"
            onFileChange={handleFileChange}
            initialData={studentListData}
          />
        </div>

        {/* Identification of Weak Students */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
              15
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Identification of Weak Students
            </h2>
          </div>

          {/* File Upload Section */}

          <ExcelUploader
            title="Weak Student List"
            identifier="weakStudentsData"
            onFileChange={handleFileChange}
            initialData={weakStudentsData}
          />

          {/* Students List */}
          <div className="space-y-4">
            {!weakStudentsData || weakStudentsData.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-100">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold text-lg">
                  No students identified yet
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Upload an Excel file to view and manage students
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Student List
                  </h3>

                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  {/* Table Header */}
                  <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 font-medium text-gray-600 border-b">
                    <div>Student ID</div>
                    <div>Name</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {/* Student Rows */}
                  {weakStudentsData.map((student) => (
                    <div
                      key={student.uniqueId}
                      className="grid grid-cols-3 gap-4 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-gray-600 self-center">
                        {student.uniqueId}
                      </div>
                      <div>
                        <div className="text-gray-800 font-medium">
                          {student.studentName}
                        </div>
                        <div className={`text-sm font-medium ${student.status === 'Accepted'
                          ? 'text-green-600'
                          : student.status === 'Rejected'
                            ? 'text-red-600'
                            : 'text-gray-500'
                          }`}>
                          Status: {student.status}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${student.status === "Accepted"
                            ? "bg-[#FFB255] text-white cursor-not-allowed"
                            : "bg-white border border-[#FFB255] text-[#FFB255]"
                            }`}
                          disabled={student.status === "Accepted"}
                          onClick={() =>
                            handleStudentStatusChange(
                              student.uniqueId,
                              "Accepted"
                            )
                          }
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </button>
                        <button
                          className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${student.status === "Rejected"
                            ? "bg-gray-600 text-white cursor-not-allowed"
                            : "bg-white border border-gray-400 text-gray-600"
                            }`}
                          disabled={student.status === "Rejected"}
                          onClick={() =>
                            handleStudentStatusChange(
                              student.uniqueId,
                              "Rejected"
                            )
                          }
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}

                </div>
                <button
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={removeRejectedStudents}
                >
                  Remove Rejected Students
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions for Weak Students */}
        <ActionsForWeakStudents
          label="Actions Taken for Weak Students"
          initialData={actionsForWeakStudentsData}
          onSave={handleWeakStudentsChange}
        />

        {/* Assignments Taken */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              17
            </div>
            <h2 className="section-title text-xl font-semibold">
              Assignments/Quiz/Internal Components/ Projects taken throughout
              semester
            </h2>
          </div>
          <PDFUploader num={num} aqis={aqis} />
        </div>



        {/* Marks Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              18
            </div>
            <h2 className="section-title text-xl font-semibold">
              Detail of Marks in all components up to the End Semester
            </h2>
          </div>
          <ExcelUploader
            title="Marks Details"
            identifier="marksDetails"
            onFileChange={handleFileChange}
            initialData={marksDetailsData}
          />
        </div>

        {/* Attendance Report */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              19
            </div>
            <h2 className="section-title text-xl font-semibold">
              Attendance Report
            </h2>
          </div>
          <ExcelUploader
            title="Attendance Report"
            identifier="attendanceReport"
            onFileChange={handleFileChange}
            initialData={attendanceReportData}
          />
        </div>
        <COAttainmentAnalysis />
        <div className="bg-white p-7 rounded-2xl  border border-gray-100 mt-8  transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-9 h-9 flex items-center justify-center mr-2 shadow-sm transform hover:scale-105 transition-transform duration-200">
              20
            </div>

            <h2 className="section-title text-xl font-semibold text-gray-800">
              Feedback (class committee or otherwise) and
              corrective actions (if any)
            </h2>
          </div>

          <div className="w-full flex flex-row gap-6 items-center">
            <label className="text-gray-700 font-medium">Quantitative feedback:</label>
            <textarea
              className="w-20 p-3 border border-gray-200 rounded-lg transition-all resize-none text-gray-700 focus:ring-2 focus:ring-[#FFB255]/20 focus:border-[#FFB255] outline-none"
              placeholder="Rating..."
              value={undefined}
              rows="1"
            />
          </div>

          <textarea
            className="mt-4 w-full p-4 border border-gray-200 rounded-lg transition-all duration-200 resize-none text-gray-700 focus:ring-2 focus:ring-[#FFB255]/20 focus:border-[#FFB255] outline-none"
            placeholder="Enter the feedback here..."
            value={undefined}
            rows="2"
          />
        </div>
        <div className="bg-white p-7 rounded-2xl shadow-md border border-gray-100 mt-8 hover:shadow-lg transition-all duration-300" >
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-9 h-9 flex items-center justify-center mr-2 shadow-sm transform hover:scale-105 transition-transform duration-200">
              21
            </div>
            <h2 className="section-title text-xl font-semibold text-gray-800">
              Faculty Course Review
            </h2>
          </div>
          <textarea
            className="w-full p-4 border border-gray-200 rounded-lg transition-all duration-200 resize-none text-gray-700 focus:ring-2 focus:ring-[#FFB255]/20 focus:border-[#FFB255] outline-none"
            placeholder="Enter course review here...."
            value={undefined}
            rows="2"
          />
        </div>

        {/* Loading Spinner */}
        {isLoading && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default FeedbackForm;
