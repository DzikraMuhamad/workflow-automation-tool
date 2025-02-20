import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  auth,
  onAuthStateChanged,
  signInWithPopup,
  googleProvider,
} from "../../firebase";
import { User } from "firebase/auth";

export default function Login() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        router.push("/client-requests");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      {user ? (
        <h1>Welcome, {user.displayName}</h1>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
}
