const crypto = require('crypto-js');
const {
    jsonBlockchain,
    addJSONRecord,
    getRecords,
    isChainValid,
    encryptData,
    decryptData,
    calculateHash
} = require('../blockchain.js'); // Adjust the path accordingly

describe('Blockchain Tests', () => {
    test('should create a genesis block', () => {
        const genesisBlock = jsonBlockchain[0];
        expect(genesisBlock.index).toBe(0);
        expect(genesisBlock.data).toBeDefined();
        expect(genesisBlock.previousHash).toBe('0');
    });

    test('should add a new JSON record as a block', () => {
        const initialLength = jsonBlockchain.length;
        const newBlock = addJSONRecord(jsonBlockchain, { patientName: 'Alice', diagnosis: 'Fever' });
        expect(jsonBlockchain.length).toBe(initialLength + 1);
        expect(newBlock.index).toBe(initialLength);
        expect(newBlock.data).toBeDefined();
    });

    test('should decrypt encrypted data correctly', () => {
        const data = { patientName: 'Bob', diagnosis: 'Cold' };
        const encrypted = encryptData(data);
        const decrypted = decryptData(encrypted);
        expect(decrypted).toEqual(data);
    });

    test('should validate the blockchain', () => {
        const newBlock = addJSONRecord(jsonBlockchain, { patientName: 'Charlie', diagnosis: 'Flu' });
        const isValid = isChainValid(jsonBlockchain);
        expect(isValid).toBe(true);
    });

    test('should invalidate the blockchain when tampered with', () => {
        const newBlock = addJSONRecord(jsonBlockchain, { patientName: 'David', diagnosis: 'Malaria' });
        jsonBlockchain[1].data = encryptData({ patientName: 'Eve', diagnosis: 'HIV' }); // Tamper with the data
        const isValid = isChainValid(jsonBlockchain);
        expect(isValid).toBe(false);
    });

    test('should retrieve all JSON records', () => {
        // Clear the blockchain and start fresh
        const chain = [jsonBlockchain[0]];

        // Add new records
        const record1 = { patientName: 'Alice', diagnosis: 'Fever' };
        const record2 = { patientName: 'Charlie', diagnosis: 'Flu' };
        const record3 = { patientName: 'Frank', diagnosis: 'Asthma' };

        addJSONRecord(chain, record1);
        addJSONRecord(chain, record2);
        addJSONRecord(chain, record3);

        // Retrieve the records
        const records = getRecords(chain);

        // Log records for debugging
        console.log('Retrieved Records:', records);

        // Assertions
        expect(records.length).toBe(3); // Expecting 3 records
        expect(records[0]).toEqual(record1);
        expect(records[1]).toEqual(record2);
        expect(records[2]).toEqual(record3);
    });
});

