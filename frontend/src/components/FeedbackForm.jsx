import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import constants from "../constants";
import axios from "axios";
import "../css/feedback.css";
import { IoReturnUpBackSharp } from "react-icons/io5";
import COPOMapping from "./COPOMapping";
import InternalAssessmentTable from "./InternalAssessmentTable";
import PDFUploader from "./PDFUploader";
import ActionsForWeakStudents from "./ActionsForWeakStudents";
import ExcelUploader from "./ExcelUploader";
import EditableCourseDescription from "./EditableCourseDescription";
import CourseSyllabus from "./CourseSyllabus";
import AddField from "./AddFiled";

const FeedbackForm = (props) => {
  const token = localStorage.getItem("token");
  let num = props.num;
  const [coursecode, setCourseCode] = useState(props.coursecode || "");
  const [coursetitle, setCourseTitle] = useState(props.coursetitle || "");
  const [courseSyllabus, setCourseSyllabus] = useState(
    props.courseSyllabus || ""
  );
  const [learningResources, setLearningResources] = useState({
    textBooks: props.learningResources?.textBooks || [],
    referenceLinks: props.learningResources?.referenceLinks || [],
  });

  const [module, setModule] = useState(props.module || "");
  const [session, setSession] = useState(props.session || "");
  const [program, setProgram] = useState(props.program || "");
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [EditableCourseDescriptionData, setEditableCourseDescriptionData] =
    useState(props.courseDescription || "");
  const [copoMappingData, setCopoMappingData] = useState(
    props.copoMappingData || {
      courseOutcomes: {},
      mappingData: {},
    }
  );
  const [internalAssessmentData, setInternalAssessmentData] = useState(
    props.internalAssessmentData || {
      components: [],
    }
  );
  const [actionsForWeakStudentsData, setActionsForWeakStudentsData] = useState(
    props.actionsForWeakStudentsData || ""
  );

  const EditableCourseDescriptionDataChange = (data) => {
    setEditableCourseDescriptionData(data);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFile(file);

    if (file.type === "text/csv") {
      Papa.parse(file, {
        complete: (result) => {
          setFileContent(result.data);
        },
        header: true,
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setFileContent(json);
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  const handleCOPOMappingChange = (data) => {
    if (data && data.courseOutcomes && data.mappingData) {
      setCopoMappingData({
        courseOutcomes: data.courseOutcomes,
        mappingData: data.mappingData,
      });
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
  // here
  const [uploadedFiles, setUploadedFiles] = useState({
    weeklyTimetable: props.weeklyTimetable || null,
    studentList: props.studentList || null,
    weakstudent:props.weakstudent ||null,
    assignmentsTaken:props.assignmentsTaken || null,
    marksDetails : props.marksDetails || null,
    attendanceReport: props.attendanceReport || null,
  });
  
  const handleactionsForWeakStudentsDataChange = (data) => {
    setActionsForWeakStudentsData(data);
  };

  const handleFileChange = (identifier, fileData) => {
    setUploadedFiles((prev) => {
        const updatedFiles = { ...prev, [identifier]: fileData };
        console.log("Updated uploadedFiles:", updatedFiles);
        return updatedFiles;
    });
};

  const postData = async () => {
    if (num !== undefined) {
      try {
        console.log("Sending data:", {
          internalAssessmentData,
          uploadedFiles, // Include the uploaded files data
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
            copoMappingData: {
              courseOutcomes: copoMappingData.courseOutcomes,
              mappingData: copoMappingData.mappingData,
            },
            internalAssessmentData: {
              components: internalAssessmentData.components,
            },
            actionsForWeakStudentsData,
            uploadedFiles,
          },
          {
            headers: { "x-auth-token": token },
          }
        );
        
        console.log("Server response:", response.data);
        alert("Data saved successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error submitting form data:", error);
        alert("Error saving data. Please check console for details.");
      }
    }
  };
  
  return (
    <div className="feedback-form1 bg-[#FFFEFD] min-h-screen">
           <div className="mb-8 flex justify-between items-center bg-white rounded-xl shadow-md p-5">
        <button 
          onClick={() => window.history.back()} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          <IoReturnUpBackSharp className="text-xl" />
          <span className="font-medium">Back to Files</span>
        </button>
        <button
          onClick={postData}
          className="bg-[#FFB255] hover:bg-[#f5a543] transition-colors text-white font-semibold rounded-lg px-8 py-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          Submit Form
        </button>
      </div>
      <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Program Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
                1
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Program</h2>
            </div>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-md focus:none  transition-all resize-none text-gray-700"
              placeholder="Enter program details here..."
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              rows="2"
            />
          </div>
        {/* Course Code Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
                2
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Course Code</h2>
            </div>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#FFB255] focus:border-transparent transition-all resize-none text-gray-700"
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
              <h2 className="text-xl font-semibold text-gray-800">Course Title</h2>
            </div>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#FFB255] focus:border-transparent transition-all resize-none text-gray-700"
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
              <h2 className="text-xl font-semibold text-gray-800">Module/Semester</h2>
            </div>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#FFB255] focus:border-transparent transition-all resize-none text-gray-700"
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
              className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#FFB255] focus:border-transparent transition-all resize-none text-gray-700"
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
            <h2 className="text-xl font-semibold text-gray-800">Course Description and its objectives</h2>
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
            <h2 className="text-xl font-semibold text-gray-800">Course Outcomes and CO-PO Mapping</h2>
          </div>
          <COPOMapping
            onSave={handleCOPOMappingChange}
            initialData={copoMappingData}
          />
        </div>

      <div className="form-section">
        {/* Course Syllabus Section */}
        <CourseSyllabus />

        {/* Learning Resources Section */}
      
      </div>
      {/* Learning Resources Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
              8
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Learning Resources</h2>
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
              9
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Weekly Time-Table</h2>
        </div>
        <div className=" p-4 rounded-lg">
        <ExcelUploader 
      title="Weekly Time-Table"
      identifier="weeklyTimetable"
      onFileChange={handleFileChange}
      initialData={uploadedFiles.weeklyTimetable}
    />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            10
          </div>
          <h2 className="section-title text-xl font-semibold">
            Registered Student List
          </h2>
        </div>
        <ExcelUploader 
      title="Student List"
      identifier="studentList"
      onFileChange={handleFileChange}
      initialData={uploadedFiles.studentList}
    />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            11
          </div>
          <h2 className="section-title text-xl font-semibold">
            Details of Internal Assessments; weightages, due dates
          </h2>
        </div>
        <InternalAssessmentTable
          onSave={handleInternalAssessmentChange}
          initialData={internalAssessmentData}
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            12
          </div>
          <h2 className="section-title text-xl font-semibold">
            Sample Evaluated Internal Submissions and Mid Semester Question
            papers with sample solutions
          </h2>
        </div>
        <PDFUploader />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            13
          </div>
          <h2 className="section-title text-xl font-semibold">
            Identification of weak students
          </h2>
        </div>
        <ExcelUploader 
      title="Weak Students"
      identifier="weakstudent"
      onFileChange={handleFileChange}
      initialData={uploadedFiles.weakstudent}
    />
      </div>

      <ActionsForWeakStudents
        onSave={handleactionsForWeakStudentsDataChange}
        initialData={actionsForWeakStudentsData}
      />

      {/* <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            16
          </div>
          <h2 className="section-title text-xl font-semibold">
            Reflections on Mid-term Feedback & Actions Taken
          </h2>
        </div>
        <textarea
          placeholder="Enter reflections on mid-term feedback, actions taken to improve student learning, and strategies to enhance teaching..."
          className="reflection-textarea w-full h-32 p-2 border border-gray-300 rounded"
          value={reflections}
          onChange={(e) => setReflections(e.target.value)}
        />
      </div> */}

<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
<div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            15
          </div>
          <h2 className="section-title text-xl font-semibold">
            Assignments/Quiz/Internal Components/ Projects taken throughout
            semester
          </h2>
        </div>
        <ExcelUploader 
      title="Assingments"
      identifier="assignmentsTaken"
      onFileChange={handleFileChange}
      initialData={uploadedFiles.assignmentsTaken}
    />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            16
          </div>
          <h2 className="section-title text-xl font-semibold">
            Detail of Marks in all components up to the End Semester
          </h2>
        </div>
        <ExcelUploader 
      title="Marks Details"
      identifier="marksDetails"
      onFileChange={handleFileChange}
      initialData={uploadedFiles.marksDetails}
    />
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            17
          </div>
          <h2 className="section-title text-xl font-semibold">
            {" "}
            Attendance Report
          </h2>
        </div>
        <ExcelUploader 
      title="Attendance Report"
      identifier="attendanceReport"
      onFileChange={handleFileChange}
      initialData={uploadedFiles.attendanceReport}
    />
      </div>
     {/* Footer Section */}
     <div className="mt-8 flex justify-between items-center bg-white rounded-xl shadow-md p-5">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            <IoReturnUpBackSharp className="text-xl" />
            <span className="font-medium">Back to Files</span>
          </button>
          <button
            onClick={postData}
            className="bg-[#FFB255] hover:bg-[#f5a543] transition-colors text-white font-semibold rounded-lg px-8 py-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Submit Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
