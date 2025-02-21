import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./client-request-detail.module.scss";
import Link from "next/link";

interface ClientRequest {
  id: number;
  name: string;
  email: string;
  issue: string;
  status: string;
  created_at: string;
}

const ClientRequestDetailView = () => {
  const router = useRouter();
  const { id } = router.query; // Tangkap ID dari URL
  const [request, setRequest] = useState<ClientRequest | null>(null);

  useEffect(() => {
    if (!id) return; // Jangan fetch kalau id masih undefined

    console.log("Router Query ID:", id); // Debugging
    fetch(`http://localhost:8000/api/client-requests/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Data:", data);
        setRequest(data);
      })
      .catch((err) => console.error("Failed to fetch request:", err));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/client-requests/${id}/`,
        { method: "DELETE" }
      );

      if (response.ok) {
        alert("Request deleted successfully!");
        router.push("/client-requests");
      } else {
        console.error("❌ Failed to delete request:", await response.json());
      }
    } catch (error) {
      console.error("❌ Error deleting request:", error);
    }
  };

  if (!request) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1>Issue Detail</h1>

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
            <td>{request.issue}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td className={styles.container__table__status}>
              {request.status}
            </td>
          </tr>
          <tr>
            <th>Created At</th>
            <td>{new Date(request.created_at).toLocaleString()}</td>
          </tr>
          <tr>
            <th>Action</th>
            <td>
              <Link href={`/client-requests/edit/${request.id}`} passHref>
                <button className={styles.container__table__editButton}>
                  Edit
                </button>
              </Link>
              <button
                onClick={handleDelete}
                className={styles.container__table__deleteButton}
              >
                Delete
              </button>
              <button
                onClick={() => router.push("/client-requests")}
                className={styles.container__table__backButton}
              >
                Back
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ClientRequestDetailView;
