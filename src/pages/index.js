import { useContext, useEffect, useState } from 'react';
import Home from '@/components/Home/Home';
import jws from "../contract/key.json";
import { PinataSDK } from 'pinata-web3';
import Mint from '@/components/Mint/Mint';
import { Navbar } from '@/components/Navbar/Navbar';
import { NearContext} from '@/wallets/near';
import { NftNearContract } from '../config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Explore from '@/components/Explore/Explore';

const CONTARCT = NftNearContract;

const pinata = new PinataSDK({
    pinataJwt: jws.jws,
    pinataGateway: "beige-sophisticated-baboon-74.mypinata.cloud",
});

const IndexPage = () => {
    const { signedAccountId, wallet} = useContext(NearContext);
    const [route, setRoute] = useState("home");
    const [connected, setConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldFetchNfts, setShouldFetchNfts] = useState(false);
    const [nfts, setNfts] = useState([]);

    useEffect(() => {
        if(signedAccountId) {
            setConnected(true)
        } else {
            setConnected(false)
        }
    }, [signedAccountId])

    useEffect(() => {
        async function getAllNFTs() {
          if (connected && signedAccountId) { 
            try {
              setIsLoading(true);
              const count = await wallet.viewMethod({contractId: CONTARCT, method: "get_total_count"});    
              const nfts = [];
    
              for(let i =0; i<count; i++ ){
                const i_string = String(i);
                const tx = await wallet.viewMethod({contractId: CONTARCT, method: "get_nft", args: {index: i_string}});
                if(tx.data) {
                  console.log(tx)
                  nfts.push(tx);
                }
              }
              setNfts(nfts);
              setShouldFetchNfts(false);
              setIsLoading(false);
            } catch (error) {
              console.error('Error fetching NFTs:', error);
              toast.error("Error fetching NFTs", {
                position: "top-center"
              })
            }
          }
        }
        getAllNFTs();
      }, [shouldFetchNfts, connected, signedAccountId]);


  const onRouteChange = (route) => {
    setRoute(route);
  };


const showToastAndWait = async (message) => {
  toast.info(message, {
    position: "top-center",
    autoClose: 5000,
  });

  await new Promise((resolve) => setTimeout(resolve, 5000));
  return true;
};


  const mintNFTs = async (title, description, uri) => {
    if(!signedAccountId) return;
    try {

      const tokenMetadata = {
        title: title,
        description: description,
        media: `https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${uri}`,
      };

      const metadataSizeInBytes = new TextEncoder().encode(JSON.stringify(tokenMetadata)).length;

      const coverageFee = Math.ceil(metadataSizeInBytes * 1e19);
      const SMARTCONTARCTSTORAGE = 0.0684 * 1e24;
      const totalCoverageFee = Math.ceil(coverageFee + SMARTCONTARCTSTORAGE);

      await showToastAndWait(`A fee of ${(metadataSizeInBytes / 100000) + 0.0684} will be deducted`);

      const depositAmount = BigInt(totalCoverageFee);

      const tx = await wallet.callMethod({
          contractId: CONTARCT,
          method: 'mint',
          args: {
              token_id: title,
              token_metadata: {
                  "title": title,
                  "description": description,
                  "media": `https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${uri}`
              }
          },
          deposit: depositAmount.toString()
        });
        toast.success("NFT minted successfully", {
            position: "top-center"
          });
        setShouldFetchNfts(true);
        onRouteChange("explore");
    } catch (e) {
        console.log(e)
        toast.error('Error minting NFT', {
            position: "top-center"
          });
    }
  }

  const uploadToPinata = async (file) => {
    if (!file) {
      throw new Error("File is required");
    }

    try {
      toast.info("Uploading video to IPFS", {
        position:"top-center"
      })
      const uploadImage = await pinata.upload.file(file);
      return uploadImage.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      toast.error("Minting NFT failed.", {
        position: "top-center"
      });
      throw new Error("Upload to Pinata failed.");
    }
  };

  const deleteNFT = async (id) => {
    if(!signedAccountId) return;
    try {
      const depositAmount = BigInt(1);

        await wallet.callMethod({
            contractId: CONTARCT,
            method: 'burn',
            args: {
                index: id,
            },
            deposit: depositAmount.toString()
        });
        toast.success("NFT deleted successfully", {
            position: "top-center"
          });
        setShouldFetchNfts(true);
    } catch (e) {
        console.log(e)
        toast.error('Error Deleting NFT:', {
            position: "top-center"
          });
    }
  }

  return (
    <>
        <ToastContainer />
        <Navbar onRouteChange={onRouteChange}/>
        {route === "home" ? (
                <Home onRouteChange={onRouteChange}/>
            ) : route === "explore" ? (
                <Explore nfts={nfts} isConnected={connected} isLoading={isLoading} deleteNFT={deleteNFT} address={signedAccountId}/>
            ) : route === "mint" ? (
                <Mint uploadToPinata={uploadToPinata} mintNFT={mintNFTs} />
            ) : (
                <>Cannot find page</>
            )
        }
    </>
  );
};

export default IndexPage;
