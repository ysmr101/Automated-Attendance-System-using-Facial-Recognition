import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

export default function AddAttendanceDeviceInfo() {

    const axiosPrivate = useAxiosPrivate();

    const [classRoomNumber, setClassRoomNumber] = useState()
    const [password, setPassword] = useState()
    const [ErrMsg, setErrMsg] = useState('')
    const [Msg, setMsg] = useState('')

    const handleAddDeviceInfo = async () => {
        console.log(classRoomNumber)
        console.log(password)
        try {
            const response = await axiosPrivate.post("/addDeviceInfo", JSON.stringify({ classRoomNumber, password }),
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
            <h3 className="mb-4">Add Device Information</h3>

            <div>
                {ErrMsg && <div className="alert alert-danger">{ErrMsg}</div>}
            </div>
            <div>
                {Msg && <div className="alert alert-success">{Msg}</div>}
            </div>

            <div className="form-group">
                <label htmlFor="classRoomNumber">
                    Classroom Number:
                </label>
                <input
                    className="form-control"
                    name="classRoomNumber"
                    pattern="\d{5}"
                    id="classRoomNumber"
                    placeholder="Classroom Number"
                    onChange={(e) => setClassRoomNumber(e.target.value)}
                    required
                />
            </div>
            <hr />
            <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                    className="form-control"
                    id="password"
                    type="password"
                    pattern="\d{3}"
                    name="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <hr />
            <br /><br />
            <div className="modal-footer">
                <button type="button" onClick={handleAddDeviceInfo} className="btn cardBTN col-12">
                    Add Device info
                </button>
            </div>
            <br />
            <br />
        </div>
    )
}