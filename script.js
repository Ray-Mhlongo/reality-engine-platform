window.RAY_AI_CONFIG = window.RAY_AI_CONFIG || {
  provider: "openrouter",
  apiKey: "proxy",
  model: "deepseek/deepseek-chat-v3:free"
};

const showMenu = (toggleId, navId) => {
  const toggle = document.getElementById(toggleId);
  const nav = document.getElementById(navId);

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("show");
    });
  }
};

showMenu("nav-toggle", "nav-menu");

const navLinks = document.querySelectorAll(".nav-link:not(.nav-dropdown-toggle), .nav-dropdown-link");

function linkAction() {
  const navMenu = document.getElementById("nav-menu");
  if (navMenu) navMenu.classList.remove("show");

  document.querySelectorAll(".nav-dropdown.open").forEach((dropdown) => dropdown.classList.remove("open"));
  document.querySelectorAll(".nav-dropdown-toggle[aria-expanded='true']").forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "false");
  });
}

navLinks.forEach((link) => link.addEventListener("click", linkAction));

document.querySelectorAll(".nav-dropdown-toggle").forEach((toggle) => {
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const dropdown = toggle.closest(".nav-dropdown");
    const isOpen = dropdown?.classList.contains("open");

    document.querySelectorAll(".nav-dropdown.open").forEach((item) => item.classList.remove("open"));
    document.querySelectorAll(".nav-dropdown-toggle[aria-expanded='true']").forEach((item) => {
      item.setAttribute("aria-expanded", "false");
    });

    if (!dropdown || isOpen) return;
    dropdown.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".nav-dropdown.open").forEach((dropdown) => dropdown.classList.remove("open"));
  document.querySelectorAll(".nav-dropdown-toggle[aria-expanded='true']").forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "false");
  });
});

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

const counters = document.querySelectorAll(".counter");
if (counters.length) {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const counter = entry.target;
        const target = Number(counter.dataset.count || 0);
        const duration = 1400;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.round(target * eased).toLocaleString();

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
        counterObserver.unobserve(counter);
      });
    },
    { threshold: 0.35 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

const queryCards = document.querySelectorAll(".query-card[data-query]");
if (queryCards.length) {
  const queryObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const card = entry.target;
        const code = card.querySelector("code");
        const query = card.dataset.query || "";
        let index = 0;

        const type = () => {
          if (!code) return;
          code.textContent = query.slice(0, index);
          index += 2;
          if (index <= query.length + 2) {
            setTimeout(type, 18);
          }
        };

        type();
        queryObserver.unobserve(card);
      });
    },
    { threshold: 0.28 }
  );

  queryCards.forEach((card) => queryObserver.observe(card));
}

document.querySelectorAll(".slicer").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.closest(".dashboard-panel");
    if (!panel) return;

    panel.querySelectorAll(".slicer").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    panel.querySelectorAll(".bar-chart span").forEach((bar, index) => {
      bar.style.animation = "none";
      bar.offsetHeight;
      bar.style.animation = `chartLoad 0.8s ease ${index * 60}ms both`;
    });
  });
});

document.querySelectorAll(".skill-video-trigger").forEach((button) => {
  const shell = button.closest(".skill-video-shell");
  if (shell && !shell.querySelector(".skill-video-panel.active")) {
    const firstButton = shell.querySelector(".skill-video-trigger");
    const firstTarget = document.getElementById(firstButton?.dataset.videoTarget || "");
    firstButton?.classList.add("active");
    firstTarget?.classList.add("active");
  }

  button.addEventListener("click", () => {
    const shell = button.closest(".skill-video-shell");
    const target = document.getElementById(button.dataset.videoTarget || "");
    if (!shell || !target) return;

    shell.querySelectorAll(".skill-video-trigger").forEach((item) => item.classList.remove("active"));
    shell.querySelectorAll(".skill-video-panel").forEach((panel) => {
      panel.classList.remove("active");
      panel.querySelector("video")?.pause();
    });

    button.classList.add("active");
    target.classList.add("active");
  });
});

