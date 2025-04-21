const { admin, db, getNativeDatabase } = require('./firebase-admin-init');

// Example function to add a document to the specified database
async function addDocumentToDatabase(databaseId = null) {
  try {
    // Choose which database to use
    const firestore = databaseId ? getNativeDatabase(databaseId) : db;
    
    // Example data
    const data = {
      name: 'Test Camera',
      type: 'PTZ',
      resolution: '4K',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Add the document to a collection
    const docRef = await firestore.collection('cameras').add(data);
    
    console.log(`Document added to ${databaseId || 'default'} database with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

// Example function to read a document from the database
async function readDocument(collectionName, docId, databaseId = null) {
  try {
    // Choose which database to use
    const firestore = databaseId ? getNativeDatabase(databaseId) : db;
    
    // Get the document
    const docRef = firestore.collection(collectionName).doc(docId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      console.log('Document data:', doc.data());
      return doc.data();
    } else {
      console.log('No such document exists!');
      return null;
    }
  } catch (error) {
    console.error('Error reading document:', error);
    throw error;
  }
}

// Usage examples
async function runExamples() {
  try {
    // Example 1: Add document to the default database
    const defaultDbDocId = await addDocumentToDatabase();
    
    // Example 2: Add document to the native camera-calibration-db database
    const nativeDbDocId = await addDocumentToDatabase('camera-calibration-db');
    
    // Example 3: Read the document from both databases
    await readDocument('cameras', defaultDbDocId);
    await readDocument('cameras', nativeDbDocId, 'camera-calibration-db');
    
  } catch (error) {
    console.error('Error in examples:', error);
  }
}

// Uncomment to run the examples
// runExamples();

module.exports = { 
  addDocumentToDatabase,
  readDocument,
  runExamples
};
