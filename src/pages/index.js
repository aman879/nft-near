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
              console.log(count)
    
              const nfts = [];
    
              for(let i =0; i<count; i++ ){
                const i_string = String(i);
                const tx = await wallet.viewMethod({contractId: CONTARCT, method: "get_nft", args: {index: i_string}});
                console.log(tx.uri)
                const data = await pinata.gateways.get(`https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${tx.uri}`);
    
                const mergedNFTData = {
                  ...(typeof tx === 'object' ? tx : {}),
                  ...(typeof data.data === 'object' ? data.data : {}),
                };
                nfts.push(mergedNFTData);
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

  const mintNFTs = async (_uri) => {
    if(!signedAccountId) return;
    try {
        console.log("Minting NFT with URI:", _uri);

        // Ensure _uri is defined
        if (typeof _uri !== 'string') {
            throw new Error('URI must be a string');
        }
        const tx = await wallet.callMethod({contractId: CONTARCT, method: 'mint', args: {uri: _uri}});
        // const tx = await wallet.viewMethod({contractId: CONTARCT, method: "get_nft", args: {index: '0'}});
        toast.success("NFT minted successfully", {
            position: "top-center"
          });
        setShouldFetchNfts(true);
        onRouteChange("explore");
    } catch (e) {
        console.log(e)
        toast.error('Error minting NFT:', {
            position: "top-center"
          });
    }
  }

  const uploadToPinata = async (file, name, description) => {
    if (!file) {
      throw new Error("File is required");
    }

    try {
      toast.info("Uploading video to IPFS", {
        position:"top-center"
      })
      const uploadImage = await pinata.upload.file(file);
      const metadata = await pinata.upload.json({
        name: name,
        description: description,
        video: `https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${uploadImage.IpfsHash}`,
      });

      return metadata.IpfsHash;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      toast.error("Minting NFT failed.", {
        position: "top-center"
      });
      throw new Error("Upload to Pinata failed.");
    }
  };

  return (
    <>
        <ToastContainer />
        <Navbar onRouteChange={onRouteChange}/>
        {route === "home" ? (
                <Home onRouteChange={onRouteChange}/>
            ) : route === "explore" ? (
                <Explore nfts={nfts} isConnected={connected} isLoading={isLoading}/>
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
