import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

import React from "react";
import { Link, json } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import logoImage from '../../assets/faceattend-logo.png';


const FDA = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const refCode = new URLSearchParams(useLocation().search).get("refCode");
  const statusCounts = {};
  const [Msg, setMsg] = useState("");
  const [ErrMsg, setErrMsg] = useState("");
  const [students, setStudents] = useState([]);
  const [FDAStudents, setFDAStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
 
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);

    const getAllRecords = async () => {
      try {
        console.log(refCode);
        const response = await axiosPrivate.get(
          `/getAllRecords`,
          {
            params: {
              refCode: refCode,
            },
          },
          {
            signal: controller.signal,
          }
        );


        if (isMounted) {
          console.log(response.data);
          setStudents(response.data);


        }
      } catch (err) {
        console.error(err);
      }
    };

    getAllRecords();
   

    const getFDAStudents = async () => {
      try {
        console.log(FDA)
        const response = await axiosPrivate.get(
          `/getFDAStudents`,
          {
            params: {
              refCode: refCode,
            },
          },
          {
            signal: controller.signal,
          }
        );
        if (isMounted) {
          console.log(response.data);
          setFDAStudents(response.data);


        }
      } catch (err) {
        console.error(err);
      }
    };
    getFDAStudents();

    setIsLoading(false);
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [axiosPrivate]);
  
  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <img src={logoImage} alt="logo" className="logo" />
            <Link to={"/admin"} className="nav-btn" title="Home">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="row mt-5">
          <div className="col-md-12">
            <h2>Failure Due to Absences</h2>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">SID</th>
                  <th scope="col">Absences</th>
                  <th scope="col">FDA</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {FDAStudents.map((student) => (
                  (student.AbsenceCount > 0.25 * student.records) ?
                    <tr key={student.sid}>
                      <td>{student.studentName}</td>
                      <td>{student.sid}</td>
                      <td>{student.AbsenceCount}</td>
                      <td>{0.25 * student.records}</td>

                      <td></td>
                    </tr>
                    : null
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {Msg && <div className="alert alert-success">{Msg}</div>}
        {ErrMsg && <div className="alert alert-danger">{ErrMsg}</div>}


      </div>
    </div>
  );
};

export default FDA;