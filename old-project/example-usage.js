const { db, getDb } = require('./firebase-admin-init');

async function addDocument() {
  try {
    // Using default database
    const docRef = await db.collection('users').add({
      name: 'Test User',
      email: 'test@example.com',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Document added with ID:', docRef.id);
    
    // Using specific database (if you have created the camera-calibration-db)
    const specificDb = getDb();
    const specificDocRef = await specificDb.collection('users').add({
      name: 'Test User in specific DB',
      email: 'test2@example.com',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Document added to specific DB with ID:', specificDocRef.id);
  } catch (error) {
    console.error('Error adding document:', error);
  }
}

// Call the function
addDocument();
