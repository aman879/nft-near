import { useEffect, useState } from 'react';

import '@/styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Wallet, NearContext } from '@/wallets/near';
import { NetworkId } from '@/config';

const wallet = new Wallet({ networkId: NetworkId });

export default function MyApp({ Component, pageProps }) {
  const [signedAccountId, setSignedAccountId] = useState('');

  useEffect(() => { wallet.startUp(setSignedAccountId) }, []);

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
       <div className="App min-vh-100">
        <div className="gradient-bg-welcome h-100">
          <Component {...pageProps} />
        </div>
      </div>
    </NearContext.Provider>
  );
}
