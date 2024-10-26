import React from "react";
import CardList from "../CardList/CardList";
import 'bootstrap/dist/css/bootstrap.min.css';

const Explore = ({ nfts, isConnected, isLoading, deleteNFT, address }) => {

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      {isConnected ? (
        isLoading ? (
          <p className="text-white h4">Loading...</p>
        ) : (
          <CardList userNFTs={nfts} deleteNFT={deleteNFT} address={address}/>
        )
      ) : (
        <div className="text-center">
          <p className="text-white h5">Connect your wallet</p>
        </div>
      )}
    </div>
  );
};

export default Explore;
