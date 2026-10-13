const messages = {
  // Projects with email enumeration protection return this one code for
  // both an unknown email and a wrong password
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
};

// Turns a Firebase Auth error into a message fit to show the user
export const authErrorMessage = (error) =>
  messages[error?.code] || "Something went wrong, please try again!";
