import { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); // { id, role: 'user' | 'assistant', text }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = question.trim();

    // Tambahkan pesan user ke riwayat chat
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        text: userMessage,
      },
    ]);

    setLoading(true);
    setError("");
    setQuestion("");

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
      const botText = result.answer || result.text || JSON.stringify(result, null, 2);

      // Tambahkan jawaban bot ke riwayat chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: botText,
        },
      ]);
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
        <div style={styles.chatWrapper}>
          <header style={styles.header}>
            <div>
              <h1 style={styles.title}>RAG WebApp</h1>
              <p style={styles.subtitle}>Progress 3 - WebApp → n8n → OpenAI</p>
            </div>
            <span style={styles.status}>Terhubung</span>
          </header>

          <section style={styles.chatArea}>
            {messages.length === 0 && !loading && !error && (
              <div style={styles.emptyState}>
                <p style={styles.emptyTitle}>Mulai obrolan</p>
                <p style={styles.emptyText}>Tanyakan apa saja, riwayat chat Anda akan muncul di sini seperti WhatsApp.</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    ...(msg.role === "user" ? styles.userBubble : styles.assistantBubble),
                  }}
                >
                  <div style={styles.bubbleText}>{msg.text}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "8px" }}>
                <div style={{ ...styles.bubble, ...styles.assistantBubble, opacity: 0.8 }}>
                  <div style={styles.typingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={styles.error}>
                <strong>Error:</strong> {error}
              </div>
            )}
          </section>

          <form onSubmit={handleSubmit} style={styles.inputBar}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ketik pesan..."
              style={styles.input}
              rows={2}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading && question.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
            />

            <button type="submit" disabled={loading || !question.trim()} style={styles.sendButton}>
              {loading ? "..." : "Kirim"}
            </button>
          </form>

          <div style={styles.footerInfo}>
            <span>Webhook: {process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "Belum dikonfigurasi"}</span>
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
    backgroundColor: "#FFFFFF",
    padding: "12px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  chatWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: "24px",
    padding: "0",
    maxWidth: "1100px",
    width: "100%",
    height: "88vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
    border: "1px solid #E5E7EB",
  },
  header: {
    padding: "16px 24px",
    backgroundImage: "linear-gradient(135deg, #2563EB, #60A5FA)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: "16px",
    color: "rgba(241, 245, 249, 0.85)",
    margin: 0,
  },
  status: {
    fontSize: "14px",
    color: "#0F172A",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: "4px 10px",
    borderRadius: "999px",
    border: "none",
  },
  chatArea: {
    flex: 1,
    padding: "16px 16px 8px 16px",
    overflowY: "auto",
    backgroundColor: "#F8FAFC",
  },
  bubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: "18px",
    fontSize: "15px",
    lineHeight: 1.5,
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.06)",
  },
  userBubble: {
    backgroundColor: "#2563EB",
    color: "#FFFFFF",
    borderBottomRightRadius: "4px",
  },
  assistantBubble: {
    backgroundColor: "#F1F5F9",
    color: "#0F172A",
    borderBottomLeftRadius: "4px",
    border: "1px solid #E5E7EB",
  },
  bubbleText: {
    whiteSpace: "pre-wrap",
  },
  typingDots: {
    display: "flex",
    gap: "4px",
  },
  inputBar: {
    display: "flex",
    alignItems: "flex-end",
    padding: "12px 16px",
    gap: "10px",
    borderTop: "1px solid #E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "999px",
    border: "1px solid #E5E7EB",
    backgroundColor: "#F9FAFB",
    color: "#0F172A",
    fontSize: "15px",
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
  },
  sendButton: {
    padding: "10px 18px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #2563EB, #60A5FA)",
    color: "#FFFFFF",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "14px",
    transition: "opacity 0.2s, transform 0.1s",
  },
  footerInfo: {
    padding: "4px 16px 10px 16px",
    fontSize: "11px",
    color: "#6B7280",
    backgroundColor: "#FFFFFF",
    borderTop: "1px solid #E5E7EB",
    textAlign: "right",
  },
  error: {
    backgroundColor: "rgba(248, 113, 113, 0.08)",
    border: "1px solid rgba(248, 113, 113, 0.7)",
    borderRadius: "12px",
    padding: "10px 12px",
    margin: "8px 0",
    color: "#FCA5A5",
    fontSize: "13px",
  },
  emptyState: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748B",
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "4px",
  },
  emptyText: {
    fontSize: "14px",
  },
};
