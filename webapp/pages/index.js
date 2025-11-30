import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

      if (!webhookUrl) {
        throw new Error("Webhook URL tidak dikonfigurasi. Pastikan NEXT_PUBLIC_N8N_WEBHOOK_URL sudah di-set di .env.local");
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      // Sesuaikan dengan struktur response dari n8n
      // Biasanya n8n return array, ambil item pertama
      const result = Array.isArray(data) ? data[0] : data;
      setAnswer(result.answer || result.text || JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memanggil n8n webhook");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>RAG WebApp - Progress 3</title>
        <meta name="description" content="WebApp untuk RAG Project - Workflow 2" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>RAG WebApp</h1>
          <p style={styles.subtitle}>Progress 3 - WebApp → n8n → OpenAI</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Masukkan pertanyaan Anda..." style={styles.textarea} rows={4} disabled={loading} />

            <button type="submit" disabled={loading || !question.trim()} style={styles.button}>
              {loading ? "Memproses..." : "Kirim Pertanyaan"}
            </button>
          </form>

          {error && (
            <div style={styles.error}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {answer && (
            <div style={styles.answer}>
              <h3 style={styles.answerTitle}>Jawaban:</h3>
              <div style={styles.answerText}>{answer}</div>
            </div>
          )}

          <div style={styles.info}>
            <p>
              <strong>Webhook URL:</strong> {process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "Belum dikonfigurasi"}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "800px",
    width: "100%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "24px",
  },
  form: {
    marginBottom: "24px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "16px",
    fontFamily: "inherit",
    resize: "vertical",
    marginBottom: "16px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px 24px",
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  error: {
    backgroundColor: "#fee",
    border: "1px solid #fcc",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
    color: "#c33",
  },
  answer: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "16px",
  },
  answerTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "12px",
    color: "#333",
  },
  answerText: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#555",
    whiteSpace: "pre-wrap",
  },
  info: {
    marginTop: "24px",
    padding: "12px",
    backgroundColor: "#f0f0f0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#666",
  },
};
