"use client";
import { useState } from "react";

export default function SettingsPage() {
    const [form, setForm] = useState({
        name: "John Doe", // Replace with actual user info from backend
        email: "john@example.com",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFA: false,
        theme: "dark",
        emailNotifications: true,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox" && "checked" in e.target) {
            const checked = (e.target as HTMLInputElement).checked;
            setForm((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Settings saved! (Integrate API to update in backend)");
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 rounded-xl p-6 shadow space-y-6"
            >
                {/* --- Profile Info --- */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-yellow-400">Profile Info</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* --- Security --- */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-yellow-400">Security</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-1">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={form.currentPassword}
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-1">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={form.newPassword}
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-gray-300 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                        <input
                            type="checkbox"
                            name="twoFA"
                            id="twoFA"
                            checked={form.twoFA}
                            onChange={handleChange}
                            className="w-5 h-5 text-yellow-500 border-gray-700 bg-gray-900"
                        />
                        <label htmlFor="twoFA" className="text-gray-300">
                            Enable Two-Factor Authentication (2FA)
                        </label>
                    </div>
                </div>

                {/* --- Preferences --- */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-yellow-400">Preferences</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 mb-1">Theme</label>
                            <select
                                name="theme"
                                value={form.theme}
                                onChange={handleChange}
                                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                            >
                                <option value="dark">Dark Mode</option>
                                <option value="light">Light Mode</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3 mt-6 sm:mt-0">
                            <input
                                type="checkbox"
                                name="emailNotifications"
                                id="emailNotifications"
                                checked={form.emailNotifications}
                                onChange={handleChange}
                                className="w-5 h-5 text-yellow-500 border-gray-700 bg-gray-900"
                            />
                            <label htmlFor="emailNotifications" className="text-gray-300">
                                Email Notifications
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-lg font-semibold transition"
                >
                    Save Settings
                </button>
            </form>
        </div>
    );
}
