import React from "react";


const FacultyCard = ({ user }) => {
 


  return (
    <div className="container mt-5 mb-5">
      <div className="row d-flex justify-content-center align-items-center">
        <div className="card border-0 rounded-3 p-4" style={{ backgroundColor: 'var(---body-bg-color)', color: 'var(--cardProfile-text-color)' }}>

         

          <div className="card-body">
            <div className="d-flex flex-column align-items-center text-center">
             
              <div className="mt-3">
                <h3 className="font-weight-bold">
                  Welcome {user && user.name}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyCard;
