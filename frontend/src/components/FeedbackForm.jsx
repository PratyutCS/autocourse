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
    referenceLinks: props.learningResources?.referenceLinks || []
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
    setLearningResources(prevState => ({
      ...prevState,
      [fieldType]: updatedFields
    }));
  };
  

  const handleactionsForWeakStudentsDataChange = (data) => {
    setActionsForWeakStudentsData(data);
  };

  const postData = async () => {
    if (num !== undefined) {
      try {
        // Log the data being sent for debugging
        console.log("Sending data:", {
          internalAssessmentData,
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
          },
          {
            headers: { "x-auth-token": token },
          }
        );

        console.log("Server response:", response.data);

        // Add success notification
        alert("Data saved successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error submitting form data:", error);
        // Add error notification
        alert("Error saving data. Please check console for details.");
      }
    }
  };
  return (
    <div className="feedback-form1">
      <div className="sb">
        <button onClick={() => window.history.back()} className="back-button">
          {" "}
          <IoReturnUpBackSharp />
          Back to Files
        </button>
        <div className="sbt-btn">
          <button
            onClick={postData}
            className="btn bg-blue-500 text-white rounded-md px-6 py-2 mx-auto block"
          >
            SUBMIT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Program Section */}
        <div className="form-section">
          <div className="flex items-center mb-2">
            <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              0
            </div>
            <h2 className="section-title text-xl font-semibold">Program</h2>
          </div>
          <div className="reflection-textarea w-full h-16 p-2 border border-gray-300 rounded">
            <textarea
              className="w-full h-full p-2 border-none outline-none resize-none text-gray-800"
              placeholder="Enter course code here..."
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            ></textarea>
          </div>
        </div>
        {/* Course Code Section */}
        <div className="form-section">
          <div className="flex items-center mb-2">
            <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              1
            </div>
            <h2 className="section-title text-xl font-semibold">Course Code</h2>
          </div>
          <div className="reflection-textarea w-full h-16 p-2 border border-gray-300 rounded">
            <textarea
              className="w-full h-full p-2 border-none outline-none resize-none text-gray-800"
              placeholder="Enter course code here..."
              value={coursecode}
              onChange={(e) => setCourseCode(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Course Title Section */}
        <div className="form-section">
          <div className="flex items-center mb-2">
            <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              2
            </div>
            <h2 className="section-title text-xl font-semibold">
              Course Title
            </h2>
          </div>
          <div className="reflection-textarea w-full h-16 p-2 border border-gray-300 rounded">
            <textarea
              className="w-full h-full p-2 border-none outline-none resize-none text-gray-800"
              placeholder="Enter course title here..."
              value={coursetitle}
              onChange={(e) => setCourseTitle(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Module/Semester Section */}
        <div className="form-section">
          <div className="flex items-center mb-2">
            <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              3
            </div>
            <h2 className="section-title text-xl font-semibold">
              Module/Semester
            </h2>
          </div>
          <div className="reflection-textarea w-full h-16 p-2 border border-gray-300 rounded">
            <textarea
              className="w-full h-full p-2 border-none outline-none resize-none text-gray-800"
              placeholder="Enter module/semester here..."
              value={module}
              onChange={(e) => setModule(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Session Section */}
        <div className="form-section">
          <div className="flex items-center mb-2">
            <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              4
            </div>
            <h2 className="section-title text-xl font-semibold">Session</h2>
          </div>
          <div className="reflection-textarea w-full h-16 p-2 border border-gray-300 rounded">
            <textarea
              className="w-full h-full p-2 border-none outline-none resize-none text-gray-800"
              placeholder="Enter session here..."
              value={session}
              onChange={(e) => setSession(e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            5
          </div>
          <h2 className="section-title text-xl font-semibold">
            Course Description and its objectives
          </h2>
        </div>
        <EditableCourseDescription
          courseDescription={EditableCourseDescriptionData}
          onChange={EditableCourseDescriptionDataChange}
        />
      </div>

      <div className="form-section f2">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            6
          </div>
          <h2 className="section-title text-xl font-semibold">
            Course Outcomes and CO-PO Mapping
          </h2>
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
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            8
          </div>
          <h2 className="section-title text-xl font-semibold">
            Learning Resources
          </h2>
        </div>
        <AddField 
  label="Text Book"
  initialData={learningResources.textBooks}
  onChange={(updatedFields) => 
    handleLearningResourcesChange(updatedFields, 'textBooks')
  }
/>
<AddField 
  label="Reference Link"
  initialData={learningResources.referenceLinks}
  onChange={(updatedFields) => 
    handleLearningResourcesChange(updatedFields, 'referenceLinks')
  }
/>
      </div>

      <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            9
          </div>
          <h2 className="section-title text-xl font-semibold">
            Weekly Time-Table
          </h2>
        </div>
        <ExcelUploader />
      </div>

      <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            10
          </div>
          <h2 className="section-title text-xl font-semibold">
            Registered Student List
          </h2>
        </div>
        <ExcelUploader />
      </div>

      <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
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

      <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            12
          </div>
          <h2 className="section-title text-xl font-semibold">
            Sample Evaluated Internal Submissions and Mid Semester Question
            papers with sample solutions
          </h2>
        </div>
        <PDFUploader />
      </div>

      <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            13
          </div>
          <h2 className="section-title text-xl font-semibold">
            Identification of weak students
          </h2>
        </div>
        <ExcelUploader />
      </div>

      <ActionsForWeakStudents
        onSave={handleactionsForWeakStudentsDataChange}
        initialData={actionsForWeakStudentsData}
      />

      {/* <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
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

      <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            15
          </div>
          <h2 className="section-title text-xl font-semibold">
            Assignments/Quiz/Internal Components/ Projects taken throughout
            semester
          </h2>
        </div>
        <ExcelUploader />
      </div>

      <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            16
          </div>
          <h2 className="section-title text-xl font-semibold">
            Detail of Marks in all components up to the End Semester
          </h2>
        </div>
        <ExcelUploader />
      </div>
      <div className="form-section">
        <div className="flex items-center mb-2">
          <div className="section-number bg-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
            17
          </div>
          <h2 className="section-title text-xl font-semibold">
            {" "}
            Attendance Report
          </h2>
        </div>
        <ExcelUploader />
      </div>
      <div className="sb">
        <button onClick={() => window.history.back()} className="back-button">
          {" "}
          <IoReturnUpBackSharp />
          Back to Files
        </button>
        <div className="sbt-btn">
          <button
            onClick={postData}
            className="btn bg-blue-500 text-white rounded-md px-6 py-2 mx-auto block"
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