document.querySelectorAll(".skills-category-tab").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.skillCategory || "";
    const firstSkill = document.querySelector(`.skills-list[data-skill-list="${category}"] [data-skill-target]`);

    document.querySelectorAll(".skills-category-tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".skills-list").forEach((list) => list.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`.skills-list[data-skill-list="${category}"]`)?.classList.add("active");
    firstSkill?.click();
  });
});

document.querySelectorAll("[data-skill-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.skillTarget || "";

    document.querySelectorAll("[data-skill-target]").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".skill-detail-panel").forEach((panel) => {
      panel.classList.remove("active");
      panel.querySelectorAll("video").forEach((video) => video.pause());
    });

    button.classList.add("active");
    document.querySelector(`[data-skill-detail="${target}"]`)?.classList.add("active");
  });
});

if (window.ScrollReveal) {
  const sr = ScrollReveal({
    origin: "top",
    distance: "70px",
    duration: 1400,
    reset: false,
  });

  sr.reveal(".home-title", {});
  sr.reveal(".home-text", { delay: 150 });
  sr.reveal(".button", { delay: 220 });
  sr.reveal(".home-img", { delay: 320 });
  sr.reveal(".home-social", { delay: 380 });
  sr.reveal(".about-img", {});
  sr.reveal(".about-subtitle", { delay: 150 });
  sr.reveal(".about-text", { delay: 260 });
  sr.reveal(".skills-subtitle", { delay: 100 });
  sr.reveal(".skills-text", { delay: 160 });
  sr.reveal(".skills-data", { interval: 140 });
  sr.reveal(".skills-img", { delay: 260 });
  sr.reveal(".insight-card", { interval: 160 });
  sr.reveal(".project-card", { interval: 160 });
  sr.reveal(".case-card", { interval: 160 });
  sr.reveal(".skill-showcase", { interval: 180 });
  sr.reveal(".showcase-kpi", { interval: 120 });
  sr.reveal(".query-card", { interval: 160 });
  sr.reveal(".schema-card, .spreadsheet-card, .dashboard-panel, .terminal-card, .topology-card", { interval: 160 });
  sr.reveal(".project-visual", { delay: 200 });
  sr.reveal(".media-frame", { delay: 200 });
  sr.reveal(".skill-hero", { delay: 120 });
  sr.reveal(".skill-video-actions", { delay: 150 });
  sr.reveal(".skill-video-panel", { delay: 220 });
  sr.reveal(".skills-category-tab", { interval: 80 });
  sr.reveal(".skills-browser", { delay: 180 });
  sr.reveal(".contact-card", { interval: 160 });
  sr.reveal(".contact-input", { interval: 130 });
  sr.reveal(".ray-ai-copy", { delay: 120 });
  sr.reveal(".ray-ai-panel", { delay: 220 });
}

const rayAiPrompts = [
  "Why should I hire you?",
  "What project should I view first?",
  "Compare my skills to this job description",
  "Interview me for a Data Analyst role"
];

const rayAiHelperMessages = [
  "Ask me about my SQL projects",
  "Ask me about my certifications",
  "Ask me about my dashboard work",
  "Ask me about networking and IT support",
  "Ask me about data analytics",
  "Ask me why I built a project",
  "Ask me what I am currently studying",
  "Ask me how I solve business problems with data"
];

const rayAiSupportsClipboard = () => Boolean(navigator.clipboard?.writeText);
const rayAiSupportsShare = () => Boolean(navigator.share);
const rayAiSupportsSpeech = () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

const rayAiDefaultProvider = "openrouter";
const rayAiDefaultModel = "deepseek/deepseek-chat-v3:free";

