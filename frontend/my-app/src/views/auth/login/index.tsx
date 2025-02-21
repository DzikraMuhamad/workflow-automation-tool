import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./login.module.scss";
import {
  auth,
  onAuthStateChanged,
  signInWithPopup,
  googleProvider,
} from "../../../../firebase";
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
        <h1 className={styles.loginAccepts}>Welcome, {user.displayName}</h1>
      ) : (
        <div className={styles.loginPage}>
          <img src="baymax.png" alt="" className={styles.loginPage__image} />
          <div className={styles.loginPage__rightContent}>
            <h1>Selamat Datang di Website Client Request</h1>
            <button
              onClick={handleLogin}
              className={styles.loginPage__rightContent__button}
            >
              <img
                src="google.png"
                alt="google"
                className={styles.loginPage__rightContent__button__google}
              />{" "}
              Login With Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
