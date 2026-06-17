const { Ollama } = require('ollama');

// Initialize Ollama instance pointing to the configured Linux/local host
const ollamaHost = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const ollama = new Ollama({ host: ollamaHost });

/**
 * Sends a list of messages (chat history) to Ollama.
 * Supports streaming if requested.
 */
exports.chat = async (req, res, next) => {
  const { model, messages, stream, options } = req.body;

  if (!model || !messages || !Array.isArray(messages)) {
    return res.status(400).json({
      success: false,
      error: "Missing required parameters: 'model' (string) and 'messages' (array of objects)."
    });
  }

  try {
    if (stream === true) {
      // Set headers for streaming NDJSON chunks
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ollama.chat({
        model,
        messages,
        stream: true,
        options
      });

      for await (const chunk of responseStream) {
        res.write(JSON.stringify(chunk) + '\n');
      }
      res.end();
    } else {
      // Non-streaming full response
      const response = await ollama.chat({
        model,
        messages,
        stream: false,
        options
      });
      res.json({ success: true, data: response });
    }
  } catch (error) {
    console.error('[Ollama Chat Controller Error]:', error.message);
    next(error);
  }
};

/**
 * Generates a response for a single prompt.
 * Supports streaming if requested.
 */
exports.generate = async (req, res, next) => {
  const { model, prompt, system, stream, options } = req.body;

  if (!model || !prompt) {
    return res.status(400).json({
      success: false,
      error: "Missing required parameters: 'model' (string) and 'prompt' (string)."
    });
  }

  try {
    if (stream === true) {
      // Set headers for streaming NDJSON chunks
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ollama.generate({
        model,
        prompt,
        system,
        stream: true,
        options
      });

      for await (const chunk of responseStream) {
        res.write(JSON.stringify(chunk) + '\n');
      }
      res.end();
    } else {
      // Non-streaming full response
      const response = await ollama.generate({
        model,
        prompt,
        system,
        stream: false,
        options
      });
      res.json({ success: true, data: response });
    }
  } catch (error) {
    console.error('[Ollama Generate Controller Error]:', error.message);
    next(error);
  }
};

/**
 * Returns a list of models that have been downloaded locally.
 */
exports.listModels = async (req, res, next) => {
  try {
    const response = await ollama.list();
    res.json({ success: true, models: response.models || [] });
  } catch (error) {
    console.error('[Ollama List Models Controller Error]:', error.message);
    next(error);
  }
};
