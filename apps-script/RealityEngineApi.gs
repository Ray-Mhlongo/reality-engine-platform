const CONFIG = {
  OPENROUTER_API_KEY: PropertiesService.getScriptProperties().getProperty("OPENROUTER_API_KEY"),
  POSTGRES_ENDPOINT: PropertiesService.getScriptProperties().getProperty("POSTGRES_ENDPOINT"),
  POSTGRES_SERVICE_TOKEN: PropertiesService.getScriptProperties().getProperty("POSTGRES_SERVICE_TOKEN")
};

function doPost(e) {
  const action = (e.parameter && e.parameter.action) || "";
  const payload = JSON.parse(e.postData.contents || "{}");

  if (action === "dataset.create") {
    return jsonResponse(storeDatasetMetadata(payload));
  }

  if (action === "ai.narrative") {
    return jsonResponse(generateOpenRouterNarrative(payload));
  }

  return jsonResponse({ error: "Unknown action" }, 404);
}

function storeDatasetMetadata(payload) {
  // Recommended production path: expose a small Cloudflare Worker or Supabase Edge Function
  // that writes to PostgreSQL using a server-side connection string. Apps Script calls it here.
  if (!CONFIG.POSTGRES_ENDPOINT) {
    return { stored: false, reason: "POSTGRES_ENDPOINT is not configured", payload };
  }

  const response = UrlFetchApp.fetch(CONFIG.POSTGRES_ENDPOINT + "/datasets", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + CONFIG.POSTGRES_SERVICE_TOKEN },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  return JSON.parse(response.getContentText());
}

function generateOpenRouterNarrative(payload) {
  const response = UrlFetchApp.fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + CONFIG.OPENROUTER_API_KEY,
      "HTTP-Referer": "https://reality-engine.app",
      "X-Title": "Reality Engine"
    },
    payload: JSON.stringify({
      model: payload.model || "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Reality Engine, a senior analyst. Use only the provided dataset profile and sample rows. Produce concise executive findings, risks, opportunities, actions, and business impact."
        },
        {
          role: "user",
          content: JSON.stringify({
            prompt: payload.prompt,
            analysis: payload.analysis,
            sampleRows: payload.sampleRows
          })
        }
      ],
      temperature: 0.2
    }),
    muteHttpExceptions: true
  });

  return JSON.parse(response.getContentText());
}

function jsonResponse(data, status) {
  return ContentService.createTextOutput(JSON.stringify({ status: status || 200, data })).setMimeType(
    ContentService.MimeType.JSON
  );
}
