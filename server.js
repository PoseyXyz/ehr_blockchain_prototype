const express = require('express');
const path = require('path');
const crypto = require('crypto-js');
const {
    jsonBlockchain,
    addJSONRecord,
    getRecords,
    isChainValid,
    encryptData, 
    decryptData,
    calculateHash
} = require('./blockchain');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulated user roles
const roles = {
    'doctor': { password: 'doctor123', role: 'doctor' },
    'admin': { password: 'admin123', role: 'admin' },
    'patient': { password: 'patient123', role: 'patient' }
};



// Simple role-based authentication
const authenticate = (req, res, next) => {
    const username = req.headers['username'];
    const password = req.headers['password'];
    const user = roles[username];

    if (user && user.password === password) {
        req.user = user;
        next();
    } else if (req.path.startsWith('/tamper')) { // Check if path starts with '/tamper'
        // Allow access to the tamper route without authentication
        req.user = { role: 'guest' }; // Set a default user role for testing
        next();
    } else {
        res.status(403).json({ message: 'Forbidden' });
    }
};




// Middleware for logging actions
const auditLog = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] User: ${req.user.role}, Action: ${req.method} ${req.originalUrl}`);
    next();
};

app.use(authenticate);
app.use(auditLog);

// Endpoint to add a JSON record
app.post('/add', (req, res) => {
    // const data = req.body;
    // addJSONRecord(jsonBlockchain, data);
    // res.json({ success: true, message: 'Record added', chain: jsonBlockchain });

    const { encryptedData } = req.body;

    // Decrypt the data
    const bytes = crypto.AES.decrypt(encryptedData, 'secret key 123');
    const decryptedData = JSON.parse(bytes.toString(crypto.enc.Utf8));

    addJSONRecord(jsonBlockchain, decryptedData);
    res.json({ success: true, message: 'Record added', chain: jsonBlockchain });
});

// Endpoint to get all records
app.get('/records', (req, res) => {
    // Retrieve and decrypt all records
    const decryptedRecords = getRecords(jsonBlockchain).map(record => {
        // Check if the record has been tampered with
        if (record.tampered) {
            return { ...record, tampered: true }; // Mark the record as tampered
        } else {
            return record;
        }
    });
    res.json(decryptedRecords);
});

// Endpoint to check if the chain is valid
app.get('/validate', (req, res) => {
    res.json({ isValid: isChainValid(jsonBlockchain) });
});

// Endpoint to tamper with a block's data
app.get('/tamper/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const block = jsonBlockchain[index];

    if (block) {
        // Tamper with the data
        block.data = encryptData({ tampered: 'This data has been tampered' });
        // Mark the block as tampered
        block.tampered = true;
        // Recalculate the hash after tampering
        block.hash = calculateHash(block);
        
        // Revalidate the blockchain after tampering
        const isValid = isChainValid(jsonBlockchain);

        if (!isValid) {
            console.error('Blockchain integrity compromised after tampering');
            // Rollback changes or take appropriate action
            res.status(500).json({ success: false, message: 'Blockchain integrity compromised' });
        }

        // Log values of tampered block
        console.log(`Block ${index} has been tampered with:`);
        console.log(block);

        res.json({ success: true, message: `Data in block ${index} tampered successfully` });
    } else {
        res.status(404).json({ success: false, message: `Block ${index} not found` });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
