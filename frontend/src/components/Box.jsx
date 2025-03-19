import React from 'react';
import '../css/box.css';
import Cards from './Cards';
import NewC from './NewC';
import { motion, AnimatePresence } from 'framer-motion';
import { FcDocument } from "react-icons/fc";

export default function Box(props) {
  return (
    <div className="box1">
      {/* Files grid */}
      {props.files && props.files.length > 0 ? (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {/* Upload Card as first item in grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="file-card"
            >
              <Cards />
            </motion.div>
            
            {/* File cards */}
            {props.files.map((file, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="file-card"
              >
                <NewC 
                  name={file.course_name || file.course_code || file.filename || "Unknown Course"} 
                  num={index} 
                  userData={props.userData} 
                  done={file.done}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        // When there are no files, show upload card plus empty state message
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Cards />
          
          <div className="sm:col-span-1 md:col-span-3 flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-gray-100 rounded-full p-6 mb-4">
              <FcDocument className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No documents available</h3>
            <p className="text-gray-500 max-w-md text-center">
              Upload your first document to get started with the course file generator.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}