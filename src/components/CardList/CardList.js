import React from "react";
import Card from "../Card/Card";

const CardList = ({ userNFTs }) => {
    console.log(userNFTs)
  let cardComponents = [];

  if (userNFTs) {
    cardComponents = userNFTs.map((nft) => (
      <Card
        key={nft.id}
        owner={nft.owner}
        name={nft.name}
        description={nft.description}
        image={nft.video}
      />
    ));
  }

  return (
    <div>
      {userNFTs.length === 0 ? (
        <p>No NFTs found.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4 pb-5">
          {cardComponents}
        </div>
      )}
    </div>
  );
};

export default CardList;
