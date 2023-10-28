import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import React from 'react';
import { Link } from 'react-router-dom';

export default function FacultySectionCard() {

  const [sections, setSections] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setIsLoading(true)
    const getSections = async () => {
      try {
        const response = await axiosPrivate.get("/getFacultySections", {
          signal: controller.signal,
        });
        console.log(response.data);
        if (isMounted) setSections(response.data);
      } catch (err) {
        console.error(err);
      }
    }


    getSections();
    setIsLoading(false)
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [axiosPrivate]);

  return (
    <div>
      {!isLoading ? (
        sections.length > 0 ?
          <div className='row d-flex align-items-center mb-3 justify-content-left'>
            {sections.map((section) => (
              <div key={section.ref} className="col-12 col-md-6 col-lg-4 col-xxl-3">
                {/* Shows the section info page, week 1,2,3... */}
                <Link to={`/SectionPage?refCode=${section.refCode}&courseName=${section.courseName}&sectionNum=${section.sectionNum}`} className="card-button text-decoration-none">
                  <div className="card rounded-3 shadow-sm hcolor mb-3">
                    <div className="card-body card-button">
                      <h5 className="card-title mb-3">{section.courseName}</h5>
                      <p className="card-text mb-1">
                        <small>Section Number:</small>
                        {section.sectionNum}
                      </p>
                      <p className="card-text">
                        <small>Ref Code:</small>
                        {section.refCode}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          :
          <div className='row d-flex align-items-center mb-3 justify-content-center'>No sections available.</div>
      ) : <div className="loader">
        <div className="spinner"></div>
      </div>}
    </div>
  );
}
