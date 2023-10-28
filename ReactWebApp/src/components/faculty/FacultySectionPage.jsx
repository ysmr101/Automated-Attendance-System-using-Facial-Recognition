import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import LectureItem from "./LectureItem";
import logoImage from '../../assets/faceattend-logo.png';

function LectureList() {
  //________________________________________________

  const [lectures, setLectures] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  const refCode = new URLSearchParams(useLocation().search).get("refCode");
  const courseName = new URLSearchParams(useLocation().search).get(
    "courseName"
  );
  const sectionNum = new URLSearchParams(useLocation().search).get(
    "sectionNum"
  );

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true);
    const getSelections = async () => {
      try {
        const response = await axiosPrivate.get(
          `/getFacultyLectureList`,
          {
            params: {
              refCode: refCode,
            },
          },
          {
            signal: controller.signal,
          }
        );
        console.log(response.data);
        if (isMounted) setLectures(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    getSelections();
    setIsLoading(false);
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [axiosPrivate, refCode]);

  const [isLoading, setIsLoading] = useState(false);


  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <img src={logoImage} alt="logo" className="logo" />
            <Link to={"/student"} className="nav-btn" title="Home">
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </div>
        </div>
      </header>

      <div className="container my-5">
        <div
          className="mt-4 mb-4 text-color"
          style={{
            borderRadius: "10px",
            border: "1px solid #ccc",
            padding: "15px",
          }}
        >
          <h3>{courseName}</h3>
          <p>
            Section Number: {sectionNum}
            <br />
            Section refcode: {refCode}
          </p>
        </div>

        {lectures.length === 0 ? (
          <div className="text-center">
            No lectures <hr />{" "}
          </div>
        ) : (
          <div></div>
        )}
        <div className="list-group">
          {isLoading ? (
            <div className="loader">
              <div className="spinnerContainer">
                <div className="spinner"></div>
              </div>
            </div>
          ) : (
            <div> </div>
          )}
          {lectures.map((lecture, index) => (
            <LectureItem key={index} lecture={lecture} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default LectureList;
