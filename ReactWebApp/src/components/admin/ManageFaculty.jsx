import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import logoImage from '../../assets/faceattend-logo.png';

const ManageFaculty = () => {

    const axiosPrivate = useAxiosPrivate();
    const refCode = new URLSearchParams(useLocation().search).get("refCode");
    const [call, setCall] = useState(true);
    const [Msg, setMsg] = useState('')
    const [ErrMsg, setErrMsg] = useState('')
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [facultyId, setFacultyId] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const AssignFaculty = async (event) => {
        event.preventDefault();
        try {
            const response = await axiosPrivate.post(
                "/assignFaculty",
                JSON.stringify({ facultyId, refCode }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            console.log(response.data);
            setMsg("Faculty member assigned successfully!");
            setErrMsg('')
            setCall(!call);
        } catch (err) {
            console.error(err);
            setErrMsg("Error while assigning the faculty member")
            setMsg('')
        }
    };

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

            <div className="container my-2">

                {Msg && <div className="alert alert-success">{Msg}</div>}
                {ErrMsg && <div className="alert alert-danger">{ErrMsg}</div>}
                <div className="form-group">
                    <label htmlFor="facultyId">
                        Faculty Member ID <br />
                    </label>
                    <textarea
                        name="facultyId"
                        id="facultyId"
                        cols="30"
                        rows="10"
                        type="text"
                        className="form-control"
                        placeholder="Faculty Member ID"
                        onChange={(e) => setFacultyId(e.target.value)}
                    />
                </div>
                <button
                    type="button"
                    onClick={AssignFaculty}
                    className="btn cardBTN mt-3"
                >
                    Assign Faculty Member
                </button>

            </div>
        </div>
    );
};

export default ManageFaculty;