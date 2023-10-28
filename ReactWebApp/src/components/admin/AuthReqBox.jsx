import React, { useState, useEffect } from "react";



export default function AuthReqBox() {

  const [authReqSearch, setAuthReqSearch] = useState("");


  const AuthRequests = [
    { name: "Request 1", id: "440016617" },
    { name: "Request 2", id: "440016616" },
  ];

  const [filteredAuthReqs, setFilteredAuthReqs] = useState(AuthRequests);


  useEffect(() => {
    const results = AuthRequests.filter((request) =>
      request.name.toLowerCase().includes(authReqSearch.toLowerCase())
    );
    setFilteredAuthReqs(results);
  }, [authReqSearch]);



  const handleAuthReqSearchChange = (e) => {
    setAuthReqSearch(e.target.value);
  };



  return (
    <div className="card bg-light rounded mb-5 " style={{ boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}>
      <div className="p-4">
        <h3 className="mb-4" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Authentication Requests</h3>
        <form className="d-flex mb-3">
          <input
            className="form-control me-2"
            type="search"
            placeholder="Search Auth Requests"
            value={authReqSearch}
            onChange={handleAuthReqSearchChange}
            style={{ borderRadius: '25px', paddingLeft: '20px' }}
          />

        </form>
      </div>
      <div className="card-body p-4" style={{ height: '15rem', overflowY: 'auto', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
        <ul className="list-group">
          {filteredAuthReqs.length === 0 ? (
            <li className="list-group-item">No Authentication Requests Available</li>
          ) : (
            filteredAuthReqs.slice(0, 6).map((request, index) => (
              <li
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center my-custom-student-item"
                style={{ backgroundColor: '#ffffff', borderRadius: '10px', marginBottom: '10px' }}
              >
                <span className="student-info" style={{ fontSize: '1.1rem' }}>{request.name}</span>
                <span className="student-id badge badge-primary badge-pill" style={{ padding: '8px 12px' }}>{`ID: ${request.id}`}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>

  )
}
