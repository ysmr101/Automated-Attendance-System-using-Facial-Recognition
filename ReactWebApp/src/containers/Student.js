import "../css/App.css";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import STDCard from "../components/student/STDCard";
import SectionCard from "../components/student/SectionCards";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import ProfileComponent from "../components/profile";
import axios from "axios";
import useAuth from "../hooks/useAuth";

function StudentApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [profile, showProfile] = useState(false);
  const { setAuth } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    let isMounted = true;
    const controller = new AbortController();

    const getUser = async () => {
      try {
        const response = await axiosPrivate.get("/getUserData", {
          signal: controller.signal,
        });
        console.log(response.data);
        isMounted && setUser(response.data);
        setIsLoading(false);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error(err);
          setIsLoading(false);
          setAuth({});
          navigate("/login");
        }
      }
    };

    getUser();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleProfileClick = (show) => {
    showProfile(show);
  };

  return (
    <div className="sbody">
      {isLoading ? (
        <div className="loader">
          <div className="spinnerContainer">
            <div className="spinner"></div>
          </div>
        </div>
      ) : (
        <>
          <Navbar onProfileClick={handleProfileClick} />
          <div className="container">
            {profile ? (
              <ProfileComponent user={user} />
            ) : (
              <>
                <STDCard user={user} />
                <SectionCard />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StudentApp;
