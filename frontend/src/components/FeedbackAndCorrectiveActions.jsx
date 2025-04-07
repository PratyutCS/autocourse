import React, { useState, useEffect } from "react";

const FeedbackAndCorrectiveActions = ({ initialData, onSave }) => {
  const [quantitativeFeedback, setQuantitativeFeedback] = useState(
    initialData?.quantitativeFeedback || ""
  );
  const [qualitativeFeedback, setQualitativeFeedback] = useState(
    initialData?.qualitativeFeedback || ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setQuantitativeFeedback(initialData.quantitativeFeedback || "");
      setQualitativeFeedback(initialData.qualitativeFeedback || "");
    }
  }, [initialData]);

  const handleQuantitativeChange = (e) => {
    // Allow only numbers with up to 2 decimal places
    const value = e.target.value;
    // Regex to match numbers with up to 2 decimal places
    const regex = /^\d*(\.\d{0,2})?$/;
    
    if (value === "" || regex.test(value)) {
      const numValue = parseFloat(value || 0);
      
      // Validate the range (0.00 to 5.00)
      if (value === "" || (numValue >= 0 && numValue <= 5)) {
        setError("");
        setQuantitativeFeedback(value);
        
        if (onSave) {
          onSave({
            quantitativeFeedback: value,
            qualitativeFeedback,
          });
        }
      } else {
        setError("Value must be between 0.00 and 5.00");
      }
    }
  };

  const handleQualitativeChange = (e) => {
    setQualitativeFeedback(e.target.value);
    
    if (onSave) {
      onSave({
        quantitativeFeedback,
        qualitativeFeedback: e.target.value,
      });
    }
  };

  // Format the display value to show 2 decimal places when field loses focus
  const handleBlur = () => {
    if (quantitativeFeedback !== "") {
      const numValue = parseFloat(quantitativeFeedback);
      setQuantitativeFeedback(numValue.toFixed(2));
      
      if (onSave) {
        onSave({
          quantitativeFeedback: numValue.toFixed(2),
          qualitativeFeedback,
        });
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-[#FFB255] text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
          21
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          Feedback <span className="text-gray-400">(class committee or otherwise)</span> and corrective actions <span className="text-gray-400">(if any)</span>
        </h2>
      </div>
      
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quantitative feedback
        </label>
        <input
          type="text"
          value={quantitativeFeedback}
          onChange={handleQuantitativeChange}
          onBlur={handleBlur}
          className={`w-full p-3 border ${error ? "border-red-500" : "border-gray-200"} rounded-md transition-all text-gray-700`}
          placeholder="Enter feedback score (e.g., 4.50)"
        />
        {error ? (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">
            Please enter a number between 0.00 and 5.00 with up to 2 decimal places
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Qualitative feedback and corrective actions
        </label>
        <textarea
          value={qualitativeFeedback}
          onChange={handleQualitativeChange}
          className="w-full p-3 border border-gray-200 rounded-md transition-all resize-y text-gray-700"
          placeholder="Enter qualitative feedback and corrective actions taken..."
          rows="2"
        />
      </div>
    </div>
  );
};

export default FeedbackAndCorrectiveActions;