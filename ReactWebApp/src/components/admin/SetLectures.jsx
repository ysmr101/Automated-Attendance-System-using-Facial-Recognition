import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import logoImage from '../../assets/faceattend-logo.png';


function SetLectures() {

    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    const [isChecked, setIsChecked] = useState({
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false
    });

    const handleCheckChange = (e, day) => {
        setIsChecked({ ...isChecked, [day]: e.target.checked });
    };

    const axiosPrivate = useAxiosPrivate();

    const handleSetLectures = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        try {
            const response = await axiosPrivate.post("/addLectures", formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );
            console.log(response.data);
            setSuccessMsg('Lecture successfully added.'); // show success msg
            setErrorMsg(null); // clear any previous error messages
        } catch (err) {
            console.error(err);
            setErrorMsg('There was an error adding the lecture.'); // set error msg
            setSuccessMsg(null); // clear any previous success messages
        }
    };

    const refCode = new URLSearchParams(useLocation().search).get('refCode');

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

            {successMsg && <div className="alert alert-success">{successMsg}</div>}
            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
            <div className="container my-5">
                <form id="lectureForm" onSubmit={handleSetLectures}>

                    <input type="refCode" name="refCode" hidden value={refCode} />
                    <div className="form-group">
                        <label htmlFor="firstWeek">First week of semester:</label>
                        <input
                            type="week"
                            name="firstWeek"
                            id="firstWeek"
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group my-3">
                        <label>Lecture days:</label>
                        {days.map((day, index) => (
                            <div key={index} className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name={`${day}Check`}
                                    id={`${day}Check`}
                                    checked={isChecked[day]}
                                    onChange={(e) => handleCheckChange(e, day)}
                                />
                                <label className="form-check-label" htmlFor={`${day}Check`}>
                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                </label>
                                {isChecked[day] && (
                                    <div className="form-row day-times">
                                        <div className="col-12 mt-1">
                                            <input
                                                type="time"
                                                id={`${day}Start`}
                                                name={`${day}Start`}
                                                className="form-control"
                                                placeholder="Start time"
                                            />
                                        </div>
                                        <div className="col-12 mt-1">
                                            <input
                                                type="time"
                                                id={`${day}End`}
                                                name={`${day}End`}
                                                className="form-control"
                                                placeholder="End time"
                                            />
                                        </div>
                                        <div className="col-12 mt-1">
                                            <input
                                                type="text"
                                                id={`${day}Room`}
                                                name={`${day}Room`}
                                                className="form-control"
                                                placeholder="Classroom"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="form-group">
                        <label htmlFor="numWeeks">Number of weeks in the semester:</label>
                        <input
                            type="number"
                            min="1"
                            max="19"
                            id="numWeeks"
                            name="numWeeks"
                            className="form-control"
                            required
                        />
                    </div>
                    <button type="submit" className="btn cardBTN mt-2">
                        Generate Schedule
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SetLectures;
