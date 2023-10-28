import React, { useState } from 'react';
import '../css/status.css';
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Circle from './Circle';
import Legend from './Legend';

function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toISOString().split('T')[0];
}



function OverallAverageLateTime({ sections }) {
    const totalLateTime = sections.reduce((acc, section) => acc + section.averageLateTime, 0);
    const average = totalLateTime / sections.length;

    return (
        <div className="overall-average-late-time">
            Overall Student Average  Late Time: <span>{average.toFixed(2)} minutes</span>
        </div>
    );
}

function AverageLateTime({ time }) {
    return (
        <div className="average-late-time">
            Average Late Time: <span>{time} minutes</span>
        </div>
    );
}

function LineContainer({ data }) {
    const [isMoreVisible, setMoreVisible] = useState(false);

    return (
        <div className="line-container">
            <h3>Course name: {data.courseName}</h3>
            <p>Section number: {data.section}</p>
            <AverageLateTime time={data.averageLateTime} />
            <StateList attendance={data.attendance} showMore={isMoreVisible} />
            <button className='btn btn-link' onClick={() => setMoreVisible(!isMoreVisible)}>
                {isMoreVisible ? 'Show Less' : 'Show More'}
            </button>
        </div>
    );
}

function StateList({ attendance, showMore }) {
    const stateMap = {
        'Absent': 'state1',
        'Late': 'state2',
        'Present': 'state3'
    };
    const toDisplay = showMore ? attendance : [attendance[0]];

    return (
        <div className="state-list">
            {toDisplay.map((entry, index) => (
                <div key={index} className="state-entry">
                    <span className={`state ${stateMap[entry.status]}`} data-state={entry.status}></span>
                    <span className="state-date">{formatDate(entry.date)}</span>
                    <span className="state-time">{entry.status}</span>
                </div>
            ))}
        </div>
    );
}

function StudentStatus() {
    const [sid, setSid] = useState("");
    const [studentAttendance, setStudentAttendance] = useState(null);
    const [errorMessage, setErrorMessage] = useState(""); // To display error messages
    const axiosPrivate = useAxiosPrivate();

    let absentPercentage = 0;
    let latePercentage = 0;
    let presentPercentage = 0;

    if (studentAttendance) {
        const totalEntries = studentAttendance.reduce((acc, course) => acc + course.attendance.length, 0);
        const absentCount = studentAttendance.reduce((acc, course) =>
            acc + course.attendance.filter(entry => entry.status === 'Absent').length
            , 0);
        const lateCount = studentAttendance.reduce((acc, course) =>
            acc + course.attendance.filter(entry => entry.status === 'Late').length
            , 0);
        const presentCount = totalEntries - absentCount - lateCount;

        absentPercentage = (absentCount / totalEntries) * 100;
        latePercentage = (lateCount / totalEntries) * 100;
        presentPercentage = (presentCount / totalEntries) * 100;

    }

    const handleQueryStudent = async () => {
        try {
            const response = await axiosPrivate.get(`/getStudentAttendanceStatus`, { params: { sid } });

            if (response.data.length === 0) {
                setErrorMessage("Invalid ID or no data available for this student");
                setStudentAttendance(null);
            } else {
                setErrorMessage("");
                setStudentAttendance(response.data);
            }
        } catch (err) {
            console.error("Failed to query student attendance:", err);
            setErrorMessage("An error occurred while fetching the data");
        }
    };
    const studentName = studentAttendance && studentAttendance[0].studentName;

    return (
        <>
            <div className="mb-3">
                <label htmlFor="studentQuery" className="form-label">
                    Query Student Attendance
                </label>
                <input
                    type="text"
                    className="form-control"
                    id="studentQuery"
                    placeholder="Enter student ID"
                    value={sid}
                    onChange={(e) => setSid(e.target.value)}
                />
                <button
                    className="btn cardBTN my-3"
                    onClick={handleQueryStudent}
                >
                    Query
                </button>
                {studentAttendance && (
                    <button
                        className="btn mx-2 cardBTN"
                        onClick={() => setStudentAttendance(null)}
                    >
                        Hide Info
                    </button>
                )}
            </div>
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            {studentAttendance && (
                <>
                    <hr />

                    <h3>{studentName}</h3>
                    <hr />
                    <Circle
                        absentPercentage={absentPercentage}
                        latePercentage={latePercentage}
                        presentPercentage={presentPercentage}
                    />
                    <Legend absentPercentage={absentPercentage} latePercentage={latePercentage} presentPercentage={presentPercentage} />
                    <OverallAverageLateTime sections={studentAttendance} />
                    {studentAttendance.map(dataItem => (
                        <LineContainer key={dataItem.section} data={dataItem} />
                    ))}
                </>
            )}
        </>
    );
}

export default StudentStatus;


