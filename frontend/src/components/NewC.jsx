import React from 'react';
import '../css/newc.css';
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
    <div className='newc'>
      <div className='up'>
        <FcDocument size={40} />
        <h1 title={props.name}>{props.name}</h1>
        {/* <h1>{props.num}</h1> */}
      </div>
      <div className="down">
        <button className="del_btn" onClick={() => form(props.num)}> <FaRegFilePdf />View</button>
        <div className='del'>
          <button className="del_btn" onClick={() => Delete(props.num)}> <AiFillDelete /></button>
          <button className="del_btn" onClick={() => Download(props.num)}><IoMdDownload /></button>
        </div>
      </div>
    </div>
  );
}