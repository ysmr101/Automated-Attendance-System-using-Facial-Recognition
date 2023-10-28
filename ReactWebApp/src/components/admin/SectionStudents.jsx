import Swal from 'sweetalert2';
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome } from '@fortawesome/free-solid-svg-icons'
import { useLocation } from 'react-router-dom';
import logoImage from '../../assets/faceattend-logo.png';



const SectionStudents = () => {

    const axiosPrivate = useAxiosPrivate();
    const refCode = new URLSearchParams(useLocation().search).get('refCode');
    const [call, setCall] = useState(true);
    const [studentIds, setStudentIds] = useState('');


    // Dummy data for lectures using useState
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    const removeStudent = (student) => {
        Swal.fire({
            title: `Student:`,
            text: `ID: ${student.id}, name: ${student.name}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#1F2833',
            confirmButtonText: 'Yes, remove it!'
        }).then(async (result) => {
            if (result.isConfirmed) {

                await axiosPrivate.post("/removeStudentFromSection", JSON.stringify({ student, refCode }));
                setCall(!call)


            }
        }).catch((error) => {
            console.error(error);
        });
    };

    const AddStudents = async () => {

        try {
            const response = await axiosPrivate.post("/addStudents", JSON.stringify({ studentIds, refCode }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            console.log(response.data);
            setCall(!call)
        } catch (err) {
            console.error(err);

        }
    }
    useEffect(() => {
        setIsLoading(true);
        let isMounted = true;

        const getStudents = async () => {
            try {
                const response = await axiosPrivate.get("/getStudents", { params: { refCode } });
                if (isMounted) {
                    setStudents(response.data);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error(err);
                setIsLoading(false);
            }
        };

        getStudents();

        return () => {
            isMounted = false;
        };
    }, [call, axiosPrivate, refCode]);

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



                <div className="row">
                    <div className="col-md-12">
                        <h3 className='mt-2'>Add Students</h3>

                        <div className="form-group">
                            <label htmlFor="studentsId">
                                Student ID <br />
                                You can add multiple students just separate ID by ','
                            </label>
                            <textarea
                                name="studentsId"
                                id="studentsId"
                                cols="30"
                                rows="10"
                                type="text"
                                className="form-control"
                                placeholder="440016617,440011111,etc..."
                                onChange={e => setStudentIds(e.target.value)}
                            />
                        </div>
                        <button type='button' onClick={AddStudents} className="btn cardBTN mt-3">Add Students</button>

                    </div>
                </div>
                <div className="row mt-5">
                    <div className="col-md-12">
                        <h2>Students List</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Name</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={() => removeStudent(student)}
                                            >
                                                Remove student
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>

        </div>
    );
};

export default SectionStudents;
