const assert = require('assert');
const Block = require('../src/blockchain');
const { encryptData, decryptData } = require('../src/utils/encryption');

describe('Unit Tests', () => {
    describe('Block', () => {
        it('should calculate the correct hash', () => {
            const block = new Block(1, Date.now(), { patientName: 'Alice', patientData: 'Health data' }, '0');
            const hash = block.calculateHash();
            assert.strictEqual(typeof hash, 'string');
            assert.strictEqual(hash.length, 64); // SHA-256 hash length
        });
    });

    describe('Encryption', () => {
        it('should encrypt and decrypt data correctly', () => {
            const data = { patientName: 'Alice', patientData: 'Health data' };
            const secret = 'secret_key';
            const encrypted = encryptData(data, secret);
            const decrypted = decryptData(encrypted, secret);

            assert.deepStrictEqual(decrypted, data);
        });
    });
});
