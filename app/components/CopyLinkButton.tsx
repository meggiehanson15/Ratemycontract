"use client";

import { useState } from "react";

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
      alert("Couldn’t copy automatically. You can copy the URL from the address bar.");
    }
  }

  return (
    <button className="pill" type="button" onClick={copy}>
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}