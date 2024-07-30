const {
    jsonBlockchain,
    addJSONRecord,
    getRecords,
    isChainValid,
    encryptData,
    decryptData,
    calculateHash,
    createBlock,         // Import createBlock for testing
    createGenesisBlock   // Import createGenesisBlock for testing
} = require('../blockchain.js'); // Adjust the path accordingly

describe('Blockchain E2E Tests', () => {
    beforeEach(() => {
        // Reset the blockchain to its initial state before each test
        while (jsonBlockchain.length > 1) {
            jsonBlockchain.pop();
        }
    });

    // test('should create a genesis block', () => {
    //     expect(jsonBlockchain.length).toBe(1);
    //     const genesisBlock = jsonBlockchain[0];
    //     const genesisTimestamp = new Date('2024-01-01').toISOString(); // Use the fixed timestamp

    //     expect(genesisBlock.index).toBe(0);
    //     expect(genesisBlock.timestamp).toBe(genesisTimestamp);
    //     expect(genesisBlock.data).toBe(encryptData("Genesis Block"));
    //     expect(genesisBlock.previousHash).toBe('0');
    //     expect(genesisBlock.hash).toBe(calculateHash(genesisBlock));
    // });

    test('should add a new JSON record and retrieve it', () => {
        const record = { patientName: 'Alice', diagnosis: 'Fever' };
        addJSONRecord(jsonBlockchain, record);

        const records = getRecords(jsonBlockchain);
        expect(records.length).toBe(1);
        expect(records[0]).toEqual(record);
    });

    test('should validate the blockchain with multiple records', () => {
        const record1 = { patientName: 'Alice', diagnosis: 'Fever' };
        const record2 = { patientName: 'Bob', diagnosis: 'Cold' };
        addJSONRecord(jsonBlockchain, record1);
        addJSONRecord(jsonBlockchain, record2);

        const isValid = isChainValid(jsonBlockchain);
        expect(isValid).toBe(true);
    });

    test('should invalidate the blockchain when a block is tampered with', () => {
        const record1 = { patientName: 'Alice', diagnosis: 'Fever' };
        addJSONRecord(jsonBlockchain, record1);

        // Tamper with the data of the first added block
        jsonBlockchain[1].data = encryptData({ patientName: 'Eve', diagnosis: 'HIV' });

        const isValid = isChainValid(jsonBlockchain);
        expect(isValid).toBe(false);
    });

    test('should return an empty array when there are no records after the genesis block', () => {
        const records = getRecords(jsonBlockchain);
        expect(records.length).toBe(0);
    });

    test('should encrypt and decrypt data correctly', () => {
        const data = { patientName: 'Alice', diagnosis: 'Fever' };
        const encryptedData = encryptData(data);
        const decryptedData = decryptData(encryptedData);

        expect(decryptedData).toEqual(data);
    });

    test('should calculate hash correctly', () => {
        const block = createBlock(1, new Date().toISOString(), { patientName: 'Alice', diagnosis: 'Fever' });
        const calculatedHash = calculateHash(block);

        expect(calculatedHash).toBe(block.hash);
    });
});
