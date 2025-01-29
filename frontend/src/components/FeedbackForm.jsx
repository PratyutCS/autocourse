import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import { IoReturnUpBackSharp } from "react-icons/io5";
import { Check, X, AlertCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import COPOMapping from "./COPOMapping";
import InternalAssessmentTable from "./InternalAssessmentTable";
import ActionsForWeakStudents from "./ActionsForWeakStudents";
import ExcelUploader from "./ExcelUploader";
import EditableCourseDescription from "./EditableCourseDescription";
import CourseSyllabus from "./CourseSyllabus";
import AddField from "./AddFiled";
import WeeklyTimetable from "./WeeklyTimetable";
import PDFUploader from "./PDFUploader";
import COAttainmentAnalysis from "./COAttainmentAnalysis";
import COAssessmentWeightage from "./COAssessmentWeightage";
import COAttainmentCriteria from './COAttainmentCriteria';
import constants from "../constants";
import "../css/feedback.css";

const SectionWrapper = ({ number, title, children, className = "" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}>
    <div className="flex items-center gap-4 mb-6">
      <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
        {number}
      </div>
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

const FeedbackForm  = forwardRef((props, ref) => {
  const token = localStorage.getItem("token");
  const [aqis, setAqis] = useState(props.aqis || "");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    coursecode: props.coursecode || "",
    coursetitle: props.coursetitle || "",
    module: props.module || "",
    session: props.session || "",
    program: props.program || "",
    courseSyllabus: props.courseSyllabus || [{
      srNo: 1,
      content: "",
      co: "",
      sessions: "",
    }],
    learningResources: {
      textBooks: props.learningResources?.textBooks || [],
      referenceLinks: props.learningResources?.referenceLinks || [],
    },
    EditableCourseDescriptionData: props.courseDescription || "",
    copoMappingData: props.copoMappingData || {
      courseOutcomes: {},
      mappingData: {},
      tableMode: 'manual',
      imagePath: null,
      imageFileName: null
    },
    studentListData: props.studentListData || [],
    weakStudentsData: props.weakStudentsData?.map(student => ({
      ...student,
      status: student.status || "Pending"
    })) || [],
    marksDetailsData: props.marksDetailsData || [],
    attendanceReportData: props.attendanceReportData || [],
    internalAssessmentData: props.internalAssessmentData || { components: [] },
    actionsForWeakStudentsData: props.actionsForWeakStudentsData || [],
    weeklyTimetableData: props.weeklyTimetableData || null,
    uploadedFiles: {
      studentList: props.studentList || null,
      weakstudent: props.weakstudent || null,
      assignmentsTaken: props.assignmentsTaken || null,
      marksDetails: props.marksDetails || null,
      attendanceReport: props.attendanceReport || null,
    },
    coWeightages: props.coWeightages || {},
    coAttainmentCriteria: props.coAttainmentCriteria || {},
  });

  const [isWeightageValid, setIsWeightageValid] = useState(false);
  const programOptions = ['CSE', 'ME', 'ECOM', 'ECT'];
  useImperativeHandle(ref, () => ({
    validateForm: () => {
      const isValid = isWeightageValid && validateCriteria();
      props.onValidationChange({
        isValid,
        message: !isWeightageValid 
          ? "CO weightages must total 100%" 
          : "CO criteria needs adjustment"
      });
      return isValid;
    },
    submitForm: handleSubmit
  }));

  useEffect(() => {
    setAqis(props.aqis || "");
  }, [props.aqis]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCOPOMappingChange = (data) => {
    setFormData(prev => ({
      ...prev,
      copoMappingData: {
        ...prev.copoMappingData,
        ...data,
        courseOutcomes: data.courseOutcomes || prev.copoMappingData.courseOutcomes,
        mappingData: data.mappingData || prev.copoMappingData.mappingData,
        tableMode: data.tableMode || prev.copoMappingData.tableMode,
        imagePath: data.imagePath || prev.copoMappingData.imagePath
      }
    }));
  };

  const handleFileChange = (fileData, identifier) => {
    const { content } = fileData;
    if (!content || !Array.isArray(content)) return;

    const studentList = content.map(row => ({
      uniqueId: row["Unique Id"] || row["uniqueId"] || row["ID"],
      studentName: row["Student Name"] || row["studentName"] || row["Name"],
    }));

    const marksDetails = content.map(row => ({
      uniqueId: row["Unique Id"],
      studentName: row["Student Name"],
      totalMarks: parseFloat(row["Total Marks"]),
      grade: row["Grade"],
    }));

    const attendanceReport = content.map(row => ({
      uniqueId: row["Unique Id"],
      studentName: row["Student Name"],
      attendance: parseFloat(row["Attendance"]),
    }));

    const weakStudents = marksDetails.filter(student => student.totalMarks < 90);

    setFormData(prev => ({
      ...prev,
      studentListData: studentList,
      marksDetailsData: marksDetails,
      attendanceReportData: attendanceReport,
      weakStudentsData: weakStudents,
      uploadedFiles: { ...prev.uploadedFiles, [identifier]: fileData }
    }));
  };

  const handleStudentStatusChange = async (uniqueId, newStatus) => {
    const updatedStudents = formData.weakStudentsData.map(student =>
      student.uniqueId === uniqueId ? { ...student, status: newStatus } : student
    );

    setFormData(prev => ({ ...prev, weakStudentsData: updatedStudents }));

    if (newStatus === "Accepted") {
      try {
        const studentToSave = updatedStudents.find(s => s.uniqueId === uniqueId);
        await axios.post("/api/save-weak-student", studentToSave, {
          headers: { "x-auth-token": token }
        });
      } catch (error) {
        console.error("Error saving student data:", error);
      }
    }
  };

  const removeRejectedStudents = () => {
    setFormData(prev => ({
      ...prev,
      weakStudentsData: prev.weakStudentsData.filter(s => s.status !== "Rejected")
    }));
  };

  const validateCriteria = () => {
    return Object.values(formData.coAttainmentCriteria).every(({ full, partial }) =>
      parseFloat(full) >= parseFloat(partial)
    );
  };

  const handleSubmit = async () => {
    if (!isWeightageValid || !validateCriteria()) {
      alert("Please fix validation errors before submitting.");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${constants.url}/form`, { ...formData, num: props.num }, {
        headers: { "x-auth-token": token }
      });
      window.location.reload();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting form. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 gap-6 h-fit w-full flex flex-col bg-[#FFFEFD] overflow-hidden">
      
      

      {/* Form Sections */}
      <div className="space-y-6 overflow-y-auto pb-8">
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
        <SectionWrapper number="1-5" title="Course Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Program</label>
              <select
                value={formData.program}
                onChange={(e) => handleInputChange('program', e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#FFB255]"
              >
                <option value="">Select Program</option>
                {programOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {['coursecode', 'coursetitle', 'module', 'session'].map((field, idx) => (
              <div key={field} className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  value={formData[field]}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#FFB255]"
                  placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper number="6" title="Course Description and Objectives">
          <EditableCourseDescription
            courseDescription={formData.EditableCourseDescriptionData}
            onChange={(data) => handleInputChange('EditableCourseDescriptionData', data)}
          />
        </SectionWrapper>

        <SectionWrapper number="7" title="CO-PO Mapping">
          <COPOMapping
            onSave={handleCOPOMappingChange}
            initialData={formData.copoMappingData}
          />
        </SectionWrapper>

        <SectionWrapper number="8" title="Internal Assessments">
          <InternalAssessmentTable
            onSave={(data) => handleInputChange('internalAssessmentData', data)}
            initialData={formData.internalAssessmentData}
          />
        </SectionWrapper>

        <SectionWrapper number="9" title="CO Assessment Weightage">
          <COAssessmentWeightage
            copoMappingData={formData.copoMappingData}
            internalAssessmentData={formData.internalAssessmentData}
            initialWeightages={formData.coWeightages}
            onChange={(data) => handleInputChange('coWeightages', data)}
            onValidationChange={setIsWeightageValid}
          />
        </SectionWrapper>

        <SectionWrapper number="10" title="CO Attainment Criteria">
          <COAttainmentCriteria
            copoMappingData={formData.copoMappingData}
            initialCriteria={formData.coAttainmentCriteria}
            onSave={(data) => handleInputChange('coAttainmentCriteria', data)}
          />
        </SectionWrapper>

        <SectionWrapper number="11" title="Course Syllabus">
          <CourseSyllabus
            onSave={(data) => handleInputChange('courseSyllabus', data)}
            initialData={formData.courseSyllabus}
          />
        </SectionWrapper>

        <SectionWrapper number="12" title="Learning Resources">
          <div className="space-y-6">
            <AddField
              label="Text Book"
              initialData={formData.learningResources.textBooks}
              onChange={(data) => handleInputChange('learningResources', {
                ...formData.learningResources,
                textBooks: data
              })}
            />
            <AddField
              label="Reference Link"
              initialData={formData.learningResources.referenceLinks}
              onChange={(data) => handleInputChange('learningResources', {
                ...formData.learningResources,
                referenceLinks: data
              })}
            />
          </div>
        </SectionWrapper>

        <SectionWrapper number="13" title="Weekly Time-Table">
          <WeeklyTimetable
            initialData={formData.weeklyTimetableData}
            onChange={(newTimetable) => handleInputChange('weeklyTimetableData', newTimetable)}
          />
        </SectionWrapper>

        <SectionWrapper number="14" title="Registered Student List">
          <ExcelUploader
            title="Student List"
            identifier="studentList"
            onFileChange={handleFileChange}
            initialData={formData.studentListData}
          />
        </SectionWrapper>

        <SectionWrapper number="15" title="Identification of Weak Students">
          <ExcelUploader
            title="Weak Student List"
            identifier="weakStudentsData"
            onFileChange={handleFileChange}
            initialData={formData.weakStudentsData}
          />
          <div className="space-y-4">
            {!formData.weakStudentsData || formData.weakStudentsData.length === 0 ? (
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
                  <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 font-medium text-gray-600 border-b">
                    <div>Student ID</div>
                    <div>Name</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {formData.weakStudentsData.map((student) => (
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
        </SectionWrapper>

        <SectionWrapper number="16" title="Actions Taken for Weak Students">
          <ActionsForWeakStudents
            initialData={formData.actionsForWeakStudentsData}
            onSave={(updatedData) => handleInputChange('actionsForWeakStudentsData', updatedData)}
          />
        </SectionWrapper>

        <SectionWrapper number="17" title="Assignments/Quiz/Internal Components/Projects Taken Throughout Semester">
          <PDFUploader num={props.num} aqis={aqis} />
        </SectionWrapper>

        <SectionWrapper number="18" title="Detail of Marks in all Components up to the End Semester">
          <ExcelUploader
            title="Marks Details"
            identifier="marksDetails"
            onFileChange={handleFileChange}
            initialData={formData.marksDetailsData}
          />
        </SectionWrapper>

        <SectionWrapper number="19" title="Attendance Report">
          <ExcelUploader
            title="Attendance Report"
            identifier="attendanceReport"
            onFileChange={handleFileChange}
            initialData={formData.attendanceReportData}
          />
        </SectionWrapper>

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
});

export default FeedbackForm;
