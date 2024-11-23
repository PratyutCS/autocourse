import React from 'react';
import constants from "../constants";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaRegFilePdf } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { IoMdDownload } from "react-icons/io";
import { FcDocument } from "react-icons/fc";

export default function NewC(props) {
  const navigate = useNavigate();

  const form = (num) => {
    navigate('/form', { state: { num: num } });
  }

  const Delete = async (num) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(constants.url + '/delete', { num }, {
        headers: {
          'x-auth-token': token
        }
      });
      console.log(response);
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
    <div className="relative group h-[17rem] w-[16rem] bg-white rounded-xl border border-gray-200 hover:border-[#FFB255] transition-all duration-300 overflow-hidden">
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 ">
        <div className="bg-orange-50 rounded-full p-4 group-hover:bg-orange-100 transition-colors">
          <FcDocument className="w-8 h-8" />
        </div>
        
        <div className="w-full px-7 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-1" title={props.name}>
            {props.name}
          </h3>
          
          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => form(props.num)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#FFB255] hover:bg-[#ffa133] text-white rounded-lg transition-colors duration-200"
            >
              <FaRegFilePdf className="w-5 h-5" />
              <span>View</span>
            </button>
            
            <div className="flex justify-between gap-2">
              <button
                onClick={() => Delete(props.num)}
                className="inline-flex items-center justify-center gap-2 px-10 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              >
                <AiFillDelete className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => Download(props.num)}
                className="inline-flex items-center justify-center gap-2 px-10 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
              >
                <IoMdDownload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}