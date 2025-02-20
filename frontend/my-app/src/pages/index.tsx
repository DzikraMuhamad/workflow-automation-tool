import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

type ClientRequest = {
  name: string;
  email: string;
  issue: string;
};

export default function Home() {
  const [formData, setFormData] = useState<ClientRequest>({
    name: "",
    email: "",
    issue: "",
  });

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/client-requests/", formData);
      alert("Request submitted!");
      setFormData({ name: "", email: "", issue: "" });
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request.");
    }
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome {session?.user?.name}</h1>
      <p>Your email: {session?.user?.email}</p>

      <h2>Submit a Request</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="issue"
          placeholder="Describe your issue"
          value={formData.issue}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
