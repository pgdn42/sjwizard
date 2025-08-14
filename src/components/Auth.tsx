import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { FloatingLabel } from "./FloatingLabel";

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      // Customize error messages for better UX
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="auth-container section-container">
      <div className="section-header">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      </div>
      <form onSubmit={handleEmailPassword} className="auth-form">
        <FloatingLabel label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </FloatingLabel>
        <FloatingLabel label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </FloatingLabel>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="button-text">
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      <div className="auth-divider">
        <span>or</span>
      </div>
      <button onClick={handleGoogleSignIn} className="button-google">
        Sign in with Google
      </button>
      <p className="auth-toggle">
        {isLogin ? "Need an account?" : "Have an account?"}{" "}
        <button type="button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
}
