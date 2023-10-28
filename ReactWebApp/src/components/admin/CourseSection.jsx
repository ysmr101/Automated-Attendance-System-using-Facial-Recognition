import Swal from 'sweetalert2';
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import { useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import logoImage from '../../assets/faceattend-logo.png';



// Function to format Date
const formatDate = (date) => {
  let d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  let year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const CourseSection = () => {

  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const refCode = new URLSearchParams(useLocation().search).get('refCode');
  const courseName = new URLSearchParams(useLocation().search).get('courseName');
  const sectionNum = new URLSearchParams(useLocation().search).get('sectionNum');


  // Dummy data for lectures using useState
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Delete section function using window.confirm
  const deleteSection = () => {
    Swal.fire({
      title: 'Are you sure you want to delete this section',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#1F2833',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {

        await axiosPrivate.post("/deleteSection", JSON.stringify({ refCode }));
        navigate('/admin')

      }
    }).catch((error) => {
      console.error(error);
    });
  };

  const removeLecture = (lectureDate, lectureStartTime) => {
    const newLectures = lectures.filter(lecture =>
      lecture.date !== lectureDate || lecture.startTime !== lectureStartTime
    );
    setLectures(newLectures);
  };

  const deleteLecture = (lecture) => {
    Swal.fire({
      title: `Lecture information`,
      text: `Date: ${formatDate(lecture.date)}, Start time: ${lecture.startTime}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#1F2833',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {

        await axiosPrivate.post("/deleteLecture", JSON.stringify({ lecture }));
        removeLecture(lecture.date, lecture.startTime);


      }
    }).catch((error) => {
      console.error(error);
    });
  };

  useEffect(() => {
    setIsLoading(true);
    let isMounted = true;

    const getLectures = async () => {
      try {
        const response = await axiosPrivate.get("/getLectures", { params: { refCode } });
        if (isMounted) {
          setLectures(response.data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    getLectures();

    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, refCode]);

  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <img src={logoImage} alt="logo" className="logo" />
            <Link to={'/admin'} className="nav-btn" title="Home">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </div>
        </div>
      </header>


      <div className='container'>
        <div className="mt-4 mb-4 text-color" style={{ borderRadius: '10px', border: '1px solid #ccc', padding: '15px' }}>
          <h3>{courseName}</h3>
          <p>Section Number: {sectionNum}<br />
            Section refcode: {refCode}</p>
        </div>
        <div >
          <Link to={`/SetLectures?refCode=${refCode}`} >
            <button className='btn cardBTN col-12 m-1'>Set Lectures</button>
          </Link>

          <Link to={`/ManageStudent?refCode=${refCode}`} >
            <button className='btn cardBTN col-12 m-1'>Manage Student</button>
          </Link>
          <Link to={`/ManageFaculty?refCode=${refCode}`} >
            <button className='btn cardBTN col-12 m-1'>Manage Faculty</button>
          </Link>
          <Link to={`/FDA?refCode=${refCode}`} >
            <button className='btn cardBTN col-12 m-1'>FDA</button>
          </Link>
        </div>



        <div className="row mt-4 mb-4 justify-content-center">
          {/* Add your links here */}
        </div>

        <div className="list-group">
          {isLoading ? (
            <div className="loader">
              <div className="spinnerContainer">
                <div className="spinner"></div>
              </div>
            </div>
          ) : (
            <div> </div>
          )}
          {lectures.map((lecture, index) => (
            <Link to={`/LectureAttendance?refCode=${lecture.refCode}&date=${lecture.date}&startTime=${lecture.startTime}`} className="list-group-item list-group-item-action">
              <div className="d-flex justify-content-between align-items-center text-color">
                <div>
                  <h5 className="mb-1">Lecture {index + 1}: {lecture.name}</h5>
                  <div>
                    <span><strong>Date:</strong> {lecture.day}, {formatDate(lecture.date)}</span><br />
                    <span><strong>Start:</strong> {lecture.startTime}, <strong>End:</strong> {lecture.endTime}</span>
                  </div>
                </div>
                <button type="button" className="btn btn-outline-danger" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteLecture(lecture); }}>
                  Delete Lecture
                </button>

              </div>
            </Link>
          ))}
        </div>

        <form id="deleteSectionForm">
          <button type="button" className="col-12 my-3 btn btn-outline-danger" onClick={deleteSection}>
            Delete Section
          </button>
        </form>
      </div>

    </div>
  );
};

export default CourseSection;
