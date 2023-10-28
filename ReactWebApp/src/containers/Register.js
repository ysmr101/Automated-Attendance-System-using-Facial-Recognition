import React, { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import "../css/Register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConfirmationCode from "../components/ConfirmationCode";
import { Link } from "react-router-dom";
import logoImage from "../assets/faceattend-logo.png";
import {
  faUser,
  faIdCard,
  faEnvelope,
  faLock,
  faCheck,
  faInfoCircle,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const USERName_REGEX = /^[a-zA-Z ]{4,70}$/;
const USERId_REGEX = /^[1-9][0-9]{4,9}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const email_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REGISTER_URL = "/register";

function Register() {
  const userRef = useRef();
  const errRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [fullName, setFullName] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [uid, setId] = useState("");
  const [validId, setValidID] = useState(false);
  const [idFocus, setIDFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setvalidEmail] = useState(false);

  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);
  const [pwd, setPwd] = useState("");

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [userType, setUserType] = useState("student");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setValidName(USERName_REGEX.test(fullName));
  }, [fullName]);

  useEffect(() => {
    setValidID(USERId_REGEX.test(uid));
  }, [uid]);

  useEffect(() => {
    setvalidEmail(email_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [fullName, pwd, matchPwd]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRadioChange = (event) => {
    setUserType(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validName || !validPwd || !validId || !validEmail || !validMatch) {
      setErrMsg("Invalid Entry" + validEmail);
      return;
    }
    try {
      setErrMsg("");
      setIsLoading(true);
      const response = await axios.post(REGISTER_URL, {
        fullName,
        id: uid,
        email,
        password: pwd,
        userType,
      });
      if (response.data.success) {
        setShowConfirmation(true);
        console.log(showConfirmation);
      } else {
        setErrMsg(response.data.message);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);

      if (!err?.response) {
        setErrMsg("No Server Response");
        console.log(err);
      } else if (err.response?.status === 500 || err.response?.status === 400) {
        if (err.response.data && err.response.data.errors) {
          setErrMsg(err.response.data.errors.join(", "));
        } else {
          setErrMsg("ID used");
        }
      } else {
        setErrMsg("Registration Failed");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="logo-class" />
      </div>

      <div className="signup-form">
        {showConfirmation && (
          <ConfirmationCode
            showConfirmation={showConfirmation}
            setShowConfirmation={setShowConfirmation}
            email={email}
            userId={uid}
          />
        )}

        {isLoading && (
          <div className="loader">
            <div className="spinner"></div>
          </div>
        )}

        <form method="POST" action="/register" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <p className="lead">Welcome to IMAMU Attendance System</p>
          <div>
            {errMsg && <div className="alert alert-danger">{errMsg}</div>}
          </div>
          {/* fullname */}
          <div className="form-group">
            <div className="input-group">
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faUser} className="input-icon" />

                <input
                  type="text"
                  className="form-control input-field"
                  name="fullName"
                  id="fullName"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  ref={userRef}
                  onFocus={() => setUserFocus(true)}
                  onBlur={() => setUserFocus(false)}
                />
              </div>
            </div>

            <p
              id="uNamenote"
              className={
                userFocus && fullName && !validName
                  ? "instructions"
                  : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              4 to 24 characters.
              <br />
            </p>
          </div>
          {/* id */}
          <div className="form-group">
            <div className="input-group">
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faIdCard} className="input-icon" />

                <input
                  type="text"
                  className="form-control input-field"
                  name="uid"
                  id="uid"
                  placeholder="ID"
                  value={uid}
                  onChange={(e) => setId(e.target.value)}
                  onFocus={() => setIDFocus(true)}
                  onBlur={() => setIDFocus(false)}
                />
              </div>
            </div>
            <p
              id="uidnote"
              className={
                idFocus && uid && !validId ? "instructions" : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              starts with non-zero <br></br>
              5 to 10 digits.
              <br />
            </p>
          </div>
          {/* email */}

          <div className="form-group">
            <div className="input-group">
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faEnvelope} className="input-icon" />

                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="form-control input-field"
                  name="email"
                  id="email"
                  placeholder="Email"
                />
              </div>
            </div>
          </div>
          {/* password */}
          <div className="form-group">
            <div className="input-group">
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <div
                  className="toggle-password-icon"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon
                    className="check-icon"
                    icon={showPassword ? faEyeSlash : faEye}
                  />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  className="form-control input-field"
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
          <div className="form-group">
            <div className="input-group">
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <FontAwesomeIcon icon={faCheck} className="input-icon" />

                <input
                  type={showPassword ? "text" : "password"}
                  id="confirm_pwd"
                  placeholder="Confirm Password"
                  className="form-control input-field"
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

          <div className="form-check">
            <input
              type="radio"
              className="form-check-input"
              id="radio1"
              name="userType"
              value="student"
              checked={userType === "student"}
              onChange={handleRadioChange}
              defaultChecked
            />
            <label className="form-check-label" htmlFor="radio1">
              Student
            </label>
          </div>
          <div className="form-check">
            <input
              type="radio"
              className="form-check-input"
              id="radio2"
              name="userType"
              value="faculty"
              checked={userType === "faculty"}
              onChange={handleRadioChange}
            />
            <label className="form-check-label" htmlFor="radio2">
              Faculty Member
            </label>
          </div>
          <br />
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg col-12"
            >
              Sign Up
            </button>
          </div>
        </form>
        <div className="text-center text-dark">
          Already have an account? <Link to="/login">login</Link>.
        </div>
      </div>
    </div>
  );
}

export default Register;
