import { useState } from "react";

const Log = ({ log, isLogLoading, isConnected }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState(log || []);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = log.filter(
      (entry) =>
        entry.token_id.toLowerCase().includes(value) ||
        entry.owner.toLowerCase().includes(value)
    );
    setFilteredLogs(filtered);
  };

  return (
    <div className="d-flex flex-column align-items-center vh-100">
      {isConnected ? (
        isLogLoading ? (
          <p className="text-white h4">Loading...</p>
        ) : (
          <div className="text-white" style={{ width: "80%" }}>
            <div className="d-flex justify-content-between align-items-center mb-4" style={{ marginTop: "100px"}}>
              <h3>Burn Logs</h3>
              <input
                type="text"
                placeholder="Search token id or Owner"
                value={searchTerm}
                onChange={handleSearch}
                className="form-control"
                style={{ maxWidth: "300px" }}
              />
            </div>

            {filteredLogs.length > 0 ? (
              <div>
                {filteredLogs.map((entry, index) => (
                  <div key={index} className="mb-2">
                    <div className="row">
                      <div className="col-md-3">
                        <strong>Token ID:</strong> {entry.token_id}
                      </div>
                      <div className="col-md-3">
                        <strong>Token Name:</strong> {entry.token_name}
                      </div>
                      <div className="col-md-3">
                        <strong>Owner:</strong> {entry.owner}
                      </div>
                      <div className="col-md-3">
                        <strong>Fee (USD):</strong> {entry.fee_in_usd}
                      </div>
                      <div className="col-md-12 mt-2">
                        <strong>Timestamp:</strong>{" "}
                        {new Date(entry.timestamp).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}
                      </div>
                    </div>
                    <hr className="text-white" />
                  </div>
                ))}
              </div>
            ) : (
              <p>No logs found for "{searchTerm}".</p>
            )}
          </div>
        )
      ) : (
        <div className="text-center">
          <p className="text-white h5">Connect your wallet</p>
        </div>
      )}
    </div>
  );
};

export default Log;
