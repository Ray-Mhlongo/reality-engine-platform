const API_BASE_URL = import.meta.env.VITE_APPS_SCRIPT_API_URL || "";
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL || "openai/gpt-4o-mini";

export async function persistDatasetMetadata(metadata, profile) {
  if (!API_BASE_URL) {
    return { mode: "local", stored: false, metadata, profile };
  }

  const response = await fetch(`${API_BASE_URL}?action=dataset.create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metadata, profile })
  });

  if (!response.ok) throw new Error("Could not store dataset metadata.");
  return response.json();
}

export async function requestAiNarrative({ prompt, analysis, sampleRows }) {
  if (!API_BASE_URL) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}?action=ai.narrative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      prompt,
      analysis,
      sampleRows
    })
  });

  if (!response.ok) throw new Error("AI narrative request failed.");
  return response.json();
}
