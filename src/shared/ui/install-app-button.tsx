"use client";

import { useEffect, useState } from "react";
import { Button } from "./button";
import { RotatingLabel } from "./rotating-label";

/** Chrome / Edge / Android event; not yet in TypeScript's DOM types. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * "Install the app" button. Shown only when the browser says the site can be installed
 * (Chrome, Edge, Android); hidden on iPhone, where installing is done via Share > Add to Home Screen.
 */
export function InstallAppButton({ label }: { label: string }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvent) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await installEvent.prompt();
        await installEvent.userChoice;
        setInstallEvent(null);
      }}
    >
      <RotatingLabel>{label}</RotatingLabel>
    </Button>
  );
}
