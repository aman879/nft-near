import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import 'bootstrap/dist/css/bootstrap.min.css';

const Mint = ({ uploadToPinata, mintNFT }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [isMinting, setIsMinting] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/*': [] },
        onDrop: (acceptedFiles) => {
            const previewFile = Object.assign(acceptedFiles[0], {
                preview: URL.createObjectURL(acceptedFiles[0]),
            });
            setFile(previewFile);
        },
    });

    const clearImage = () => {
        setFile(null);
    };

    const handleMint = async () => {
        if (!file || !title || !description || !tokenId) {
            alert('Please complete all fields');
            return;
        }

        setIsMinting(true);

        try {
            const IpfsHash = await uploadToPinata(file);
            mintNFT(tokenId, title, description, IpfsHash, price);
            clearImage();
        } catch (e) {
            console.log(e);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 text-white">
            <h2 className="mb-4">Mint Your NFT</h2>
            <div {...getRootProps({ className: 'border border-dashed border-primary rounded p-3 mb-3 text-center' })}>
                <input {...getInputProps()} />
                {file ? (
                    <div>
                        <img src={file.preview} alt="Preview" className="img-fluid mb-3 " style={{ maxHeight: '300px' }} />
                    </div>
                ) : (
                    <p className="text-primary">Drag & drop an image file, or click to select one</p>
                )}
            </div>
            {file && (
                <button className="btn btn-danger mb-3" onClick={clearImage}>
                    Clear
                </button>
            )}

            <div className="mb-3 w-100" style={{ maxWidth: '400px' }}>
                <label className="form-label">Token Id:</label>
                <input
                    type="text"
                    className="form-control"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    placeholder="Enter Token ID"
                />
            </div>

            <div className="mb-3 w-100" style={{ maxWidth: '400px' }}>
                <label className="form-label">Title:</label>
                <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter NFT Title"
                />
            </div>

            <div className="mb-3 w-100" style={{ maxWidth: '400px' }}>
                <label className="form-label">Description:</label>
                <textarea
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter NFT Description"
                />
            </div>
            <div className="mb-3 w-100" style={{ maxWidth: '400px' }}>
                <label className="form-label">Fee:</label>
                <input
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter Fee for storage coverage"
                    step="0.01"
                />
            </div>
            <button
                className={`btn ${isMinting ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleMint}
                disabled={isMinting}
            >
                {isMinting ? 'Minting...' : 'Mint NFT'}
            </button>
        </div>
    );
};

export default Mint;
