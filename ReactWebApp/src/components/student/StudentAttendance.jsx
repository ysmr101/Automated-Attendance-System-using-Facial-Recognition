import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import logoImage from '../../assets/faceattend-logo.png';
import Circle from "../Circle";
import Legend from "../Legend";

function StudentAttendance() {
  const axiosPrivate = useAxiosPrivate();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [present, setPresent] = useState();
  const [late, setLate] = useState();
  const [absent, setAbsent] = useState();
  const [isLoading, setIsLoading] = useState(false);



  const refCode = new URLSearchParams(useLocation().search).get("refCode");
  const courseName = new URLSearchParams(useLocation().search).get(
    "courseName"
  );

  useEffect(() => {

    let presentCounter = 0;
    let lateCounter = 0;
    let absentCounter = 0;
    for (let i = 0; i < attendanceRecords.length; i++) {
      if (attendanceRecords[i].status === "Present") presentCounter++;
      else
        if (attendanceRecords[i].status === "Late") lateCounter++;
        else absentCounter++;
    }

    setPresent(presentCounter);
    setLate(lateCounter);
    setAbsent(absentCounter);


  }, [attendanceRecords]);

  useEffect(() => {
    setIsLoading(true);
    let isMounted = true;
    const controller = new AbortController();

    const getAttendance = async () => {
      try {
        const response = await axiosPrivate.get(
          `/getStudentAttendance?refCode=${refCode}`,
          {
            signal: controller.signal,
          }
        );
        console.log(response.data);
        if (isMounted) setAttendanceRecords(response.data);
      } catch (err) {
        console.error(err);
        setIsLoading(false)
      }
    };
    getAttendance();
    setIsLoading(false);
  }, [axiosPrivate, refCode]);
  const formatDate = (date) => {
    let d = new Date(date);
    let month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
  };

  const getDay = (dateString) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const getTime = (time) => {
    if (time === null) {
      return "-";
    } else {
      return time;
    }
  };

  const totalRecords = attendanceRecords.length;
  const absentPercentage = totalRecords ? (absent / totalRecords) * 100 : 0;
  const latePercentage = totalRecords ? (late / totalRecords) * 100 : 0;
  const presentPercentage = totalRecords ? (present / totalRecords) * 100 : 0;

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <img src={logoImage} alt="logo" className="logo" />
            <Link to={"/student"} className="nav-btn" title="Home">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </div>
        </div>
      </header>

      <section className="container mt-4">
        <div className="section-info mb-4">
          <h3 className="mb-2 text-center">{courseName}</h3>
          <hr />

          {isLoading ? (
            <div className="loader">
              {/* Assuming you have a loader/spinner component or CSS */}
            </div>
          ) : (
            <>
              <div className="attendance-visualization">
                <Circle
                  absentPercentage={absentPercentage}
                  latePercentage={latePercentage}
                  presentPercentage={presentPercentage}
                />
                <Legend
                  absentPercentage={absentPercentage}
                  latePercentage={latePercentage}
                  presentPercentage={presentPercentage}
                />
                <div className="mt-3 text-color">
                  <p><b>Absent: {absent}</b></p>
                  <p><b>Late: {late} </b></p>
                  <p><b>Present: {present}</b></p>
                </div>
              </div>
              <hr />
              <div className="attendance-table">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">Day</th>
                      <th scope="col">Date</th>
                      <th scope="col">Status</th>
                      <th scope="col">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords && attendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan="4">
                          <div className="text-center">No available lectures.</div>
                        </td>
                      </tr>
                    ) : (
                      attendanceRecords.map((attendance) => (
                        <tr key={attendance.date + attendance.time}>
                          <td>{getDay(attendance.date)}</td>
                          <td>{formatDate(attendance.date)}</td>
                          <td>{attendance.status}</td>
                          <td>{getTime(attendance.time)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentAttendance;