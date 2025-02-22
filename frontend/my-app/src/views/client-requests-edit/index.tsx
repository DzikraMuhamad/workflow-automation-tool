import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, onAuthStateChanged } from "../../../firebase"; // Import Firebase Auth
import styles from "../client-requests-detail/client-request-detail.module.scss";

interface ClientRequest {
  id: number;
  name: string;
  email: string;
  issue: string;
  status: string;
  created_at: string;
}

const ClientRequestEditView = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [request, setRequest] = useState<ClientRequest | null>(null);
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName || "",
          email: currentUser.email || "",
        });
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!id || !user) return;

    fetch(`http://localhost:8000/api/client-requests/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.email !== user.email) {
          alert("You are not authorized to edit this request.");
          router.push("/client-requests");
        } else {
          setRequest(data);
          setIssue(data.issue);
        }
      })
      .catch((err) => console.error("Failed to fetch request:", err));
  }, [id, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/client-requests/${id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: request.name,
            email: request.email,
            issue: issue,
            status: request.status,
          }),
        }
      );

      if (response.ok) {
        alert("Issue updated successfully!");
        router.push(`/client-requests/${id}`);
      } else {
        const errorText = await response.text();
        alert(`Failed to update: ${errorText}`);
      }
    } catch (error) {
      console.error("Something went wrong while updating:", error);
      alert("Something went wrong while updating.");
    }
  };

  if (loading || !request) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1>Edit Client Request</h1>

      <form onSubmit={handleSubmit}>
        <table className={styles.container__table}>
          <tbody>
            <tr>
              <th>Name</th>
              <td>{request.name}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{request.email}</td>
            </tr>
            <tr>
              <th>Issue</th>
              <td>
                <input
                  type="text"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className={styles.container__table__input}
                />
              </td>
            </tr>
            <tr>
              <th>Status</th>
              <td>{request.status}</td>
            </tr>
            <tr>
              <th>Created At</th>
              <td>{new Date(request.created_at).toLocaleString()}</td>
            </tr>
            <tr>
              <th>Action</th>
              <td>
                <button
                  type="submit"
                  className={styles.container__table__editButton}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className={styles.container__table__deleteButton}
                  onClick={() => router.push(`/client-requests/${id}`)}
                >
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default ClientRequestEditView;
