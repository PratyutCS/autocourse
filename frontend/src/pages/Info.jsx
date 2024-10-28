import React, { useEffect, useState } from 'react';
import constants from "../constants";
import axios from 'axios';
import { RxQuestionMarkCircled } from 'react-icons/rx';
import FeedbackForm from '../components/FeedbackForm';
import { useLocation } from 'react-router-dom';
import AsideComp from '../components/AsideComp';
import '../css/dash.css'
const Info = () => {
  const location = useLocation();
  const { num } = location.state || {};

  const token = localStorage.getItem('token');
  const [file, setFileData] = useState(null);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    let pollingInterval = null;

    const fetchFilesData = async () => {
      try {
        const response = await axios.post(constants.url + '/numdata', { num }, {
          headers: { 'x-auth-token': token }
        });
        setFileData(response.data);

        if (response.data.done === 1) {
          clearInterval(pollingInterval);
        }
      } catch (error) {
        console.error("Error fetching files data:", error);
        setError('Failed to load data');
        clearInterval(pollingInterval);
      }
    };

    if (num !== undefined) {
      pollingInterval = setInterval(fetchFilesData, 1000);
      fetchFilesData();
    }
    return () => clearInterval(pollingInterval);
  }, [num, token]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='dash'>
      <AsideComp/>
      <div className="right">
        <div className="box23">
          {file && file.done === 1 ? (
            <FeedbackForm
              file={file.filename}
              num={num}
              courseDescription={file["course_description"]||""}
              coursecode={file["Course_details"]['course_code']}
              coursetitle={file["Course_details"]['course_name']}
              module={file["Course_details"]['Module/Semester']}
              session={file["Course_details"]['Session']}
            />
          ) : (
            <p>Loading file information...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Info;
