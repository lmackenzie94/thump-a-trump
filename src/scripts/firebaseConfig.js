import dotenv from 'dotenv';
dotenv.config();

export const config = {
  apiKey: process.env.FIREBASE_API,
  authDomain: 'thump-a-trump.firebaseapp.com',
  databaseURL: 'https://thump-a-trump.firebaseio.com',
  projectId: 'thump-a-trump',
  storageBucket: '',
  messagingSenderId: '63994682603'
};
