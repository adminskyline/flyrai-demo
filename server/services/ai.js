export async function callAI(apiKey, provider, systemPrompt, userPrompt, maxTokens = 1000) {
  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.choices?.[0]?.message?.content || "";
  }

  // Default: Anthropic
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "";
}
