"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignOutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="glass-card rounded-2xl p-8 w-full max-w-md shadow-2xl relative z-10 border border-border/50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Signout</h1>
          <p className="text-muted-foreground mb-8">
            Are you sure you want to sign out?
          </p>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full gradient-primary text-white font-medium py-3 px-6 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? "Signing out..." : "Sign out"}
          </button>

          <button
            onClick={() => router.back()}
            disabled={loading}
            className="w-full mt-4 bg-secondary/50 text-foreground font-medium py-3 px-6 rounded-xl hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
