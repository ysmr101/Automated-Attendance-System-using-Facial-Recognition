import "../css/Login.css";
import React, { useRef, useState, useEffect } from "react";
import axios from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import PwdResetCode from "../components/PwdResetCode";

export default function PasswordResetPage() {
  const userRef = useRef();
  const errRef = useRef();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userId, setUserId] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState()

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      if (userId === "") {
        setErrMsg("Missing user id");
        return;
      }

      const response = await axios.post(
        "forgotPassword/userId",
        JSON.stringify({ id: userId }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setIsLoading(false);
      setUserEmail(response?.data)
      setShowConfirmation(true)
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      if (!error?.response) {
        setErrMsg("No Server Response");
      } else {
        setErrMsg(
          error.response.data.error || "An error occurred"
        );
      }
      errRef.current.focus();
    }
  };

  return (
    <div className="Lbody">
      <div className="signin-form">
        {showConfirmation && (
          <PwdResetCode
            showConfirmation={showConfirmation}
            setShowConfirmation={setShowConfirmation}
            email={userEmail}
            userId={userId}
          />
        )}

        {isLoading && (
          <div className="loader">
            <div className="spinner"></div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div ref={errRef}>
            {errMsg && typeof errMsg === "string" && (
              <div className="alert alert-danger">{errMsg}</div>
            )}
          </div>
          <h5>Enter your user id</h5>
          <div className="form-group mt-3">
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
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg col-12"
            >
              Send code
            </button>
          </div>
        </form>
        <div className="text-center text-dark" style={{ marginTop: "15px" }}>
          Login page{" "}
          <Link className="link link-primary" to="/login">
            login
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
