import { FaRegFilePdf } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";
import { FcDocument } from "react-icons/fc";
import axios from 'axios';
import constants from "../constants";

export default function NewC({ name, num, onView }) {
  const Delete = async (num) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(constants.url + '/delete', { num }, {
        headers: {
          'x-auth-token': token
        }
      });
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  }

  const Download = async (num) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(constants.url + '/download', { num }, {
        headers: {
          'x-auth-token': token
        },
        responseType: 'blob'
      });
  
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'file.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }

  return (
    <div className="relative group h-[18rem] w-[16rem] bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:border-[#FFB255] transition-all duration-300">
      <div className="flex h-full w-full flex-col items-center justify-between p-6">
        <div className="w-full flex flex-col items-center gap-4">
          <div className="bg-orange-50 rounded-full p-4 group-hover:bg-orange-100 transition-colors duration-300 shadow-sm">
            <FcDocument className="w-10 h-10" />
          </div>
          
          <div className="w-full text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1 truncate px-2" title={name}>
              {name}
            </h3>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={() => onView(num)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FFB255] hover:bg-[#ffa133] text-white rounded-md transition-all duration-200 font-medium shadow-sm hover:shadow"
          >
            <FaRegFilePdf className="w-4 h-4" />
            <span>View Document</span>
          </button>
          
          <div className="flex justify-between gap-2">
            <button
              onClick={() => Delete(num)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-500 rounded-md transition-all duration-200 border border-red-200 hover:border-red-300 font-medium"
              title="Delete"
            >
              <AiFillDelete className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => Download(num)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-blue-50 text-blue-500 rounded-md transition-all duration-200 border border-blue-200 hover:border-blue-300 font-medium"
              title="Download"
            >
              <IoMdDownload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}