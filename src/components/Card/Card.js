import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const Card = ({ owner, name, image, description }) => {
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
        `}
      </style>
      <div className="card-container">
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
      </div>
    </>
  );
};

export default Card;
