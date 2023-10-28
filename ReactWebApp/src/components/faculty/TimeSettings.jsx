import React, { useState, useEffect } from 'react';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const TimeSettings = () => {
  const [lateTime, setLateTime] = useState('');
  const [absentTime, setAbsentTime] = useState('');
  const [Msg, setMsg] = useState('')
  const [ErrMsg, setErrMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();


  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true)

    const getTimes = async () => {
      try {
        const response = await axiosPrivate.get(`/getFacultyTimes`,
          {
            signal: controller.signal,
          });
        if (isMounted) {

          if (isMounted) {
            setLateTime(response.data.date.late);
            setAbsentTime(response.data.date.absent);
          }

        }
      } catch (err) {
        console.error(err);
      }

    }
    getTimes();


    setIsLoading(false)
    return () => {
      isMounted = false;
      controller.abort();
    };

  }, [axiosPrivate]);

  const handleSubmit = async () => {
    const parsedLateTime = parseInt(lateTime, 10);
    const parsedAbsentTime = parseInt(absentTime, 10);

    if (!Number.isInteger(parsedLateTime) || !Number.isInteger(parsedAbsentTime) || parsedLateTime >= 100 || parsedAbsentTime >= 100) {
      setErrMsg("Both Late Time and Absent Time should be integers less than 100.");
      return;
    }

    try {
      const response = await axiosPrivate.post('/setPreferredTimes', {
        lateTime: parsedLateTime,
        absentTime: parsedAbsentTime
      });

      if (response.data.success) {
        setMsg('Times updated successfully');
        setErrMsg('');
      } else {
        setErrMsg(response.data.message || 'Error updating time settings');
        setMsg('');
      }
    } catch (error) {
      console.error(error);
      setMsg('');
      setErrMsg('Error updating time settings');
    }
  };




  return (
    <div className="card text-center my-5">
      <div className="card-header">
        <h4>Time Settings</h4>
      </div>
      <div className="card-body">
        <form>
          <div>
            <div class="info-box">
              <h4>Attendance Rules Summary:</h4>
              <p>
                <strong>Present:</strong> Students who arrive on time or within a grace period (less than {lateTime} minutes late).<br />
                {lateTime < absentTime ? <div><strong>Late:</strong> Students arriving {lateTime} minutes after the start are marked as "late"<br /></div> : <div></div>}
                <strong>Absent:</strong> Those who are either more than {absentTime} minutes late or miss the lecture entirely. <br />
                If the 'Late' and 'Absent' values are set to the same value, students arriving past this point will be considered absent, eliminating the option for a 'late' status.
              </p>

            </div>

          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="lateTime">Late Time (minutes)</label>
                <input
                  type="number"
                  className="form-control"
                  id="lateTime"
                  value={lateTime}
                  onChange={(e) => setLateTime(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="absentTime">Absent Time (minutes)</label>
                <input
                  type="number"
                  className="form-control"
                  id="absentTime"
                  value={absentTime}
                  onChange={(e) => setAbsentTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button type="button" className="col-11 btn cardBTN my-3" onClick={handleSubmit}>
            Set Times
          </button>
          {Msg && <div className="alert alert-success">{Msg}</div>}
          {ErrMsg && <div className="alert alert-danger">{ErrMsg}</div>}
        </form>
      </div>
    </div>
  );
};

export default TimeSettings;
