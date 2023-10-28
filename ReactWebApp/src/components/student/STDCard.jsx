import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axios from "axios";

const STDCard = ({ user }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [ImageErr, setImageErr] = useState(null);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [isGetPictureLoading, setIsGetPictureLoading] = useState(false);
  const [call, setCall] = useState(false);


  const axiosPrivate = useAxiosPrivate();
  const handleImageChange = (e) => {

    const file = e.target.files[0];
    setSelectedImage(file);
    const reader = new FileReader();

    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setIsModalOpen(true);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = null;
    }

  };
  useEffect(() => {
    setIsGetPictureLoading(true)
    let isMounted = true;
    const controller = new AbortController();

    const getPicture = async () => {

      try {
        const response = await axiosPrivate.get("/getStudentPicture", {
          responseType: 'blob',
          signal: controller.signal,
        });
        const imageUrl = URL.createObjectURL(response.data);
        isMounted && setProfilePicture(imageUrl);
        setIsGetPictureLoading(false)
      } catch (err) {
        setIsGetPictureLoading(false)
        if (!axios.isCancel(err)) {
          console.error(err);
        }
      }

    };

    getPicture();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [call, axiosPrivate]);


  const handleConfirmUpload = async () => {
    setImageErr(null); // Clear any existing errors
    console.log("Selected Image:", selectedImage); // Log the selected image

    if (!selectedImage) {
      setImageErr("No image selected.");
      console.error("No image selected.");
      return;
    }

    const controller = new AbortController();
    const formData = new FormData();
    formData.append('profile_pic', selectedImage); // 'profile_pic' should match the server's expected parameter name

    const formDataClone = new FormData();
    formDataClone.append('profile_pic', selectedImage);


    try {
      setIsUploadLoading(true)
      const response = await axiosPrivate.post("/addPicture", formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for sending files
        },
        signal: controller.signal,
        _clonedData: formDataClone,
      });

      console.log("Server response:", response);
      setIsUploadLoading(false)
      setCall(!call)
      setPreviewImage(null);
      setIsModalOpen(false);
    } catch (err) {
      setIsUploadLoading(false)
      setImageErr('Error, upload your picture again.');
      console.error(err);
    }
  };


  const handleCancelUpload = () => {
    // Reset the preview image and close the modal.
    setImageErr()
    setPreviewImage(null);
    setIsModalOpen(false);
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row d-flex justify-content-center align-items-center">
        <div className="card border-0 rounded-3 p-4" style={{ backgroundColor: 'var(---body-bg-color)', color: 'var(--cardProfile-text-color)' }}>

          {isModalOpen && (

            <div className="photo-confirmation-box">
              <div className="photo-confirmation-content">
                {isUploadLoading && (
                  <div className="loader">
                    <div className="spinnerContainer">
                      <div className="spinner"></div>
                    </div>
                  </div>
                )}
                <img src={previewImage} alt="Selected Image" />
                <div className="photo-confirmation-buttons">
                  <button className="confirm" onClick={handleConfirmUpload}>Confirm</button>
                  <button className="cancel" onClick={handleCancelUpload}>Cancel</button>
                </div>
                {ImageErr && <div className="alert alert-danger">{ImageErr}</div>}
              </div>
            </div>

          )}

          <div className="card-body">
            <div className="d-flex flex-column align-items-center text-center">
              <form id="profile-pic-form" action="/student-dashboard/addPicture" method="post" encType="multipart/form-data">
                <div className="image-upload">
                  <label htmlFor="profile_pic">
                    {isGetPictureLoading &&
                      <div className="loader">
                        <div className="spinnerContainer">
                          <div className="spinner"></div>
                        </div>
                      </div>
                    }
                    <img src={profilePicture} alt="User Profile Picture" className="rounded-circle profile-pic img-fluid stylish-profile-pic" style={{ height: 200, width: 200 }} />
                    <div className="edit-overlay">
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </div>
                  </label>
                  <input id="profile_pic" type="file" name="profile_pic" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                </div>
              </form>
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

export default STDCard;
