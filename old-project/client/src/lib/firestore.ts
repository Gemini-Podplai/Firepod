import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";
import { nanoid } from "nanoid";
import { app } from "./firebase";

// Initialize Firestore
export const firestore = getFirestore(app);

// Chat collections
export const chatsCollection = collection(firestore, "chats");
export const messagesCollection = collection(firestore, "messages");

// User collections
export const usersCollection = collection(firestore, "users");
export const userChatsCollection = collection(firestore, "user_chats");

// Project collections
export const projectsCollection = collection(firestore, "projects");

// Types
export interface FirestoreChat {
  id: string;
  title: string;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  ownerId: string;
  modelId?: string;
  systemPrompt?: string;
}

export interface FirestoreMessage {
  id: string;
  chatId: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: any; // Firestore timestamp
  metadata?: Record<string, any>;
}

export interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  createdAt: any; // Firestore timestamp
}

export interface FirestoreProject {
  id: string;
  name: string;
  code: string;
  language: string;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  ownerId: string;
}

// Create a new chat
export async function createChat(userId: string, title: string): Promise<string> {
  const chatData: FirestoreChat = {
    id: nanoid(),
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ownerId: userId
  };
  
  // Create the chat document
  await setDoc(doc(chatsCollection, chatData.id), chatData);
  
  // Link the chat to the user
  await setDoc(doc(userChatsCollection, `${userId}_${chatData.id}`), {
    userId,
    chatId: chatData.id,
    createdAt: serverTimestamp()
  });
  
  return chatData.id;
}

// Get a chat by ID
export async function getChat(chatId: string): Promise<FirestoreChat | null> {
  const chatDoc = await getDoc(doc(chatsCollection, chatId));
  if (!chatDoc.exists()) return null;
  return { id: chatDoc.id, ...chatDoc.data() } as FirestoreChat;
}

// Get all chats for a user
export async function getUserChats(userId: string): Promise<FirestoreChat[]> {
  const q = query(
    userChatsCollection, 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  
  const userChatsDocs = await getDocs(q);
  const chats: FirestoreChat[] = [];
  
  for (const userChatDoc of userChatsDocs.docs) {
    const chatId = userChatDoc.data().chatId;
    const chatDoc = await getDoc(doc(chatsCollection, chatId));
    
    if (chatDoc.exists()) {
      chats.push({ id: chatDoc.id, ...chatDoc.data() } as FirestoreChat);
    }
  }
  
  return chats;
}

// Update a chat
export async function updateChat(chatId: string, data: Partial<FirestoreChat>): Promise<void> {
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(doc(chatsCollection, chatId), updateData);
}

// Delete a chat
export async function deleteChat(chatId: string): Promise<void> {
  // Delete the chat document
  await deleteDoc(doc(chatsCollection, chatId));
  
  // Delete all messages for this chat
  const q = query(messagesCollection, where("chatId", "==", chatId));
  const messageDocs = await getDocs(q);
  
  for (const messageDoc of messageDocs.docs) {
    await deleteDoc(doc(messagesCollection, messageDoc.id));
  }
}

// Add a message to a chat
export async function addMessage(chatId: string, message: Omit<FirestoreMessage, "id" | "timestamp">): Promise<string> {
  const messageData: Omit<FirestoreMessage, "id"> = {
    ...message,
    chatId,
    timestamp: serverTimestamp()
  };
  
  const messageRef = await addDoc(messagesCollection, messageData);
  
  // Update the chat's updatedAt timestamp
  await updateDoc(doc(chatsCollection, chatId), {
    updatedAt: serverTimestamp()
  });
  
  return messageRef.id;
}

// Get all messages for a chat
export async function getChatMessages(chatId: string): Promise<FirestoreMessage[]> {
  const q = query(
    messagesCollection, 
    where("chatId", "==", chatId),
    orderBy("timestamp", "asc")
  );
  
  const messageDocs = await getDocs(q);
  
  return messageDocs.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as FirestoreMessage[];
}

// Listen to messages in real-time
export function subscribeToChatMessages(
  chatId: string, 
  callback: (messages: FirestoreMessage[]) => void
): () => void {
  const q = query(
    messagesCollection, 
    where("chatId", "==", chatId),
    orderBy("timestamp", "asc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as FirestoreMessage[];
    
    callback(messages);
  });
}

// Create or update a user
export async function upsertUser(userData: Omit<FirestoreUser, "createdAt">): Promise<void> {
  const userDoc = await getDoc(doc(usersCollection, userData.id));
  
  if (userDoc.exists()) {
    // Update the user
    await updateDoc(doc(usersCollection, userData.id), {
      name: userData.name,
      email: userData.email
    });
  } else {
    // Create the user
    await setDoc(doc(usersCollection, userData.id), {
      ...userData,
      createdAt: serverTimestamp()
    });
  }
}

// Get user by ID
export async function getUser(userId: string): Promise<FirestoreUser | null> {
  const userDoc = await getDoc(doc(usersCollection, userId));
  if (!userDoc.exists()) return null;
  return { id: userDoc.id, ...userDoc.data() } as FirestoreUser;
}

// Create a project
export async function createProject(
  userId: string, 
  name: string, 
  code: string, 
  language: string
): Promise<string> {
  const projectData: FirestoreProject = {
    id: nanoid(),
    name,
    code,
    language,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ownerId: userId
  };
  
  await setDoc(doc(projectsCollection, projectData.id), projectData);
  return projectData.id;
}

// Get a project by ID
export async function getProject(projectId: string): Promise<FirestoreProject | null> {
  const projectDoc = await getDoc(doc(projectsCollection, projectId));
  if (!projectDoc.exists()) return null;
  return { id: projectDoc.id, ...projectDoc.data() } as FirestoreProject;
}

// Get all projects for a user
export async function getUserProjects(userId: string): Promise<FirestoreProject[]> {
  const q = query(
    projectsCollection, 
    where("ownerId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  
  const projectDocs = await getDocs(q);
  
  return projectDocs.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as FirestoreProject[];
}

// Update a project
export async function updateProject(
  projectId: string, 
  data: Partial<Omit<FirestoreProject, "id" | "ownerId" | "createdAt">>
): Promise<void> {
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  
  await updateDoc(doc(projectsCollection, projectId), updateData);
}

// Delete a project
export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(projectsCollection, projectId));
}