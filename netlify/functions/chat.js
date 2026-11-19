export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const apiKey = Netlify.env.get("OPENROUTER_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY is missing" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const body = await request.json();

    if (!body.model || !Array.isArray(body.messages)) {
      return new Response(
        JSON.stringify({ error: "Model or messages are missing" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://openrouter-chat-ecd8.netlify.app",
          "X-Title": "OpenRouter Chat"
        },
        body: JSON.stringify({
          model: body.model,
          messages: body.messages,
          stream: true
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();

      return new Response(error, {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
