import React from 'react';

const Home = ({ onRouteChange }) => {
  return (
    <div className="text-white d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <h1 className="font-weight-bold display-4">
          Mint a<br />
          <span className="font-weight-light text-primary">Near NFTs</span>
        </h1>
        <button 
          onClick={() => onRouteChange("mint")}
          type="button" 
          className="btn btn-gradient mt-4"
          style={{
            background: 'linear-gradient(to right, #6f42c1, #d63384)',
            border: 'none',
          }}
        >
          Mint
        </button>
      </div>
    </div>
  );
}

export default Home;
