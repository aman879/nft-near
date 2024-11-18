import { useEffect, useState, useContext } from 'react';
import { NearContext } from '@/wallets/near';
import 'bootstrap/dist/css/bootstrap.min.css'; 

export const Navbar = ({onRouteChange}) => {
  const { signedAccountId, wallet } = useContext(NearContext);
  const [action, setAction] = useState(() => {});
  const [label, setLabel] = useState('Loading...');

  useEffect(() => {
    if (!wallet) return;

    if (signedAccountId) {
      setAction(() => wallet.signOut);
      setLabel(`Disconnect ${signedAccountId}`);
    } else {
      setAction(() => wallet.signIn);
      setLabel('Connect');
    }
  }, [signedAccountId, wallet]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
      <div className="container-fluid">
        <a className="navbar-brand" onClick={() => onRouteChange("home")}>
          Ignitus Networks
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link" onClick={() => onRouteChange("explore")}>
                Explore
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={() => onRouteChange("mint")}>
                Mint
              </a>
            </li>
          </ul>
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={action}
          >
            {label}
          </button>
        </div>
      </div>
    </nav>
  );
};
