// const request = require('supertest');
// const { app } = require('../src/app');
// let token;

// describe('Integration Tests', () => {
//     before(async () => {
//         const res = await request(app)
//             .post('/auth/login')
//             .send({ username: 'admin', password: 'password' });

//         token = res.body.token;
//     });

//     describe('Auth Integration', () => {
//         it('should login and return a token', async () => {
//             const res = await request(app)
//                 .post('/auth/login')
//                 .send({ username: 'admin', password: 'password' });

//             expect(res.status).to.equal(200);
//             expect(res.body).to.have.property('token');
//         });

//         it('should fail login with wrong credentials', async () => {
//             const res = await request(app)
//                 .post('/auth/login')
//                 .send({ username: 'admin', password: 'wrongpassword' });

//             expect(res.status).to.equal(401);
//         });
//     });

//     describe('Blockchain Integration', () => {
//         it('should add a new record', async () => {
//             const res = await request(app)
//                 .post('/blockchain/addRecord')
//                 .set('Authorization', `Bearer ${token}`)
//                 .send({ data: { patientName: 'Alice', patientData: 'Health data' } });

//             expect(res.status).to.equal(201);
//         });

//         it('should retrieve all records', async () => {
//             const res = await request(app)
//                 .get('/blockchain/getRecords')
//                 .set('Authorization', `Bearer ${token}`);

//             expect(res.status).to.equal(200);
//             expect(res.body).to.be.an('array');
//         });
//     });

//     describe('Tamper Integration', () => {
//         it('should tamper with data', async () => {
//             const res = await request(app)
//                 .post('/tamper')
//                 .set('Authorization', `Bearer ${token}`)
//                 .send({ index: 1, newData: { patientName: 'Tampered', patientData: 'Tampered data' } });

//             expect(res.status).to.equal(200);
//         });

//         it('should fail to tamper with non-existent block', async () => {
//             const res = await request(app)
//                 .post('/tamper')
//                 .set('Authorization', `Bearer ${token}`)
//                 .send({ index: 100, newData: { patientName: 'Non-existent', patientData: 'Non-existent data' } });

//             expect(res.status).to.equal(404);
//         });
//     });
// });

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

describe('Blockchain Integration Tests', () => {
    beforeEach(() => {
        // Reset the blockchain to its initial state before each test
        while (jsonBlockchain.length > 1) {
            jsonBlockchain.pop();
        }
    });

    test('should add multiple JSON records and retrieve them correctly', () => {
        // Add new records
        const record1 = { patientName: 'Alice', diagnosis: 'Fever' };
        const record2 = { patientName: 'Bob', diagnosis: 'Cold' };
        const record3 = { patientName: 'Charlie', diagnosis: 'Flu' };

        addJSONRecord(jsonBlockchain, record1);
        addJSONRecord(jsonBlockchain, record2);
        addJSONRecord(jsonBlockchain, record3);

        // Retrieve the records
        const records = getRecords(jsonBlockchain);

        // Assertions
        expect(records.length).toBe(3); // Expecting 3 records
        expect(records[0]).toEqual(record1);
        expect(records[1]).toEqual(record2);
        expect(records[2]).toEqual(record3);
    });

    test('should validate the blockchain after adding multiple records', () => {
        // Add new records
        addJSONRecord(jsonBlockchain, { patientName: 'Alice', diagnosis: 'Fever' });
        addJSONRecord(jsonBlockchain, { patientName: 'Bob', diagnosis: 'Cold' });
        addJSONRecord(jsonBlockchain, { patientName: 'Charlie', diagnosis: 'Flu' });

        // Validate the blockchain
        const isValid = isChainValid(jsonBlockchain);
        expect(isValid).toBe(true);
    });

    test('should invalidate the blockchain when a block is tampered with', () => {
        // Add new records
        addJSONRecord(jsonBlockchain, { patientName: 'Alice', diagnosis: 'Fever' });
        addJSONRecord(jsonBlockchain, { patientName: 'Bob', diagnosis: 'Cold' });
        const newBlock = addJSONRecord(jsonBlockchain, { patientName: 'Charlie', diagnosis: 'Flu' });

        // Tamper with the data of the second block
        jsonBlockchain[1].data = encryptData({ patientName: 'Eve', diagnosis: 'HIV' });

        // Validate the blockchain
        const isValid = isChainValid(jsonBlockchain);
        expect(isValid).toBe(false);
    });

    test('should retrieve an empty array if no blocks are added after the genesis block', () => {
        // Retrieve the records
        const records = getRecords(jsonBlockchain);

        // Assertions
        expect(records.length).toBe(0); // Expecting 0 records
    });
    
});

