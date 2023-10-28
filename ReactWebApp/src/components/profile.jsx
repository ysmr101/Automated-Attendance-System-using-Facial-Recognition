import React, { useState, useEffect } from "react";
import useLogout from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

function ProfilePage({ user }) {

    const [name, setName] = useState(user.name);
    const [editing, setEditing] = useState(false);
    const [oldName, setOldName] = useState(user.name);
    const navigate = useNavigate();
    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

    const [CurrentPwd, setCurrentPwd] = useState("");

    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);
    const [pwd, setPwd] = useState("");

    const [matchPwd, setMatchPwd] = useState("");
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [passwordErrMsg, setPasswordErrMsg] = useState("");
    const [passwordMsg, setPasswordMsg] = useState("");


    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd]);


    const logout = useLogout()
    const axiosPrivate = useAxiosPrivate();

    const signOut = async () => {
        await logout()
        navigate('/login')
    }

    const handleEdit = () => {
        setEditing(true);
    };

    const handleConfirm = async () => {

        try {
            if (name.length < 4) {
                return;
            }

            const response = await axiosPrivate.post('/EditData',
                JSON.stringify({ name }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );
            console.log(response?.data)
            setEditing(false);
            setOldName(name);

        } catch (error) {
            console.error(error);

        }

        setEditing(false);

    };

    const handlePasswordChange = async () => {

        if (!validPwd || !validMatch) {
            setPasswordErrMsg("Invalid Entry");
            return;
        }

        try {

            const response = await axiosPrivate.post('/ChangeUserPassword',
                JSON.stringify({ CurrentPwd, pwd }),
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            setPasswordMsg(response?.data)
            setPasswordErrMsg("")
        } catch (error) {
            if (!error?.response) {
                setPasswordErrMsg("No Server Response");
            } else {
                setPasswordErrMsg(
                    error.response.data.error || "An error occurred"
                );

            }
            setPasswordMsg("")
        }
    }




    const handleCancel = () => {
        setEditing(false);
        setName(oldName);
    };

    return (
        <div className="mt-5">
            <div className="row d-flex justify-content-center align-items-center py-5 m-1">
                <div className="card border p-3 mb-5 bg-white rounded col-12" >
                    <div className="card-body">

                        <div className="row mt-4">
                            <div className="col-sm-3">
                                <h6 className="mb-0">Full Name</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                                <input type="text" className="form-control" id="Name" disabled={!editing} value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <h6 className="mb-0">Email</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                                <input type="email" className="form-control" id="email" disabled value={user.email} />
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-3">
                                <h6 className="mb-0">Student number</h6>
                            </div>
                            <div className="col-sm-9 text-secondary">
                                <input type="text" className="form-control" id="StdId" disabled value={user.id} />
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-sm-12">
                                {editing ? (
                                    <>
                                        <button className="btn cardBTN m-1" type="button" onClick={handleConfirm}>Confirm</button>
                                        <button className="btn cancel m-1" type="button" onClick={handleCancel}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="btn cardBTN m-1" type="button" onClick={handleEdit}>Edit</button>
                                )}
                            </div>
                        </div>

                        <hr />
                        <div>
                            {passwordErrMsg && <div className="alert alert-danger">{passwordErrMsg}</div>}
                        </div>
                        <div>
                            {passwordMsg && <div className="alert alert-success">{passwordMsg}</div>}
                        </div>
                        <div className="mb-3 row">
                            <h6 className="col-sm-3 col-form-label">Current Password</h6>
                            <div className="col-sm-9">
                                <input
                                    type="password"
                                    className="form-control"
                                    onChange={(e) => setCurrentPwd(e.target.value)}
                                    id="currentPassword"
                                    placeholder="Current Password" />
                            </div>
                        </div>
                        <hr />
                        <div className="mb-3 row">
                            <h6 className="col-sm-3 col-form-label">New password</h6>
                            <div className="col-sm-9">
                                <div className="input-wrapper">

                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Password"
                                        className="form-control"
                                        onChange={(e) => setPwd(e.target.value)}
                                        value={pwd}
                                        required
                                        aria-invalid={validPwd ? "false" : "true"}
                                        aria-describedby="pwdnote"
                                        onFocus={() => setPwdFocus(true)}
                                        onBlur={() => setPwdFocus(false)}
                                    />
                                </div>
                            </div>
                            <p
                                id="pwdnote"
                                className={pwdFocus && !validPwd ? "instructions" : "offscreen"}
                            >
                                <FontAwesomeIcon icon={faInfoCircle} />
                                8 to 24 characters.
                                <br />
                                Must include uppercase and lowercase letters, a number and a
                                special character.
                                <br />
                                Allowed special characters:{" "}
                                <span aria-label="exclamation mark">!</span>{" "}
                                <span aria-label="at symbol">@</span>{" "}
                                <span aria-label="hashtag">#</span>{" "}
                                <span aria-label="dollar sign">$</span>{" "}
                                <span aria-label="percent">%</span>
                            </p>
                        </div>
                        {/*Confirm password */}
                        <hr />
                        <div className="mb-3 row">
                            <h6 className="col-sm-3 col-form-label">Confirm new password</h6>
                            <div className="col-sm-9">
                                <div className="input-wrapper">


                                    <input
                                        type="password"
                                        id="confirm_pwd"
                                        placeholder="Confirm Password"
                                        className="form-control"
                                        onChange={(e) => setMatchPwd(e.target.value)}
                                        value={matchPwd}
                                        required
                                        aria-invalid={validMatch ? "false" : "true"}
                                        aria-describedby="confirmnote"
                                        onFocus={() => setMatchFocus(true)}
                                        onBlur={() => setMatchFocus(false)}
                                    />
                                </div>
                            </div>
                            <p
                                id="confirmnote"
                                className={
                                    matchFocus && !validMatch ? "instructions" : "offscreen"
                                }
                            >
                                <FontAwesomeIcon icon={faInfoCircle} />
                                password dose not match.
                            </p>
                        </div>
                        <hr />

                        <div className="mt-3 row">
                            <div className="col-sm-12">
                                <button type="button" onClick={handlePasswordChange} className="btn cardBTN">Change</button>
                            </div>
                        </div>

                        <hr />
                        <div className="row justify-content-center mt-5">
                            <button onClick={signOut} className="col-11 btn btn-outline-danger m-1">Log out</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
