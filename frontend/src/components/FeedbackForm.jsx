import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
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
import COAssessmentWeightage from "./COAssessmentWeightage";
import COAttainmentCriteria from "./COAttainmentCriteria";
import constants from "../constants";
import TargetAttainmentTable from "./TargetAttainmentTable";
import AttendanceReport from "./AttendanceReport";
import WeakStudent from "./WeakStudent";
import "../css/feedback.css";
import RegisteredStudentList from "./RegisteredStudentList";

const SectionWrapper = ({ number, title, children, className = "" }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}
  >
    <div className="flex items-center gap-4 mb-6">
      <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
        {number}
      </div>
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

const FeedbackForm = forwardRef((props, ref) => {
  const token = localStorage.getItem("token");
  const [aqis, setAqis] = useState(props.aqis || "");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    coursecode: props.coursecode || "",
    coursetitle: props.coursetitle || "",
    module: props.module || "",
    session: props.session || "",
    program: props.program || "",
    courseSyllabus: props.courseSyllabus || [
      {
        srNo: 1,
        content: "",
        co: "",
        sessions: "",
      },
    ],
    learningResources: {
      textBooks: props.learningResources?.textBooks || [],
      referenceLinks: props.learningResources?.referenceLinks || [],
    },
    EditableCourseDescriptionData: props.courseDescription || "",
    copoMappingData: props.copoMappingData || {
      courseOutcomes: {},
      mappingData: {},
      tableMode: "manual",
      imagePath: null,
      imageFileName: null,
    },
    studentListData: props.studentListData || [],
    marksDetailsData: props.marksDetailsData || [],
    attendanceReportData: props.attendanceReportData || [],
    internalAssessmentData: props.internalAssessmentData || { components: [] },
    actionsForWeakStudentsData: props.actionsForWeakStudentsData || [],
    weeklyTimetableData: props.weeklyTimetableData || null,
    coWeightages: props.coWeightages || {},
    coAttainmentCriteria: props.coAttainmentCriteria || {},
    targetAttainments: props.targetAttainments || null,
  });

  const [isWeightageValid, setIsWeightageValid] = useState(false);
  const programOptions = ["CSE", "ME", "ECOM", "ECT"];
  const [processedStudents, setProcessedStudents] = useState([]);
  const [targetLevels, setTargetLevels] = useState([]);

  useEffect(() => {
    setAqis(props.aqis || "");
  }, [props.aqis]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const validate = () => {
      const isValid = isWeightageValid && validateCriteria();
      const message = isValid
        ? ""
        : !isWeightageValid
        ? "CO weightages must total 100%"
        : "CO criteria needs adjustment";
      props.onValidationChange({ isValid, message });
      return { isValid, message };
    };
    validate();
  }, [isWeightageValid, formData.coAttainmentCriteria]);

  useImperativeHandle(ref, () => ({
    validateForm: () => {
      const isValid = isWeightageValid && validateCriteria();
      const message = isValid
        ? ""
        : !isWeightageValid
        ? "CO weightages must total 100%"
        : "CO criteria needs adjustment";
      props.onValidationChange({ isValid, message });
      return { isValid, message };
    },
    submitForm: handleSubmit,
  }));

  const handleCOPOMappingChange = (data) => {
    setFormData((prev) => ({
      ...prev,
      copoMappingData: {
        ...prev.copoMappingData,
        ...data,
        courseOutcomes:
          data.courseOutcomes || prev.copoMappingData.courseOutcomes,
        mappingData: data.mappingData || prev.copoMappingData.mappingData,
        tableMode: data.tableMode || prev.copoMappingData.tableMode,
        imagePath: data.imagePath || prev.copoMappingData.imagePath,
      },
    }));
  };

  const handleInternalAssessmentChange = (data, deletedComponentName) => {
    setFormData((prev) => {
      const newWeightages = { ...prev.coWeightages };

      if (deletedComponentName) {
        Object.keys(newWeightages).forEach((co) => {
          if (newWeightages[co][deletedComponentName]) {
            delete newWeightages[co][deletedComponentName];
          }
        });
      }

      return {
        ...prev,
        internalAssessmentData: data,
        coWeightages: newWeightages,
      };
    });
  };

  const totalCOWeights = useMemo(() => {
    const totals = {};
    Object.entries(formData.coWeightages).forEach(([co, assessments]) => {
      totals[co] = Object.values(assessments).reduce(
        (sum, weight) => sum + Number(weight),
        0
      );
    });
    return totals;
  }, [formData.coWeightages]);

  const handleFileChange = (fileData, identifier) => {
    if (!fileData || !fileData.data) return;

    setFormData((prev) => ({
      ...prev,
      [identifier + "Data"]: fileData.data,
      uploadedFiles: {
        ...prev.uploadedFiles,
        [identifier]: {
          data: fileData.data,
          maxMarks: fileData.maxMarks,
        },
      },
    }));
  };

  const handleStudentStatusChange = async (uniqueId, newStatus) => {
    const updatedStudents = formData.weakStudentsData.map((student) =>
      student.uniqueId === uniqueId
        ? { ...student, status: newStatus }
        : student
    );

    setFormData((prev) => ({ ...prev, weakStudentsData: updatedStudents }));

    if (newStatus === "Accepted") {
      try {
        const studentToSave = updatedStudents.find(
          (s) => s.uniqueId === uniqueId
        );
        await axios.post("/api/save-weak-student", studentToSave, {
          headers: { "x-auth-token": token },
        });
      } catch (error) {
        console.error("Error saving student data:", error);
      }
    }
  };

  const handleTargetSave = useCallback((targets) => {
    setFormData((prev) => ({ ...prev, targetAttainments: targets }));
  }, []);

  const removeRejectedStudents = () => {
    setFormData((prev) => ({
      ...prev,
      weakStudentsData: prev.weakStudentsData.filter(
        (s) => s.status !== "Rejected"
      ),
    }));
  };

  const validateCriteria = () => {
    return Object.values(formData.coAttainmentCriteria).every(
      ({ full, partial }) => parseFloat(full) >= parseFloat(partial)
    );
  };

  useEffect(() => {
    if (formData.studentListData.length > 0) {
      setProcessedStudents(formData.studentListData);
    }
  }, [formData.studentListData]);

  const handleSubmit = async () => {
    if (!isWeightageValid || !validateCriteria()) {
      alert("Please fix validation errors before submitting.");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(
        `${constants.url}/form`,
        { ...formData, num: props.num },
        {
          headers: { "x-auth-token": token },
        }
      );
      window.location.reload();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting form. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAssessmentComponents = (internalAssessmentData) => {
    if (!internalAssessmentData?.components) return [];

    return Object.values(internalAssessmentData.components).map(
      (component) => ({
        name: component.component?.trim() || "Unnamed Assessment",
        weightage: component.weightage,
        maxMarks: component.maxMarks || 100,
      })
    );
  };

  return (
    <div className="p-5 gap-6 h-fit w-full flex flex-col bg-[#FFFEFD] overflow-hidden">
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
                  All fields in this form are editable and can be modified as
                  needed.
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-[#FFB255] rounded-full mr-2"></span>
                  The initial data has been automatically extracted from your
                  course handout using AI.
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-[#FFB255] rounded-full mr-2"></span>
                  Please review all information carefully as AI-extracted data
                  may not be 100% accurate.
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-[#FFB255] rounded-full mr-2"></span>
                  You can save your progress at any time using the Submit Form
                  button.
                </p>
              </div>
              <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm text-orange-700">
                  <span className="font-semibold">Pro Tip:</span> Take your time
                  to verify each section, especially numerical data and dates,
                  before final submission.
                </p>
              </div>
            </div>
          </div>
        </div>
        <SectionWrapper number="1-5" title="Course Information">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Program
              </label>
              <select
                value={formData.program}
                onChange={(e) => handleInputChange("program", e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#FFB255]"
              >
                <option value="">Select Program</option>
                {programOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {["coursecode", "coursetitle", "module", "session"].map(
              (field, idx) => (
                <div key={field} className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    value={formData[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#FFB255]"
                    placeholder={`Enter ${field
                      .replace(/([A-Z])/g, " $1")
                      .toLowerCase()}`}
                  />
                </div>
              )
            )}
          </div>
        </SectionWrapper>

        <SectionWrapper number="6" title="Course Description and Objectives">
          <EditableCourseDescription
            courseDescription={formData.EditableCourseDescriptionData}
            onChange={(data) =>
              handleInputChange("EditableCourseDescriptionData", data)
            }
          />
        </SectionWrapper>

        <SectionWrapper number="7" title="CO-PO Mapping">
          <COPOMapping
            onSave={handleCOPOMappingChange}
            initialData={formData.copoMappingData}
          />
        </SectionWrapper>
        <SectionWrapper
          number="19"
          title="Detail of Marks in all Components up to the End Semester"
        >
          <ExcelUploader
            onSave={(data) => {
              setFormData((prev) => ({
                ...prev,
                studentListData: data,
              }));
            }}
            initialData={formData.studentListData}
          />
        </SectionWrapper>

        <SectionWrapper number="8" title="Internal Assessments">
          <InternalAssessmentTable
            onSave={handleInternalAssessmentChange}
            initialData={formData.internalAssessmentData}
          />
        </SectionWrapper>

        <SectionWrapper number="9" title="CO Assessment Weightage">
          <COAssessmentWeightage
            copoMappingData={formData.copoMappingData}
            studentData={formData.studentListData}
            initialWeightages={formData.coWeightages}
            onChange={(data) => handleInputChange("coWeightages", data)}
            onValidationChange={(isValid) => setIsWeightageValid(isValid)}
          />
        </SectionWrapper>

        <SectionWrapper number="10" title="CO Attainment Criteria">
          <COAttainmentCriteria
            copoMappingData={formData.copoMappingData}
            initialCriteria={formData.coAttainmentCriteria}
            onSave={(data) => handleInputChange("coAttainmentCriteria", data)}
          />
        </SectionWrapper>
        <SectionWrapper number="11" title="Target Attainment Table">
          <TargetAttainmentTable
            initialData={formData.targetAttainments}
            onSave={(targets) => {
              setTargetLevels(targets);
              handleInputChange("targetAttainments", targets);
            }}
          />
        </SectionWrapper>

        <SectionWrapper number="12" title="Course Syllabus">
          <CourseSyllabus
            onSave={(data) => handleInputChange("courseSyllabus", data)}
            initialData={formData.courseSyllabus}
          />
        </SectionWrapper>

        <SectionWrapper number="13" title="Learning Resources">
          <div className="space-y-6">
            <AddField
              label="Text Book"
              initialData={formData.learningResources.textBooks}
              onChange={(data) =>
                handleInputChange("learningResources", {
                  ...formData.learningResources,
                  textBooks: data,
                })
              }
            />
            <AddField
              label="Reference Link"
              initialData={formData.learningResources.referenceLinks}
              onChange={(data) =>
                handleInputChange("learningResources", {
                  ...formData.learningResources,
                  referenceLinks: data,
                })
              }
            />
          </div>
        </SectionWrapper>

        <SectionWrapper number="14" title="Weekly Time-Table">
          <WeeklyTimetable
            initialData={formData.weeklyTimetableData}
            onChange={(newTimetable) =>
              handleInputChange("weeklyTimetableData", newTimetable)
            }
          />
        </SectionWrapper>

        <SectionWrapper number="15" title="Registered Student List">
        <RegisteredStudentList students={formData.studentListData}/>
         
        </SectionWrapper>

        <SectionWrapper number="16" title="Identification of Weak Students">
          <div className="space-y-4">
            {!formData.studentListData ||
            formData.studentListData.length === 0 ? (
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
              <WeakStudent
                weakStudentsData={formData.studentListData}
                handleStudentStatusChange={handleStudentStatusChange}
                removeRejectedStudents={removeRejectedStudents}
              />
            )}
          </div>
        </SectionWrapper>

        <SectionWrapper number="17" title="Actions Taken for Weak Students">
          <ActionsForWeakStudents
            initialData={formData.actionsForWeakStudentsData}
            onSave={(updatedData) =>
              handleInputChange("actionsForWeakStudentsData", updatedData)
            }
          />
        </SectionWrapper>

        <SectionWrapper
          number="18"
          title="Assignments/Quiz/Internal Components/Projects Taken Throughout Semester"
        >
          <PDFUploader num={props.num} aqis={aqis} />
        </SectionWrapper>

        

        <SectionWrapper number="20" title="Attendance Report">
          <AttendanceReport
            initialData={formData.studentListData}
            onChange={(data) => handleInputChange("attendanceReportData", data)}
          />
        </SectionWrapper>

        <SectionWrapper
  number="21"
  title="Feedback (class committee or otherwise) and corrective actions (if any)"
>
  <div className="w-full flex flex-row gap-6 items-center">
    <label className="text-gray-700 font-medium">Quantitative feedback:</label>
    <textarea
      className="w-20 p-3 border border-gray-200 rounded-lg transition-all resize-none text-gray-700 focus:ring-2 focus:ring-[#FFB255]/20 focus:border-[#FFB255] outline-none"
      placeholder="Rating..."
      value={formData.feedbackRating}
      onChange={(e) => handleInputChange("feedbackRating", e.target.value)}
      rows="1"
    />
  </div>

  <textarea
    className="mt-4 w-full p-4 border border-gray-200 rounded-lg transition-all duration-200 resize-none text-gray-700 focus:ring-2 focus:ring-[#FFB255]/20 focus:border-[#FFB255] outline-none"
    placeholder="Enter the feedback here..."
    value={formData.feedbackComments}
    onChange={(e) => handleInputChange("feedbackComments", e.target.value)}
    rows="2"
  />
</SectionWrapper>

<SectionWrapper number="22" title="Faculty Course Review">
  <textarea
    className="w-full p-4 border border-gray-200 rounded-lg transition-all duration-200 resize-none text-gray-700 focus:ring-2 focus:ring-[#FFB255]/20 focus:border-[#FFB255] outline-none"
    placeholder="Enter course review here..."
    value={formData.courseReview}
    onChange={(e) => handleInputChange("courseReview", e.target.value)}
    rows="2"
  />
</SectionWrapper>

{isLoading && <LoadingSpinner />}
</div>
</div>
  );
});
FeedbackForm.displayName = "FeedbackForm";
export default FeedbackForm;