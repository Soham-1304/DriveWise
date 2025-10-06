import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration for Fuel Optimizer
const firebaseConfig = {
  apiKey: "AIzaSyDCtMsq4KH3K9e7VheX4UUuRxVkzACeapY",
  authDomain: "fueloptimiser.firebaseapp.com",
  projectId: "fueloptimiser",
  storageBucket: "fueloptimiser.firebasestorage.app",
  messagingSenderId: "979553441253",
  appId: "1:979553441253:web:1f9611ee12356ba7b5cb0c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
