import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, signOut, onAuthStateChanged } from "../../firebase";

interface ClientRequest {
  id: number;
  name: string;
  email: string;
  issue: string;
  status: string;
  created_at: string;
}

export default function ClientRequestPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true); // Tambahkan loading state
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
      setLoading(false); // Set loading ke false setelah selesai
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
            issue: issue.trim(), // Pastikan tidak ada whitespace berlebih
          }),
        }
      );

      if (response.ok) {
        setIssue(""); // Reset form setelah sukses
        fetchRequests(user.email); // Refresh data
        console.log("✅ Request berhasil dikirim ke Django & Webhook");
      } else {
        const errorResponse = await response.json();
        console.error("❌ Gagal mengirim request:", errorResponse);
      }
    } catch (error) {
      console.error("❌ Error submitting request:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Cegah render sebelum data siap
  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Client Request</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-2">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={user.name}
              disabled
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="border p-2 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium">Issue</label>
            <textarea
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="border p-2 w-full"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">
            Submit
          </button>
        </form>
      )}

      <h2 className="text-xl font-semibold mt-4">Your Requests</h2>
      <ul className="list-disc ml-5">
        {requests.map((req) => (
          <li key={req.id} className="border p-2 my-2">
            <p>
              <strong>Issue:</strong> {req.issue}
            </p>
            <p>
              <strong>Status:</strong> {req.status}
            </p>
            <p>
              <strong>Date:</strong> {new Date(req.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
