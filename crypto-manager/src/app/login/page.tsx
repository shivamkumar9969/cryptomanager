'use client';

import { Suspense } from "react";
import AuthTogglePage from "./AuthTogglePage";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthTogglePage />
    </Suspense>
  );
}
