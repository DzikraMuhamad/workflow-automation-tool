import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, onAuthStateChanged } from "../../../firebase";
import styles from "./client-requests.module.scss";
import Link from "next/link";

interface ClientRequest {
  id: number;
  name: string;
  email: string;
  issue: string;
  status: string;
  created_at: string;
}

const ClientRequestView = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState("");
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName || "",
          email: currentUser.email || "",
        });
        fetchRequests(currentUser.email || "");
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchRequests = async (email: string) => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/client-requests/"
      );
      const data: ClientRequest[] = await response.json();
      const userRequests = data.filter((req) => req.email === email);
      // Urutkan berdasarkan tanggal terbaru
      userRequests.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRequests(userRequests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch(
        "http://localhost:8000/api/client-requests/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            issue: issue.trim(),
          }),
        }
      );

      if (response.ok) {
        setIssue("");
        fetchRequests(user.email);
        console.log("✅ Request berhasil dikirim ke Django & Webhook");
      } else {
        console.error("❌ Gagal mengirim request:", await response.json());
      }
    } catch (error) {
      console.error("❌ Error submitting request:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <img src="bg.png" alt="Gambar" className={styles.background} />
      {user && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1>Client Request</h1>
          <div className={styles.form__formRow}>
            <div className={styles.form__formRow__inputGroup}>
              <label>Name</label>
              <input type="text" value={user.name} disabled />
            </div>
            <div className={styles.form__formRow__inputGroup}>
              <label>Email</label>
              <input type="email" value={user.email} disabled />
            </div>
            <div className={styles.form__formRow__inputGroup}>
              <label>Issue</label>
              <input
                type="text"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className={styles.form__formRow__submitButton}
            >
              Submit
            </button>
          </div>
        </form>
      )}
      <div className={styles.body}>
        <h2>Your Requests</h2>
        <div className={styles.body__requestContainer}>
          {requests.map((req) => (
            <Link key={req.id} href={`/client-requests/${req.id}`} passHref>
              <div className={styles.body__requestContainer__requestCard}>
                <p>
                  <strong>Issue:</strong> {req.issue}
                </p>
                <p>
                  <strong>Status:</strong> {req.status}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(req.created_at).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientRequestView;
