import '../css/ConfirmationCode.css';
import axios from '../api/axios';
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ConfirmationCode({ showConfirmation, setShowConfirmation, email, userId }) {
  const [codes, setCodes] = useState(Array(6).fill(''));

  const inputs = Array(6).fill().map(() => React.createRef());
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (position) => {
    return (event) => {
      if (event.target.value.length === 1 && position < inputs.length - 1) {
        inputs[position + 1].current.focus();
      }
      let newCodes = [...codes];
      newCodes[position] = event.target.value;
      setCodes(newCodes);
    };
  };


  const handleClear = () => {
    setCodes(Array(6).fill(''));
    inputs[0].current.focus();
  };

  const handleClose = () => {
    setShowConfirmation(false);
  };

  const ConfirmCode_URL = "/confirm-account";

  const handleCodeSubmet = async (e) => {
    if (!codes.every(code => /^\d+$/.test(code))) {
      setErrMsg("missing digits");
      return;
    } else if (codes.length === 6) {
      setErrMsg("");

      try {
        const response = await axios.post(ConfirmCode_URL, { codes, userId });

        if (response.status === 200) {
          navigate('/login')
        } else {
          setErrMsg(response.data.errors.join(', '));
        }

      } catch (err) {

        if (!err.response) {
          setErrMsg("Registration Failed");
        } else {
          setErrMsg(err.response.data.errors.join(', '));
        }

      }
    }
    else {
      setErrMsg("Make sure that it is all digits and 6 digits long");
    }


  }

  return showConfirmation ? (
    <div className="blurry-background">
      <div className="confirmation-box col-12 col-sm-10 col-md-6 col-xl-4 col-xxl-3">
        <div>
          {errMsg && <div className="alert alert-danger">{errMsg}</div>}
        </div>
        <h4 >Enter Confirmation Code
          <span className="close-button" onClick={handleClose}>X</span>
        </h4>
        <p className='mb-5'>email sent to <span style={{ color: 'blue' }}>{email}</span></p>
        <div className="digit-group">
          {inputs.map((inputRef, i) => (
            <input
              key={i}
              type="number"
              inputMode="numeric"
              maxLength="1"
              className="code-input"
              ref={inputRef}
              onChange={handleInputChange(i)}
              value={codes[i]}
            />
          ))}
        </div>
        <a className='link-primary m-3 ' onClick={handleClear}>clear</a><br />
        <br />
        <button onClick={handleCodeSubmet} className="btn btn-primary m-1 col-10">Confirm</button>



      </div>
    </div>
  ) : null;
}