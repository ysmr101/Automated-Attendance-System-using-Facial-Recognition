import { Link } from 'react-router-dom';

const LectureItem = ({ lecture, index }) => {
  
  const formatDate = (date) => {
    let d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  return (

    <Link to={`/LectureAttendance?refCode=${lecture.refCode}&date=${lecture.date}&startTime=${lecture.startTime}`} className="list-group-item list-group-item-action ">


      <div className="d-flex justify-content-between align-items-center text-color">
        <div>
          <h5 className="mb-1 ">Lecture {index + 1}: {lecture.name}</h5>
          <div>
            <span><strong>Date:</strong> {lecture.day}, {formatDate(lecture.date)}</span><br />
            <span><strong>Start:</strong> {lecture.startTime}, <strong>End:</strong> {lecture.endTime}</span>
          </div>
        </div>
      </div>

    </Link>
  );
}
export default LectureItem