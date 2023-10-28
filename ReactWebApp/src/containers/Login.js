import "../css/Login.css";
import React, { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logoImage from "../assets/faceattend-logo.png";
import {
  faIdCard,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const LOGIN_URL = "/login";

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const userRef = useRef();
  const errRef = useRef();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [userId, password]);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (userId === "" || password === "") {
        setErrMsg("Missing user id or password");
        return;
      }
      setIsLoading(true);
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ id: userId, password }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const accessToken = response?.data?.accessToken;
      const role = response?.data?.role;
      console.log(role);
      setIsLoading(false);
      setAuth({ userId, password, role, accessToken });
      setUserId("");
      setPassword("");
      navigate(`/${role}`, { replace: true });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      if (!error?.response) {
        setErrMsg("No Server Response");
      } else {
        setErrMsg(
          error.response.data.error || "An error occurred during login"
        );
      }
      errRef.current.focus();
    }
  };

  return (
    <div className="login-container">
      {" "}
      {/* This is the new overall container */}
      <div className="logo-container">
        <img src={logoImage} alt="Logo" className="logo-class" />
      </div>
      <div className="signin-form">
        <form onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <div ref={errRef}>
            {errMsg && typeof errMsg === "string" && (
              <div className="alert alert-danger">{errMsg}</div>
            )}
          </div>
          {isLoading && (
            <div className="loader">
              <div className="spinner"></div>
            </div>
          )}
          <div className="form-group">
            <div className="input-wrapper">
              <FontAwesomeIcon icon={faIdCard} className="input-icon" />
              <input
                type="text"
                className="form-control input-field"
                id="id"
                ref={userRef}
                onChange={(e) => setUserId(e.target.value)}
                value={userId}
                placeholder="ID"
              />
            </div>
          </div>

          <div className="form-group">
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
                className="form-control input-field"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Password"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg col-12"
            >
              Sign in
            </button>
          </div>

          <Link className="link link-primary" to="/passwordResetPage">
            Forgot your password?
          </Link>
        </form>
        <div className="text-center text-dark" style={{ marginTop: "15px" }}>
          Don't have an account?{" "}
          <Link className="link link-primary" to="/register">
            register
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
