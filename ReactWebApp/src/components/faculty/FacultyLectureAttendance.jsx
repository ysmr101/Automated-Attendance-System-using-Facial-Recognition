import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';
import logoImage from '../../assets/faceattend-logo.png';
import Circle from "../Circle";
import Legend from "../Legend";



const formatDate = (dateString) => {
  const date = new Date(dateString);


  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day}`;


  return formattedDate;
};
function FacultyLectureAttendance() {



  const [records, setRecords] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const refCode = new URLSearchParams(useLocation().search).get("refCode");
  const startTime = new URLSearchParams(useLocation().search).get("startTime");
  const date = new URLSearchParams(useLocation().search).get('date');
  const [present, setPresent] = useState();
  const [late, setLate] = useState();
  const [absent, setAbsent] = useState();
  const [Msg, setMsg] = useState('')
  const [ErrMsg, setErrMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true)

    const getRecords = async () => {
      try {
        const response = await axiosPrivate.get(`/getRecords`, {
          params: {
            refCode: refCode, // Replace 'some_id_value' with the actual value
            date: formatDate(date),
            startTime: startTime
          }
        },
          {
            signal: controller.signal,
          });
        if (isMounted) {


          setRecords(response.data);
        }
      } catch (err) {
        console.error(err);
      }

    }
    getRecords();

    setIsLoading(false)
    return () => {
      isMounted = false;
      controller.abort();
    };

  }, [axiosPrivate, date, startTime, refCode]);




  const updateStatusColor = (status) => {
    if (status === 'Present') {
      return 'bg-success';
    } else if (status === 'Absent') {
      return 'bg-danger';
    } else if (status === 'Late') {
      return 'bg-warning';
    }
    return '';
  };

  const handleStatusChange = (index, newStatus) => {
    const updatedData = [...records];
    updatedData[index].status = newStatus;
    setRecords(updatedData);

  };

  const getTime = (time) => {
    if (time === null) {
      return "-";
    } else {
      return time;
    }
  };

  const StudentInfo = async (name, sid) => {
    let isMounted = true;
    let info = ''
    const controller = new AbortController();

    try {
      const response = await axiosPrivate.get(`/getStudentAttendanceInfo`, {
        params: {
          sid: sid,
          refCode: refCode,
        },
        signal: controller.signal
      });

      if (isMounted) {
        info = response.data
      }
    } catch (err) {
      console.error(err);
    }


    Swal.fire({
      title: ``,
      html: `<b>${name}<br>ID: ${sid}</b><br>Attendance: ${info.Present || 0}<br>Absence: ${info.Absent || 0}<br>Late: ${info.Late || 0}`,
      confirmButtonColor: '#1F2833',
      confirmButtonText: 'Close'
    });

  }


  const handleUpdateRecord = async (event) => {
    event.preventDefault();
    try {
      const response = await axiosPrivate.post("/handleUpdateRecord", {
        params: {
          refCode: refCode,
          date: formatDate(date),
          startTime: startTime,
          records: records,
        },
      });


      setMsg("Records updated successfully!");
      setErrMsg('')


    } catch (err) {
      setErrMsg("Error while updating the records")
      setMsg('')
    }
  };

  useEffect(() => {

    let presentCounter = 0;
    let lateCounter = 0;
    let absentCounter = 0;
    for (let i = 0; i < records.length; i++) {
      if (records[i].status === "Present") presentCounter++;
      else
        if (records[i].status === "Late") lateCounter++;
        else absentCounter++;
    }




    setPresent(presentCounter);
    setLate(lateCounter);
    setAbsent(absentCounter);


  }, [records]);

  const totalRecords = records.length;
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
      <div className="container mt-5">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Attendance Summary</h5>
            {/* Summary Logic Here */}
            <div className="statistics">
              <div className="attendance-stat">Attendees: {present}</div>
              <div className="absence-stat">Absence: {absent}</div>
              <div className="late-stat">Late: {late}</div>
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
              </div>

            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateRecord} id="attendance-form">
          <table className="table table-striped mt-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Time of Attendance</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="loader">
                  <td colSpan={4}>
                    <div className="spinnerContainer">
                      <div className="spinner"></div>
                    </div>
                  </td>

                </tr>
              ) : (
                <div> </div>
              )}
              {records.map((row, index) => (
                <tr key={index}>
                  <td>
                    {row.name} <br />
                    {row.sid}
                  </td>
                  <td>
                    <select
                      className={`form-select ${updateStatusColor(row.status)}`}
                      value={row.status}
                      onChange={(e) => handleStatusChange(index, e.target.value)}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                    </select>
                  </td>
                  <td>{getTime(row.time)}</td>
                  <td><FontAwesomeIcon style={{ cursor: 'pointer' }} onClick={() => StudentInfo(row.name, row.sid)} icon={faCircleInfo} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {Msg && <div className="alert alert-success">{Msg}</div>}
          {ErrMsg && <div className="alert alert-danger">{ErrMsg}</div>}
          <button type="submit" className="btn cardBTN mt-3 mb-5">
            Submit Changes
          </button>
        </form>
      </div>

      <div className="container mt-5">
        <div className="list-group">


        </div>
      </div>
    </div>
  );
}

export default FacultyLectureAttendance;