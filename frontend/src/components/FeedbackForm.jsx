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
import { Check, X,AlertCircle } from 'lucide-react';
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

  const [studentListData, setStudentListData] = useState([]);
  const [weakStudentsData, setWeakStudentsData] = useState([]);
  const [marksDetailsData, setMarksDetailsData] = useState([]);
  const [attendanceReportData, setAttendanceReportData] = useState([]);
  const [internalAssessmentData, setInternalAssessmentData] = useState({
    components: [],
  });
  const [actionsForWeakStudentsData, setActionsForWeakStudentsData] = useState([]);
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
    if (data && data.courseOutcomes && data.mappingData) {
      setCopoMappingData({
        courseOutcomes: data.courseOutcomes,
        mappingData: data.mappingData,
      });
    }
  };
  const handleStudentStatusChange = (uniqueId, newStatus) => {
    setWeakStudentsData((prevData) =>
      prevData.map((student) =>
        student.uniqueId === uniqueId
          ? { ...student, status: newStatus }
          : student
      )
    );
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

  /////////////////////////////////////////**Use Effect**//////////////////////////
  useEffect(() => {
    setCourseCode(props.coursecode || "");
  }, [props.coursecode]);

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

    // Identify weak students based on total marks less than a threshold (e.g., 50)
    const weakStudents = marksDetails.filter(
      (student) => student.totalMarks < 50
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

  const postData = async () => {
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
        <button
          onClick={postData}
          className="bg-[#FFB255] hover:bg-[#f5a543] transition-colors text-white font-semibold rounded-lg px-8 py-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          Submit Form
        </button>
      </div>
      <div className="space-y-6 overflow-scroll">
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
              className="w-full p-3 border border-gray-200 rounded-md transition-all resize-none text-gray-700"
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

        {/* Course Syllabus Section */}
        <CourseSyllabus
          onSave={handleCourseSyllabusChange}
          initialData={courseSyllabus}
        />

        {/* Learning Resources Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold shadow-sm">
              8
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
              9
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
            initialData={studentListData}
          />
        </div>

        {/* Internal Assessments */}
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

        {/* Identification of Weak Students */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
          13
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
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">No students identified yet</p>
            <p className="text-sm text-gray-500">Upload data to view students</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 px-4 py-2 bg-gray-50 rounded-t-lg border border-gray-100 font-medium text-gray-600">
              <div>Student ID</div>
              <div>Name</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Student Rows */}
            {weakStudentsData.map((student) => (
              <div
                key={student.uniqueId}
                className="grid grid-cols-3 gap-4 px-4 py-3 border border-gray-100 rounded-lg bg-white items-center"
              >
                <div className="text-gray-600">{student.uniqueId}</div>
                <div className="text-gray-800 font-medium">
                  {student.studentName}
                  <div className="text-sm text-gray-500">
                    Status: {student.status}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                      student.status === 'Accepted'
                        ? 'bg-[#FFB255] text-white cursor-not-allowed'
                        : 'bg-white border border-[#FFB255] text-[#FFB255]'
                    }`}
                    disabled={student.status === 'Accepted'}
                    onClick={() => handleStudentStatusChange(student.uniqueId, 'Accepted')}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </button>
                  <button
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm ${
                      student.status === 'Rejected'
                        ? 'bg-gray-600 text-white cursor-not-allowed'
                        : 'bg-white border border-gray-400 text-gray-600'
                    }`}
                    disabled={student.status === 'Rejected'}
                    onClick={() => handleStudentStatusChange(student.uniqueId, 'Rejected')}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </>
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
              15
            </div>
            <h2 className="section-title text-xl font-semibold">
              Assignments/Quiz/Internal Components/ Projects taken throughout
              semester
            </h2>
          </div>
          <PDFUploader />
        </div>

        {/* Marks Details */}
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
            initialData={marksDetailsData}
          />
        </div>

        {/* Attendance Report */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="section-number bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
              17
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

        {/* Loading Spinner */}
        {isLoading && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default FeedbackForm;
