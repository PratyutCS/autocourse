import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TfiPowerOff } from "react-icons/tfi";
import { RxQuestionMarkCircled } from "react-icons/rx";
import constants from "../constants";
import "../css/dash.css";
import Box from "../components/Box";

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [file, setFileData] = useState(null);

  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const response = await axios.post(
            constants.url + "/tokenIsValid",
            {},
            {
              headers: { "x-auth-token": token },
            }
          );

          if (!response.data) {
            localStorage.removeItem("token");
            navigate("/");
          } else {
            try {
              const response = await axios.get(constants.url + "/", {
                headers: { "x-auth-token": token },
              });
              setUserData(response.data);
            } catch (error) {
              console.error("Error recieving data:", error);
              localStorage.removeItem("token");
              navigate("/");
            }
          }
        } catch (error) {
          console.error("Error validating token:", error);
          localStorage.removeItem("token");
          navigate("/");
        }
      } else {
        navigate("/");
      }
    };

    checkTokenValidity();
  }, [navigate]);

  useEffect(() => {
    const fetchFilesData = async () => {
      if (userData) {
        const token = localStorage.getItem("token");
        try {
          const response = await axios.get(constants.url + "/files", {
            headers: { "x-auth-token": token },
          });
          setFileData(response.data);
        } catch (error) {
          console.error("Error fetching files data:", error);
        }
      }
    };

    fetchFilesData();
  }, [userData]);

  // console.log(file);

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        constants.url + "/api/signout",
        {},
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.status !== 500) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dash">
      <aside className="dash-left">
        <div className="logo-bmu">
          <img src="/customer-logo.png" alt="" />
          <h1>Bml Munjal University</h1>
        </div>
        <div className="btm">
          <button>
            <span>
              <RxQuestionMarkCircled size={24} />{" "}
            </span>
            Support
          </button>
          <form onSubmit={handleLogout}>
            <button type="submit">
              <span>
                {" "}
                <TfiPowerOff size={24} />
              </span>
              <div>
                <span>Logout</span>
                <p>{userData.email}</p>
              </div>
            </button>
          </form>
        </div>
      </aside>
      <div className="right">
        <div className="box p-6 rounded-lg shadow-lg">
          <h2 className="text-s font-bold mb-4">
            Instructions
          </h2>

          

          <div className="mb-4 flex items-center">
            <h3 className="text-xs font-semibold mr-2">1. Upload Handout:</h3>
            <p className="text-xs text-gray-700">
              Click the <span className="font-bold">"Upload Handout"</span>{" "}
              button to upload your course's handout in PDF format. Once
              uploaded, a card for the subject will be created automatically.
            </p>
          </div>

          <div className="mb-4 flex items-center">
            <h3 className="text-xs font-semibold mr-2">
              2. View or Edit Information:
            </h3>
            <p className="text-xs text-gray-700">
              After uploading, click the{" "}
              <span className="font-bold">"View"</span> button on the card to
              add or view detailed information related to the course.
            </p>
          </div>

          <div className="mb-4 flex items-center">
            <h3 className="text-xs font-semibold mr-2">3. Delete Card:</h3>
            <p className="text-xs text-gray-700">
              If you wish to remove the course handout, click the{" "}
              <span className="font-bold">"Delete"</span> icon on the card to
              delete it permanently.
            </p>
          </div>

          <div className="mb-4 flex items-center">
            <h3 className="text-xs font-semibold mr-2">4. Download Handout:</h3>
            <p className="text-xs text-gray-700">
              To download the uploaded handout, simply click the{" "}
              <span className="font-bold">"Download"</span> arrow icon.
            </p>
          </div>
        </div>

        <div className="line"></div>
        <Box files={file} />
      </div>
    </div>
  );
}

export default Dashboard;