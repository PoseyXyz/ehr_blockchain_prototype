const crypto = require('crypto-js');
let timestamp = new Date().toJSON().slice(0,10).replace(/-/g,'/');


// Function to create a new block
const createBlock = (index, timestamp, data, previousHash = '') => {
    const block = {
        index,
        timestamp,
        data: encryptData(data),
        previousHash,
    };

    block.hash = calculateHash(block);
    return block;
};

// Function to calculate the hash of a block
const calculateHash = ({ index, previousHash, timestamp, data }) => {
    return crypto.SHA256(index + previousHash + timestamp + data).toString();
};

// Function to create the genesis block
const createGenesisBlock = () => {
    return createBlock(0, timestamp, "Genesis Block", "0");
};

// Function to add a new block to the chain
const addBlock = (chain, newBlock) => {
    const previousBlock = chain[chain.length - 1];
    newBlock.previousHash = previousBlock.hash;
    newBlock.hash = calculateHash(newBlock);
    chain.push(newBlock);
    return chain;
};


const isChainValid = (chain) => {
    for (let i = 1; i < chain.length; i++) {
        const currentBlock = chain[i];
        const previousBlock = chain[i - 1];

        // Check if the current block's hash is correct
        if (currentBlock.hash !== calculateHash(currentBlock)) {
            return false;
        }

        // Check if the previous block's hash matches the current block's previous hash
        if (currentBlock.previousHash !== previousBlock.hash) {
            return false;
        }

        // Additional checks, if any

        // If the block is marked as tampered, consider it invalid
        if (currentBlock.tampered) {
            return false;
        }
    }

    // All checks passed, chain is valid
    return true;
};



// Encrypt patient data
const encryptData = (data) => {
    const encrypted = crypto.AES.encrypt(JSON.stringify(data), 'secret_key').toString();
    return encrypted;
};

// Decrypt patient data
const decryptData = (encryptedData) => {
    const bytes = crypto.AES.decrypt(encryptedData, 'secret_key');
    const decrypted = JSON.parse(bytes.toString(crypto.enc.Utf8));
    return decrypted;
};

// Function to add a JSON record as a new block
const addJSONRecord = (chain, data) => {
    const newBlock = createBlock(chain.length, new Date().toISOString(), data);
    addBlock(chain, newBlock);
    return newBlock; // Return the new block for tampering
};

// Function to retrieve all JSON records
const getRecords = (chain) => {
    return chain.slice(1).map(block => decryptData(block.data)); // Exclude the genesis block
};

// Initialize blockchain with the genesis block
const jsonBlockchain = [createGenesisBlock()];

module.exports = {
    jsonBlockchain,
    addJSONRecord,
    getRecords,
    isChainValid,
    encryptData, // Export the encryptData function
    decryptData,
    calculateHash,
    createBlock
};
