import React, { useState, useRef, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const Card = ({ owner, name, image, description, onDelete }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const cardRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  const handleClickOutside = (e) => {
    if (cardRef.current && !cardRef.current.contains(e.target)) {
      setShowContextMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleDeleteClick = () => {
    setShowContextMenu(false);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    onDelete();
  };

  const handleCancel = () => {
    setShowDeleteModal(false);
  };

  return (
    <>
      <style>
        {`
          .card-container {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
          }

          .card-div {
            flex: 1 1 250px;
            max-width: 250px;
            height: 375px;
            transition: all 0.2s;
            position: relative;
            cursor: pointer;
          }

          .card-inner {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, .05);
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
            backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 15px;
          }

          .card-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            text-align: left;
            margin-top: 10px;
          }

          .card-title {
            font-size: 1.5rem;
            color: white;
            margin-bottom: 5px;
            font-weight: bold;
          }

          .card-owner {
            font-size: 1.1rem;
            color: #ddd;
            margin: 0;
            margin-top: 5px;
            font-weight: 500;
          }

          .card-description {
            font-size: 1rem;
            color: #ccc;
            margin-top: 10px;
            line-height: 1.4;
          }

          .card-img-top {
            height: 230px;
            width: 100%;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 10px;
          }

          .card-content span {
            font-weight: bold;
            color: #f0f0f0;
          }

          .label {
            color: #f0f0f0;
            font-weight: bold;
            margin-bottom: 5px;
          }

          .value {
            color: white;
            margin-bottom: 10px;
          }

          .context-menu {
            position: absolute;
            background: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
            z-index: 1000;
          }

          .blur-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
          }

          .delete-modal {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
          }

          .modal-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          }

          .modal-button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }

          .delete-button {
            background: red;
            color: white;
          }

          .cancel-button {
            background: gray;
            color: white;
          }

          .delete-btn {
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1002;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 20px;
            border-radius: 10px;
          }
        `}
      </style>

      <div
        className="card-container"
        onContextMenu={handleContextMenu}
        ref={cardRef}
        style={{ position: "relative" }}
      >
        <div className="card-div">
          <div className="card-inner">
            <img
              className="card-img-top"
              alt="NFT"
              src={image}
              style={{ height: "150px", width: "200px" }}
            />
            <div className="card-content">
              <div>
                <span className="label">Name:</span>
                <p className="value">{name}</p>
              </div>
              <div>
                <span className="label">Owner:</span>
                <p className="value">{owner}</p>
              </div>
              <div>
                <span className="label">Description:</span>
                <p className="value">{description}</p>
              </div>
            </div>
          </div>
        </div>

        {showContextMenu && (
          <div className="delete-btn">
            <button className="btn btn-danger" onClick={handleDeleteClick}>Delete</button>
          </div>
        )}

        {showDeleteModal && (
          <div className="blur-background">
            <div className="delete-modal">
              <p>Are you sure you want to delete this NFT?</p>
              <div className="modal-buttons">
                <button className="modal-button delete-button" onClick={handleDeleteConfirm}>
                  Delete
                </button>
                <button className="modal-button cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Card;
