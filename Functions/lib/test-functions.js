"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTestData = seedTestData;
const admin = __importStar(require("firebase-admin"));
// This file is for testing your Firebase functions locally
// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}
// Helper function to add test camera data to Firestore
async function seedTestData() {
    const firestore = admin.firestore();
    // Add test cameras
    const camerasRef = firestore.collection("cameras");
    // Check if test data already exists
    const snapshot = await camerasRef.limit(1).get();
    if (!snapshot.empty) {
        console.log("Test data already exists");
        return;
    }
    // Add sample cameras
    const cameras = [
        {
            name: "Camera 1",
            model: "Sony A7III",
            resolution: "4K",
            parameters: {
                focalLength: 50,
                sensorWidth: 36
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            name: "Camera 2",
            model: "Canon EOS R5",
            resolution: "8K",
            parameters: {
                focalLength: 24,
                sensorWidth: 36
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
    ];
    // Add to Firestore
    for (const camera of cameras) {
        await camerasRef.add(camera);
    }
    console.log("Added test camera data to Firestore");
}
// Run the seed function if this file is executed directly
if (require.main === module) {
    seedTestData()
        .then(() => console.log("Seeding complete"))
        .catch(err => console.error("Error seeding data:", err));
}
//# sourceMappingURL=test-functions.js.map