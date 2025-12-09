export interface AiCompletionOptions {
  prompt: string;
  context?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  onUpdate?: (text: string) => void;
  signal?: AbortSignal;
}

export const generateAiContent = async ({
  prompt,
  context,
  apiKey,
  baseUrl = "https://api.deepseek.com",
  model = "deepseek-chat",
  onUpdate,
  signal,
}: AiCompletionOptions): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is required");
  }

  const systemPrompt =
    "You are a helpful AI assistant embedded in a text editor. Your task is to help the user write, edit, or improve their text. Output only the requested content in Markdown format without conversational filler, unless specifically asked.";

  const messages = [
    { role: "system", content: systemPrompt },
    ...(context ? [{ role: "user", content: `Context:\n${context}` }] : []),
    { role: "user", content: prompt },
  ];

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices[0]?.delta?.content || "";
            if (content) {
              fullContent += content;
              if (onUpdate) {
                onUpdate(fullContent);
              }
            }
          } catch (e) {
            console.warn("Failed to parse chunk", e);
          }
        }
      }
    }

    return fullContent;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request aborted");
    }
    console.error("AI Generation Error:", error);
    throw error;
  }
};
