import React, { useEffect, useState } from "react";
import { TfiPowerOff } from "react-icons/tfi";
import { RxQuestionMarkCircled } from "react-icons/rx";
import constants from "../constants";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AsideComp = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(constants.url + "/", {
          headers: { "x-auth-token": token },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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

  if (isLoading) {
    return <aside className="dash-left">Loading...</aside>;
  }

  return (
    <aside className="dash-left">
      <div className="logo-bmu">
        <img src="/customer-logo.png" alt="BMU Logo" />
        <h1>Bml Munjal University</h1>
      </div>
      <div className="btm">
        <button type="button">
          <span>
            <RxQuestionMarkCircled size={24} />
          </span>
          Support
        </button>
        <form onSubmit={handleLogout}>
          <button type="submit">
            <span>
              <TfiPowerOff size={24} />
            </span>
            <div>
              <span>Logout</span>
              {userData && <p>{userData.email}</p>}
            </div>
          </button>
        </form>
      </div>
    </aside>
  );
};

export default AsideComp;