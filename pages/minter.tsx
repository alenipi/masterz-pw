import React, { useRef, useState } from 'react';
import styles from "../styles/Minter.module.css";
import { NextPage } from "next";
import { useStorageUpload, MediaRenderer, useMintNFT, useContract, Web3Button, useAddress } from "@thirdweb-dev/react";
import { NFT_COLLECTION_ADDRESS } from "../const/contractAddresses";


export default function Minter() {

  const address = useAddress();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageIPFS, setImageIPFS] = useState<string | null>(null);
  const [nftName, setNftName] = useState<string>("");
  const [nftDescription, setNftDescription] = useState<string>("");
  const [mintingNFT, setMintingNFT] = useState<boolean>(false);

  const { contract } = useContract(NFT_COLLECTION_ADDRESS);
  const { mutateAsync: mintNft, isLoading, error } = useMintNFT(contract);
  const { mutateAsync: upload } = useStorageUpload();

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    const uris = await upload({ data: [file], options: { uploadWithoutDirectory: true } });
    setImageIPFS(uris[0]);
    console.log(uris);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const reset = () => {
    setImageUrl(null);
  };
  

  return (
    <div className={styles.container}>
      {address ? (
        <div className={styles.minterContainer}>
          <div className={styles.mintContainerSection}>
            <h1>NFT Media</h1>
            <div 
              className={styles.fileContainer} 
              onClick={handleFileSelect}
            >
              <input
                type="file"
                accept='image/*'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleChange}
              />
              {!imageUrl ? (
                <div
                  style={{ 
                    border: '2px dashed grey', 
                    padding: '20px', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',    
                  }}
                >
                  <p>Click to add file</p>
                </div>
              ) : (
                <div style={{ height: "100%" }}>
                  <MediaRenderer
                    src={imageUrl}
                    height='100%'
                    width='100%'
                  />
                  <button 
                    onClick={reset}
                    className={styles.resetButton}
                  >Reset</button>
                </div>
              )}
            </div>
          </div>
          <div className={styles.mintContainerSection}>
            <h1>NFT Metadata</h1>
            <p>NFT Name:</p>
            <input 
              type="text"
              placeholder="My NFT Name"
              onChange={(e) => setNftName(e.target.value)}
              value={nftName}
              className={styles.metadataInput}
            />
            <p>NFT Description:</p>
            <input 
              type="text"
              placeholder="This NFT is about..."
              onChange={(e) => setNftDescription(e.target.value)}
              value={nftDescription}
              className={styles.metadataInput}
            />
            <Web3Button
                contractAddress={NFT_COLLECTION_ADDRESS}
                action={() =>
                    mintNft({
                    metadata: {
                        name: nftName,
                        description: nftDescription,
                        image: imageIPFS,
                    },
                    to: address, // Use useAddress hook to get current wallet address
                }).then(() => {
                    alert("NFT minted! Go to your profile");
                    setMintingNFT(false);
                    setImageUrl(null);
                    setNftName("");
                    setNftDescription("");
                })
            }
            >
                Mint NFT
            </Web3Button>
          </div>
        </div>
      ) : (
        <div>
          <h1>Sign in to mint an NFT</h1>
        </div>
      )}
    </div>
  );
};
