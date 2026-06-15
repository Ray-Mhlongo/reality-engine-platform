import { Bot, Send, UserRound } from "lucide-react";
import { useState } from "react";
import { answerQuestion } from "../lib/analysis";

const prompts = [
  "Why are sales dropping?",
  "Which products perform best?",
  "What factors influence revenue?",
  "What anomalies exist in this dataset?"
];

export function Assistant({ dataset, analysis }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Upload data or use the sample dataset, then ask a business question. Every answer is grounded in the current dataset profile."
    }
  ]);

  function submit(nextQuestion = question) {
    if (!nextQuestion.trim()) return;
    const response = answerQuestion(nextQuestion, dataset, analysis);
    setMessages((current) => [
      ...current,
      { role: "user", content: nextQuestion },
      { role: "assistant", content: response }
    ]);
    setQuestion("");
  }

  return (
    <section className="panel rounded-lg p-4 sm:p-6" id="assistant">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-signal">Natural language assistant</p>
          <h2 className="mt-1 text-2xl font-black text-white">Ask the data</h2>
        </div>
        <Bot className="text-signal" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.72fr_0.28fr]">
        <div className="grid min-h-[420px] grid-rows-[1fr_auto] rounded-lg border border-white/10 bg-ink/50">
          <div className="grid content-start gap-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" ? (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-signal/15 text-signal">
                    <Bot size={18} />
                  </span>
                ) : null}
                <p className={`max-w-[760px] rounded-lg px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-amber text-ink" : "bg-white/[0.07] text-white/72"}`}>
                  {message.content}
                </p>
                {message.role === "user" ? (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-amber/15 text-amber">
                    <UserRound size={18} />
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <input
              className="control min-w-0 flex-1"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about risks, performance, drivers, anomalies, or recommendations"
            />
            <button className="primary-button px-3" type="submit" aria-label="Send question">
              <Send size={18} />
            </button>
          </form>
        </div>

        <div className="grid content-start gap-3">
          {prompts.map((prompt) => (
            <button key={prompt} className="secondary-button justify-start text-left" type="button" onClick={() => submit(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
