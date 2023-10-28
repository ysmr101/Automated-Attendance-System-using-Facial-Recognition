import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import ProfileComponent from "../components/profile";
import useAuth from "../hooks/useAuth";
import SectionsBox from "../components/admin/SectionsBox";
import AuthReqBox from "../components/admin/AuthReqBox";
import AddSectionBox from "../components/admin/AddSectionBox";
import AddAttendanceDeviceInfo from "../components/admin/AddAttendanceDeviceInfo";
import StudentStatus from "../components/StudentStatus";


function Admin() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState();
  const [profile, showProfile] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { setAuth } = useAuth();



  useEffect(() => {
    setIsLoading(true);
    let isMounted = true;

    const getUserData = async () => {
      try {
        const response = await axiosPrivate.get("/getUserData");
        if (isMounted) {
          setUser(response.data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        setIsLoading(false);
        setAuth({});
        navigate("/login");
      }
    };

    getUserData();

    return () => {
      isMounted = false;
    };
  }, []);

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
          <Navbar onProfileClick={showProfile} />

          <div className="container my-5">
            <div className="row">
              {profile ? (
                <div className="col-12">
                  <ProfileComponent user={user} />
                </div>
              ) : (
                <>
                  <hr />
                  <div className="col-12 mb-5">
                    <StudentStatus/>
                  </div>
                  <hr />
                  <div className="col-12 col-md-6">
                    <SectionsBox />
                  </div>

                  <div className="col-12 col-md-6">
                    <AuthReqBox />
                  </div>
                  <div className="col-12 col-md-6">
                    <AddSectionBox />
                  </div>
                  <div className="col-12 col-md-6">
                    <AddAttendanceDeviceInfo />
                  </div>

                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Admin;