const rayAiPortfolioContext = () => {
  if (typeof window.buildPortfolioContext === "function") {
    return window.buildPortfolioContext();
  }

  return "You are the digital version of Ray speaking through the portfolio website. Use first person, stay professional, and answer from portfolio evidence.";
};
function rayAiEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function rayAiFormatResponse(value) {
  const safe = rayAiEscape(value);
  return safe
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

function rayAiLocalFallback(prompt) {
  const question = prompt.toLowerCase();
  const projects = window.projectsData || [];
  const skills = window.skillsData || [];
  const certifications = window.certificationsData || [];
  const contact = window.contactData || {};
  const topProject = projects[0];

  if (question.includes("job description") || question.includes("match percentage") || question.includes("compare my skills")) {
    const skillMatches = skills
      .filter((skill) => question.includes(skill.name.toLowerCase()))
      .map((skill) => skill.name);
    const match = Math.min(92, 58 + skillMatches.length * 6);
    return `Based on my portfolio, I would estimate a match of about ${match} percent. My strongest aligned skills are ${skillMatches.length ? skillMatches.join(", ") : "SQL, Excel, dashboards, business analysis, and data cleaning"}. The best project evidence is ${topProject?.title || "PC Parts Market Intelligence"} because it shows database design, analysis, reporting, and business insight. Possible gaps depend on the role requirements, so I would compare the job description against my certifications, project tools, and dashboard evidence before tailoring a CV.`;
  }

  if (question.includes("interview me")) {
    return "Let us start with one question. Tell me about a data project you built, the business problem it solved, the tools you used, and the insight you found.";
  }

  if (question.includes("what project should") || question.includes("view first") || question.includes("recommend")) {
    return `I recommend viewing ${topProject?.title || "PC Parts Market Intelligence"} first. It gives the strongest evidence of my SQL, Excel, dashboard design, pricing analysis, inventory analysis, and business storytelling skills.`;
  }

  if (question.includes("business problem") || question.includes("solve with data")) {
    return "I use data to solve business problems like comparing product prices and service packages, finding strong value options, tracking sales and revenue, spotting busy periods, cleaning messy records, measuring product performance, and turning raw data into dashboard insights that support better decisions.";
  }

  if (question.includes("portfolio") || question.includes("recruiter") || question.includes("summarize")) {
    return "I am a data analyst focused on SQL, Excel, Power BI, Python foundations, data cleaning, dashboards, business intelligence, IT infrastructure, automation, and product development. My portfolio is organized into analytics projects, including PC Parts Market Intelligence, Degree Does Not Equal Ability, Beyond Hospitals, and Church Member Verification System, plus products including LearnView Nexus, Cathdel Creamy, Insight Rides, and Ray AI.";
  }

  if (question.includes("project") || question.includes("sql") || question.includes("power bi")) {
    return "My strongest SQL project is PC Parts Market Intelligence because I designed a relational database, analyzed pricing and sales data, used joins and ranking, and built Excel dashboards for market insight.";
  }

  if (question.includes("contact") || question.includes("hire") || question.includes("email")) {
    return `You can contact me through the portfolio contact page, email me at ${contact.email || "rodgersmhlongo@gmail.com"}, or visit my LinkedIn and GitHub profiles from the site links.`;
  }

  return `I focus on ${skills.slice(0, 5).map((skill) => skill.name).join(", ")}, data cleaning, dashboards, pricing analysis, sales insights, and practical business decision support. My certifications include ${certifications.slice(0, 3).map((cert) => cert.name).join(", ")}. Ask me about my projects, certifications, skills, or career journey.`;
}

function rayAiAddMessage(container, role, html) {
  const message = document.createElement("div");
  message.className = `ray-ai-message ${role}`;
  message.innerHTML = role === "user" ? `<p>${rayAiEscape(html)}</p>` : `<p>${html}</p>`;
  container.appendChild(message);
  rayAiScrollToLatest(container);
  return message;
}

function rayAiScrollToLatest(container) {
  requestAnimationFrame(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  });
}

function rayAiSetStatus(panel, text) {
  const status = panel.querySelector("[data-ray-ai-status]");
  if (!status) return;
  status.textContent = text;
}

