import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export default function AddSectionBox() {

    const axiosPrivate = useAxiosPrivate();
    const [courseName, setCourseName] = useState()
    const [sectionRefCode, setRefCode] = useState()
    const [sectionNumber, setSectionNum] = useState()
    const [ErrMsg, setErrMsg] = useState('')
    const [Msg, setMsg] = useState('')

    const handleAddSection = async () => {
        try {
            const response = await axiosPrivate.post("/addSection", JSON.stringify({ courseName, sectionRefCode, sectionNumber }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            console.log(response.data);
            setMsg(response.data)
            setErrMsg('')
        } catch (err) {
            console.error(err);
            setErrMsg(err.response.data)
            setMsg('')

        }
    };

    return (
        <div className="card bg-light rounded mb-5 p-4 mx-1" style={{ boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}>
            <h3 className="mb-4">Add section</h3>

            <div>
                {ErrMsg && <div className="alert alert-danger">{ErrMsg}</div>}
            </div>
            <div>
                {Msg && <div className="alert alert-success">{Msg}</div>}
            </div>
            <div className="form-group">
                <label htmlFor="courseName">Course Name:</label>
                <input
                    type="text"
                    className="form-control"
                    name="courseName"
                    id="courseName"
                    placeholder="Enter Course name"
                    onChange={(e) => setCourseName(e.target.value)}
                    required
                />
            </div>
            <hr />
            <div className="form-group">
                <label htmlFor="sectionRefCode">
                    Section refernce code:
                </label>
                <input
                    className="form-control"
                    name="sectionRefCode"
                    pattern="\d{5}"
                    id="sectionRefCode"
                    placeholder="Enter section refCode"
                    onChange={(e) => setRefCode(e.target.value)}
                    required
                />
            </div>
            <hr />
            <div className="form-group">
                <label htmlFor="sectionNumber">Section number:</label>
                <input
                    className="form-control"
                    id="sectionNumber"
                    pattern="\d{3}"
                    name="sectionNumber"
                    placeholder="Enter section number"
                    onChange={(e) => setSectionNum(e.target.value)}
                    required
                />
            </div>
            <hr />
            <div className="modal-footer">
                <button type="button" onClick={handleAddSection} className="btn cardBTN col-12">
                    Add section
                </button>
            </div>
        </div>
    )
}
