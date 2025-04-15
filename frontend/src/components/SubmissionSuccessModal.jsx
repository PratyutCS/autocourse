import React from 'react';
import { IoCheckmarkCircle } from "react-icons/io5"; 
import { IoMdDownload } from "react-icons/io"; // Correct import for IoMdDownload
import { motion } from "framer-motion";

const SubmissionSuccessModal = ({ isOpen, onClose, onDownload }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden"
        initial={{ scale: 0.9, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
      >
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <IoCheckmarkCircle className="h-10 w-10 text-green-500" />
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            Form Submitted Successfully!
          </h3>
          
          <p className="text-gray-600 mb-8">
            Your form has been processed and is ready for download.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onDownload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-600 hover:to-orange-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <IoMdDownload className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
            
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubmissionSuccessModal;