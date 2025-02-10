import { useState } from 'react';
import { IoCloudUploadOutline, IoDocumentTextOutline } from "react-icons/io5";
import FileUploadPopup from './FileUploadPopup';

// Cards Component
const Cards = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  return (
    <div className="relative group h-[18rem] w-[16rem]  bg-white rounded-xl border border-gray-200 hover:border-[#FFB255] transition-all duration-300 ">
      <div className="p-6 flex flex-col items-center justify-center gap-4 w-[16rem] h-[17rem]">
        <div className="bg-orange-50 rounded-full p-4 group-hover:bg-orange-100 transition-colors">
          <IoDocumentTextOutline className="w-8 h-8 text-[#FFB255]" />
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Upload New Handout</h3>
          <p className="text-sm text-gray-500 mb-4">Add your course materials here</p>
          
          <button
            onClick={() => setIsPopupOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFB255] hover:bg-[#ffa133] text-white rounded-lg transition-colors duration-200"
          >
            <IoCloudUploadOutline className="w-5 h-5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>
      
      <FileUploadPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
};
export default Cards;