// Initialization file for Firestore

const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { firebaseConfig, dbConfig } = require('./firestore-credentials');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specified database ID
const db = getFirestore(app, dbConfig);

module.exports = { app, db };
