"use client";
import { useState } from "react";
import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

interface FAQ {
  question: string;
  answer: string;
}

export default function HelpPage() {
  const [faqs] = useState<FAQ[]>([
    {
      question: "How do I connect my exchange?",
      answer:
        "Go to the API Keys page, click 'Add API Key', select your exchange, and paste the API Key & Secret from your exchange's API settings page.",
    },
    {
      question: "Is my API key secure?",
      answer:
        "Yes. We only store encrypted API keys on our servers and never have withdrawal permissions. We use them only for trade and data retrieval.",
    },
    {
      question: "Can I trade on multiple exchanges at once?",
      answer:
        "Yes. You can switch between exchanges from the Trading or Portfolio pages, or view all combined data from the 'All' option.",
    },
  ]);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function saveMessage() {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${baseUrl}/api/help/support`,
      { contactForm },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data.success) {
      setSubmitted(true);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMessage();

  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Help & Support</h1>

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-yellow-400">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <summary className="cursor-pointer font-semibold text-white">
                {faq.question}
              </summary>
              <p className="mt-2 text-gray-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact Form Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-yellow-400">Contact Support</h2>
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-6 rounded-lg shadow space-y-4 max-w-2xl"
          >
            <div>
              <label className="block text-gray-300 mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                value={contactForm.name}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleChange}
                required
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Message</label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleChange}
                rows={4}
                required
                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
            >
              Send Message
            </button>
          </form>
        ) : (
          <div className="bg-green-900 text-green-200 rounded-lg p-6 max-w-2xl">
            ✅ Your message has been sent! Our support team will contact you soon.
          </div>
        )}
      </section>
    </div>
  );
}
