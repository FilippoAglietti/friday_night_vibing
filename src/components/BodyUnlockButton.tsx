"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Unlock } from "lucide-react";

interface BodyUnlockButtonProps {
  courseId: string;
  disabled?: boolean;
}

export function BodyUnlockButton({ courseId, disabled }: BodyUnlockButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/checkout/body-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || "Failed to start checkout");
      }
      const { url } = await resp.json() as { url: string };
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={disabled || loading} size="lg">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Unlock className="mr-2 h-4 w-4" />
        )}
        Unlock full course body — €5
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