function rayAiHistoryText(history) {
  return history
    .map((item) => {
      const speaker = item.role === "user" ? "You" : "Ray AI";
      const text = item.parts?.map((part) => part.text || "").join("").trim();
      return text ? `${speaker}: ${text}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

async function rayAiCopyText(text) {
  if (!text || !rayAiSupportsClipboard()) return false;
  await navigator.clipboard.writeText(text);
  return true;
}

function rayAiAddLoader(container) {
  const message = document.createElement("div");
  message.className = "ray-ai-message assistant ray-ai-loading";
  message.innerHTML = "<span></span><span></span><span></span>";
  container.appendChild(message);
  rayAiScrollToLatest(container);
  return message;
}

function rayAiConfig() {
  const config = window.RAY_AI_CONFIG || {};
  const provider = String(config.provider || rayAiDefaultProvider).trim().toLowerCase();
  const apiKey = String(config.apiKey || "").trim();
  const model = String(config.model || rayAiDefaultModel).trim();
  return { apiKey, model, provider };
}

function rayAiGroqMessages(prompt, history) {
  const messages = [
    { role: "system", content: rayAiPortfolioContext() },
    ...history.slice(-8).map((item) => ({
      role: item.role === "model" ? "assistant" : "user",
      content: item.parts?.map((part) => part.text || "").join("").trim()
    })),
    { role: "user", content: prompt }
  ];

  return messages.filter((message) => message.content);
}

async function rayAiGenerateWithGroq(prompt, history, apiKey, model) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: rayAiGroqMessages(prompt, history),
      temperature: 0.8,
      top_p: 0.95,
      max_completion_tokens: 900
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || "The chat connection could not answer right now.";
    throw new Error(message);
  }

  const answer = data?.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("The chat returned an empty response. Try a different prompt.");
  }

  return answer;
}

async function rayAiGenerateWithGemini(prompt, history, apiKey, model) {
  const contents = [
    ...history.slice(-8),
    {
      role: "user",
      parts: [{ text: prompt }]
    }
  ];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: rayAiPortfolioContext() }]
      },
      contents,
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: "text/plain"
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || "The chat connection could not answer right now.";
    throw new Error(message);
  }

  const answer = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!answer) {
    throw new Error("The chat returned an empty response. Try a different prompt.");
  }

  return answer;
}

async function rayAiGenerateWithOpenRouter(prompt, history, apiKey, model) {
  const response = await fetch("https://ray-ai-proxy.rodgersmhlongo.workers.dev", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: rayAiGroqMessages(prompt, history)
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || "The chat connection could not answer right now.";
    throw new Error(message);
  }

  const answer = data?.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw new Error("The chat returned an empty response.");
  }

  return answer;
}

async function rayAiGenerate(prompt, history) {
  const { apiKey, model, provider } = rayAiConfig();

  if (!apiKey || apiKey.includes("PASTE_YOUR")) {
    throw new Error("The chat connection is not ready. Refresh the page and try again.");
  }

  if (provider === "groq") {
    return rayAiGenerateWithGroq(prompt, history, apiKey, model);
  }

  if (provider === "gemini" || provider === "google") {
    return rayAiGenerateWithGemini(prompt, history, apiKey, model);
  }

  if (provider === "openrouter") {
    return rayAiGenerateWithOpenRouter(prompt, history, apiKey, model);
  }

  throw new Error("The chat connection is not configured for this request.");
}

function rayAiAttachPanel(panel) {
  const messages = panel.querySelector("[data-ray-ai-messages]");
  const prompts = panel.querySelector("[data-ray-ai-prompts]");
  const form = panel.querySelector("[data-ray-ai-form]");
  const input = panel.querySelector("[data-ray-ai-input]");

  if (!messages || !prompts || !form || !input) return;

  const history = [];
  const actions = panel.querySelector("[data-ray-ai-actions]");
  const clearButton = panel.querySelector("[data-ray-ai-clear]");
  const copyButton = panel.querySelector("[data-ray-ai-copy]");
  const shareButton = panel.querySelector("[data-ray-ai-share]");
  const voiceButton = panel.querySelector("[data-ray-ai-voice]");
  const count = panel.querySelector("[data-ray-ai-count]");
  const helper = panel.querySelector("[data-ray-ai-helper]");
  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;
  let helperIndex = 0;

  if (helper) {
    helper.textContent = rayAiHelperMessages[0];
    setInterval(() => {
      helperIndex = (helperIndex + 1) % rayAiHelperMessages.length;
      helper.textContent = rayAiHelperMessages[helperIndex];
    }, 3600);
  }

  const updatePremiumControls = () => {
    const hasHistory = history.length > 0;
    actions?.classList.toggle("is-active", hasHistory);
    if (copyButton) copyButton.disabled = !hasHistory || !rayAiSupportsClipboard();
    if (shareButton) shareButton.disabled = !hasHistory || !rayAiSupportsShare();
    if (clearButton) clearButton.disabled = !hasHistory;
  };

  const updateCount = () => {
    if (!count) return;
    count.textContent = `${input.value.length}/500`;
  };

  input.setAttribute("maxlength", "500");
  input.addEventListener("input", updateCount);
  updateCount();
  updatePremiumControls();

  if (voiceButton && speechRecognition) {
    recognition = new speechRecognition();
    recognition.lang = "en-ZA";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener("start", () => {
      voiceButton.classList.add("is-listening");
      voiceButton.setAttribute("aria-label", "Listening");
      rayAiSetStatus(panel, "Listening...");
    });

    recognition.addEventListener("result", (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      input.value = transcript.trim();
      updateCount();
      rayAiSetStatus(panel, transcript ? "Voice captured. Tap send when ready." : "No speech captured.");
    });

    recognition.addEventListener("end", () => {
      voiceButton.classList.remove("is-listening");
      voiceButton.setAttribute("aria-label", "Voice prompt");
    });

    recognition.addEventListener("error", () => {
      voiceButton.classList.remove("is-listening");
      rayAiSetStatus(panel, "Voice input is not available right now.");
    });

    voiceButton.addEventListener("click", () => {
      try {
        recognition.start();
      } catch (error) {
        rayAiSetStatus(panel, "Voice input is already listening.");
      }
    });
  } else if (voiceButton) {
    voiceButton.disabled = true;
    voiceButton.title = "Voice input is not supported in this browser";
  }

  clearButton?.addEventListener("click", () => {
    history.length = 0;
    messages.innerHTML = "";
    prompts.classList.remove("is-hidden");
    rayAiSetStatus(panel, "Chat cleared.");
    updatePremiumControls();
  });

  copyButton?.addEventListener("click", async () => {
    const copied = await rayAiCopyText(rayAiHistoryText(history)).catch(() => false);
    rayAiSetStatus(panel, copied ? "Transcript copied." : "Copy is not available in this browser.");
  });

  shareButton?.addEventListener("click", async () => {
    const text = rayAiHistoryText(history);
    if (!text || !rayAiSupportsShare()) return;
    await navigator.share({ title: "Ray AI chat", text }).catch(() => {});
  });

  prompts.innerHTML = "";

  rayAiPrompts.forEach((prompt) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ray-ai-chip";
    button.textContent = prompt;
    button.addEventListener("click", () => {
      input.value = prompt;
      form.requestSubmit();
    });
    prompts.appendChild(button);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = input.value.trim();
    if (!question) return;

    input.blur();
    prompts.classList.add("is-hidden");
    rayAiAddMessage(messages, "user", question);
    input.value = "";
    updateCount();

    const loader = rayAiAddLoader(messages);
    form.classList.add("is-loading");
    rayAiSetStatus(panel, "Thinking...");

    try {
      const answer = await rayAiGenerate(question, history);
      loader.remove();

      const answerMessage = rayAiAddMessage(messages, "assistant", rayAiFormatResponse(answer));

      const copyAnswer = document.createElement("button");
      copyAnswer.type = "button";
      copyAnswer.className = "ray-ai-message-action";
      copyAnswer.textContent = "Copy";

      copyAnswer.addEventListener("click", async () => {
        const copied = await rayAiCopyText(answer).catch(() => false);
        copyAnswer.textContent = copied ? "Copied" : "Copy";
        rayAiSetStatus(panel, copied ? "Answer copied." : "Copy is not available in this browser.");
      });

      answerMessage.appendChild(copyAnswer);

      history.push(
        { role: "user", parts: [{ text: question }] },
        { role: "model", parts: [{ text: answer }] }
      );

      rayAiSetStatus(panel, "Ready.");
    } catch (error) {
      loader.remove();

      const fallback = rayAiLocalFallback(question);
      console.warn("Ray AI connection failed:", error);

      rayAiAddMessage(messages, "assistant", rayAiFormatResponse(fallback));

      history.push(
        { role: "user", parts: [{ text: question }] },
        { role: "model", parts: [{ text: fallback }] }
      );

      rayAiSetStatus(panel, "Answered from portfolio knowledge.");
    } finally {
      form.classList.remove("is-loading");
      updatePremiumControls();
      rayAiScrollToLatest(messages);
    }
  });
}

function rayAiCreateDock() {
  const dock = document.createElement("div");
  dock.className = "ray-ai-dock";
  dock.innerHTML = `
    <div class="ray-ai-panel">
      <div class="ray-ai-panel-header">
        <div>
          <p>Ray AI</p>
          <span>Ask me anything about my projects, skills, certifications, experience, or career journey.</span>
        </div>
        <button class="ray-ai-close" type="button" aria-label="Close Ray AI"><i class="bx bx-x"></i></button>
      </div>
      <div class="ray-ai-greeting">
        <p><span>Hello, Guest</span></p>
        <p>How can I help you today?</p>
        <small data-ray-ai-helper>Ask me about my SQL projects</small>
      </div>
      <div class="ray-ai-actions" data-ray-ai-actions>
        <button type="button" data-ray-ai-clear disabled><i class="bx bx-trash"></i><span>Clear</span></button>
        <button type="button" data-ray-ai-copy disabled><i class="bx bx-copy"></i><span>Copy</span></button>
        <button type="button" data-ray-ai-share disabled><i class="bx bx-share-alt"></i><span>Share</span></button>
      </div>
      <div class="ray-ai-messages" data-ray-ai-messages aria-live="polite"></div>
      <div class="ray-ai-prompts" data-ray-ai-prompts></div>
      <form class="ray-ai-form" data-ray-ai-form>
        <label class="sr-only" for="ray-ai-dock-input">Ask Ray AI</label>
        <input id="ray-ai-dock-input" data-ray-ai-input type="text" placeholder="Enter a prompt here" autocomplete="off" />
        <span class="ray-ai-count" data-ray-ai-count>0/500</span>
        <button class="ray-ai-voice" type="button" data-ray-ai-voice aria-label="Voice prompt"><i class="bx bx-microphone"></i></button>
        <button type="submit" aria-label="Ask Ray AI"><i class="bx bx-send"></i></button>
      </form>
      <p class="ray-ai-status" data-ray-ai-status aria-live="polite">Tap the prompt field to type.</p>
    </div>
  `;

  const launcher = document.createElement("button");
  launcher.className = "ray-ai-launcher";
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML = '<i class="bx bx-message-rounded-dots" aria-hidden="true"></i><span>Ray AI</span>';

  const close = dock.querySelector(".ray-ai-close");

  launcher.addEventListener("click", () => {
    const open = dock.classList.toggle("open");
    launcher.setAttribute("aria-expanded", String(open));
    if (open) rayAiSetStatus(dock, "Tap the prompt field to type.");
  });

  close.addEventListener("click", () => {
    dock.classList.remove("open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  });

  document.body.append(dock, launcher);
  rayAiAttachPanel(dock);
}

document.querySelectorAll("[data-ray-ai-inline]").forEach(rayAiAttachPanel);
rayAiCreateDock();
