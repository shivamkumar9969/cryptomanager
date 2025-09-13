"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const SECTIONS = ["Profile", "Change Password", "Preferences"] as const;
type Section = typeof SECTIONS[number];

export default function SettingsPage() {
    const [currentSection, setCurrentSection] = useState<Section>("Profile");

    const [form, setForm] = useState({ name: "", email: "" });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [settings, setSettings] = useState({
        twoFactorAuth: false,
        darkMode: false,
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const [profileRes, settingsRes] = await Promise.all([
                    axios.get(`${baseUrl}/api/user/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${baseUrl}/api/settings`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                setForm({ name: profileRes.data.name, email: profileRes.data.email });
                setSettings({
                    twoFactorAuth: settingsRes.data.twoFactorAuth,
                    darkMode: settingsRes.data.darkMode,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${baseUrl}/api/user/profile`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage("Profile updated successfully!");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setMessage((err.response?.data as { message?: string })?.message || "Profile update failed");
            } else {
                setMessage("Profile update failed");
            }
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return setMessage("New passwords do not match!");
        }
        try {
            const token = localStorage.getItem("token");
            await axios.put(`${baseUrl}/api/user/change-password`, passwordForm, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage("Password changed successfully!");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setMessage((err.response?.data as { message?: string })?.message || "Password update failed");
            } else {
                setMessage("Password update failed");
            }
        }
    };

    const handleSettingToggle = async (key: "twoFactorAuth" | "darkMode") => {
        const newValue = !settings[key];
        setSettings({ ...settings, [key]: newValue });

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${baseUrl}/api/settings`,
                { [key]: newValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(`${key === "twoFactorAuth" ? "Two-Factor Auth" : "Dark Mode"} updated`);
        } catch (err) {
             if (axios.isAxiosError(err)) {
                setMessage((err.response?.data as { message?: string })?.message || "Failed to update setting");
            } else {
                setMessage("Failed to update setting");
            }
        }
    };

    if (loading)
        return <div className="flex justify-center items-center h-screen text-gray-400">Loading...</div>;

    const SidebarItem = ({ name }: { name: Section }) => (
        <button
            onClick={() => setCurrentSection(name)}
            className={`block w-full text-left px-6 py-3 rounded-md mb-2 transition ${currentSection === name
                ? "bg-yellow-500 text-black font-semibold"
                : "text-gray-300 hover:bg-yellow-600 hover:text-black"
                }`}

        >
            {name}
        </button>
    );

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            <aside className="w-60 bg-gray-800 p-6 flex flex-col">
                <h1 className="text-yellow-400 text-xl font-bold mb-8">Settings</h1>
                {SECTIONS.map((section) => (
                    <SidebarItem key={section} name={section} />
                ))}
            </aside>

            <main className="flex-1 overflow-y-auto p-8 max-w-4xl w-full">
                {message && (
                    <div className="mb-6 p-4 bg-yellow-500 text-gray-900 rounded shadow font-medium">
                        {message}
                    </div>
                )}

                {currentSection === "Profile" && (
                    <section className="space-y-6">
                        <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-yellow-600 pb-2">
                            Profile Information
                        </h2>
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-400" htmlFor="name">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:outline-yellow-400"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-400" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:outline-yellow-400"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-yellow-500 hover:bg-yellow-600 rounded-lg py-3 font-semibold text-gray-900 transition"
                            >
                                Save Profile
                            </button>
                        </form>
                    </section>
                )}

                {currentSection === "Change Password" && (
                    <section className="space-y-6">
                        <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-yellow-600 pb-2">
                            Change Password
                        </h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div>
                                <label
                                    className="block mb-2 text-sm font-medium text-gray-400"
                                    htmlFor="currentPassword"
                                >
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    id="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:outline-yellow-400"
                                />
                            </div>
                            <div>
                                <label
                                    className="block mb-2 text-sm font-medium text-gray-400"
                                    htmlFor="newPassword"
                                >
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    id="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:outline-yellow-400"
                                />
                            </div>
                            <div>
                                <label
                                    className="block mb-2 text-sm font-medium text-gray-400"
                                    htmlFor="confirmPassword"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    id="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:outline-yellow-400"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-yellow-500 hover:bg-yellow-600 rounded-lg py-3 font-semibold text-gray-900 transition"
                            >
                                Update Password
                            </button>
                        </form>
                    </section>
                )}

                {currentSection === "Preferences" && (
                    <section className="space-y-6">
                        <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-yellow-600 pb-2">
                            Preferences
                        </h2>
                        <div className="flex items-center justify-between mb-6">
                            <label className="text-gray-300 font-medium" htmlFor="twoFactorAuth">
                                Two-Factor Authentication
                            </label>
                            <input
                                id="twoFactorAuth"
                                type="checkbox"
                                checked={settings.twoFactorAuth}
                                onChange={() => handleSettingToggle("twoFactorAuth")}
                                className="h-6 w-6 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-400"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-gray-300 font-medium" htmlFor="darkMode">
                                Dark Mode
                            </label>
                            <input
                                id="darkMode"
                                type="checkbox"
                                checked={settings.darkMode}
                                onChange={() => handleSettingToggle("darkMode")}
                                className="h-6 w-6 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-400"
                            />
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
