import { useContext, useEffect, useState } from 'react';
import Home from '@/components/Home/Home';
import jws from "../contract/key.json";
import { PinataSDK } from 'pinata-web3';
import Mint from '@/components/Mint/Mint';
import { Navbar } from '@/components/Navbar/Navbar';
import { NearContext} from '@/wallets/near';
import { NftNearContract, PriceOracle } from '../config';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Explore from '@/components/Explore/Explore';
import Log from '@/components/Log/Log';

const CONTARCT = NftNearContract;
const PRICE_CONTRACT = PriceOracle;

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
    const [isLogLoading, setIsLogLoading] = useState(false);
    const [log, setLog] = useState([]);

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

    useEffect(() => {
      async function getBurnLog() {
        if(connected && signedAccountId) {
          try {
            setIsLogLoading(true);

            const log = await wallet.viewMethod({contractId: CONTARCT, method: "get_burn_log"});
            
            function convertToIST(timestamp) {
              const timestampMilliSec = Math.floor(timestamp / 1_000_000);
              const date = new Date(timestampMilliSec);
              return date
            }

            const formatLog = log.map(entry => ({
              ...entry,
              timestamp: convertToIST(entry.timestamp),
            }));

            setLog(formatLog);
          } catch (e) {
            console.log("error", e);
            toast.error("Error getting burn log", {
              position: 'top-center'
            })
          } finally {
            setIsLogLoading(false);
          }
        }
      }

      getBurnLog();
    }, [connected, signedAccountId])
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
      const BurnFee = BigInt(1000000000000000000000);

      const priceResponse = await wallet.viewMethod({
        contractId: PRICE_CONTRACT,
        method: "get_price_data",
      });

      const prices = priceResponse.prices;
      const value = prices.filter(price => price.asset_id === "wrap.testnet");
      
      const price_of_1_Near = (value[0].price.multiplier / (10 ** value[0].price.decimals)) * (10 ** 24);
      const fee_price = 0.001 * price_of_1_Near;

      await showToastAndWait(`A fee of 0.001 (${fee_price} USD) will be deducted for Burn Fee`);
      
      await wallet.callMethod({
        contractId: CONTARCT,
        method: "pay_burn_fee",
        args: {
          index: id,
        },
        deposit: BurnFee.toString()
      })
      await wallet.callMethod({
          contractId: CONTARCT,
          method: 'burn',
          args: {
              index: id,
              usd: fee_price.toString(),
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
            ) : route == "log" ? (
                <Log log={log} isLogLoading={isLogLoading} isConnected={connected}/>
            ) : (
                <>Cannot find page</>
            )
        }
    </>
  );
};

export default IndexPage;
