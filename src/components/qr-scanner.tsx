"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type CheckinResult = {
  result:
    | "success"
    | "already_checked_in"
    | "not_confirmed"
    | "invalid_status"
    | "not_found"
    | "invalid"
    | "unauthorized";
  registration?: { email: string; name: string };
  status?: string;
};

const SCANNER_ELEMENT_ID = "qr-reader";
const RESCAN_COOLDOWN_MS = 2000;

const bannerStyles: Record<CheckinResult["result"], string> = {
  success: "bg-green-600",
  already_checked_in: "bg-yellow-500",
  not_confirmed: "bg-yellow-500",
  invalid_status: "bg-red-600",
  not_found: "bg-red-600",
  invalid: "bg-red-600",
  unauthorized: "bg-red-600",
};

const bannerLabels: Record<CheckinResult["result"], string> = {
  success: "OBECNY",
  already_checked_in: "JUŻ OBECNY",
  not_confirmed: "NIEPOTWIERDZONY",
  invalid_status: "NIEAKTUALNY BILET",
  not_found: "NIE ZNALEZIONO",
  invalid: "NIEPRAWIDŁOWY KOD",
  unauthorized: "BRAK SESJI — ZALOGUJ SIĘ PONOWNIE",
};

export function QrScanner({ eventId }: { eventId: string }) {
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);
  const lastCodeRef = useRef<{ code: string; at: number } | null>(null);

  useEffect(() => {
    return () => {
      scannerRef.current
        ?.stop()
        .then(() => scannerRef.current?.clear())
        .catch(() => {});
    };
  }, []);

  async function startScanning() {
    setCameraError(null);
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => handleScan(decodedText),
        () => {
          // per-frame "no QR found" — expected on most frames, ignore.
        },
      );
      setScanning(true);
    } catch (err) {
      setCameraError(
        err instanceof Error ? err.message : "Nie udało się uruchomić kamery",
      );
    }
  }

  async function handleScan(decodedText: string) {
    const now = Date.now();
    if (
      lastCodeRef.current &&
      lastCodeRef.current.code === decodedText &&
      now - lastCodeRef.current.at < RESCAN_COOLDOWN_MS
    ) {
      return;
    }
    if (busyRef.current) return;
    busyRef.current = true;
    lastCodeRef.current = { code: decodedText, at: now };

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: decodedText, eventId }),
      });
      const data: CheckinResult = await res.json();
      setLastResult(data);
    } catch {
      setLastResult({ result: "invalid" });
    } finally {
      setTimeout(() => {
        busyRef.current = false;
      }, RESCAN_COOLDOWN_MS);
    }
  }

  return (
    <div>
      {cameraError && (
        <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          Błąd kamery: {cameraError}
        </p>
      )}

      {!scanning && (
        <button
          onClick={startScanning}
          className="mx-auto block rounded bg-black px-6 py-3 text-sm font-medium text-white"
        >
          SKANUJ
        </button>
      )}

      <div id={SCANNER_ELEMENT_ID} className="mx-auto max-w-sm" />

      {lastResult && (
        <div
          className={`mt-4 rounded p-4 text-center text-white ${bannerStyles[lastResult.result]}`}
        >
          <p className="text-lg font-bold">{bannerLabels[lastResult.result]}</p>
          {lastResult.registration && (
            <p className="mt-1 text-sm">
              {lastResult.registration.name || lastResult.registration.email}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
