import React, { useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut } from "../../../../firebase";
import { useRouter } from "next/router";
import styles from "./navbar.module.scss";

const Navbar = () => {
  const [user, setUser] = useState<{ photoURL?: string | null }>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({ photoURL: currentUser.photoURL });
      } else {
        setUser({});
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div>
        <img
          src="fly_robot.png"
          alt="Baymax"
          className={styles["navbar__logo"]}
        />
      </div>
      <div className={styles["navbar__rightSection"]}>
        <input
          type="text"
          placeholder="Search..."
          className={styles["navbar__rightSection__search"]}
        />
        <div
          className={styles["navbar__rightSection__profile"]}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <img
            src={user.photoURL || "/default-avatar.png"}
            alt="Profile"
            className={styles["navbar__rightSection__profileImage"]}
          />
          {isDropdownOpen && (
            <div className={styles["navbar__dropdown"]}>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
