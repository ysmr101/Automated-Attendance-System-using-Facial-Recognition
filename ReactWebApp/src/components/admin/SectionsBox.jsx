import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Link } from 'react-router-dom';

export default function SectionsBox() {

  const [sectionCode, setSectionCode] = useState("");

  const handleSectionCodeChange = (e) => {
    setSectionCode(e.target.value);
  };
  const [isLoading, setIsLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const [errors, setErrors] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [Sections, setSections] = useState([]);




  const [filteredSections, setFilteredSections] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    let isMounted = true;

    const getSections = async () => {
      try {
        const response = await axiosPrivate.get("/getSections");
        if (isMounted) {
          setIsLoading(false);
          setSections(response.data);
          setFilteredSections(response.data); 
        }
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    getSections();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const results = Sections.filter((section) =>
      String(section.refCode).toLowerCase().includes(sectionCode.toLowerCase())
    );
    setFilteredSections(results);
  }, [sectionCode, Sections]); // added Sections here



  return (
    <div className="card bg-light rounded mb-5 " style={{ boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}>
      <div className="p-4">
        <h3 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Sections</h3>
        <form className="d-flex mb-3">
          <input
            className="form-control me-2"
            type="search"
            placeholder="Search by Section RefCode"
            value={sectionCode}
            onChange={handleSectionCodeChange}
            style={{ borderRadius: '25px', paddingLeft: '20px' }}
          />
        </form>
      </div>
      <div className="card-body p-4" style={{ height: '15rem', overflowY: 'auto', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
        <ul className="list-group">
          {filteredSections.length === 0 ? (
            <li className="list-group-item">No Sections Available</li>
          ) : (
            filteredSections.slice(0, 6).map((section, index) => (
              <Link
                to={`/section?refCode=${section.refCode}&courseName=${section.courseName}&sectionNum=${section.sectionNum}`}
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center my-custom-list-item"
                style={{ backgroundColor: '#ffffff', borderRadius: '10px', marginBottom: '10px' }}
              >
                <span className="section-info" style={{ fontSize: '1.1rem' }}>{`${section.courseName} (${section.sectionNum})`}</span>
                <span className="section-ref badge badge-secondary badge-pill" style={{ padding: '8px 12px' }}>{`Ref: ${section.refCode}`}</span>
              </Link>
            ))
          )}
        </ul>
      </div>
    </div>

  )
}
