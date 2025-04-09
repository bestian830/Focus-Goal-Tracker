import Goal from '../models/Goal.js';
import axios from 'axios'; // For calling external AI API

// --- Configuration (Replace with your actual details) ---
// You might need to get an API key from Hugging Face or another provider
const HUGGINGFACE_API_URL = process.env.HUGGINGFACE_API_URL; // Read URL from environment variables
const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN; // Store your token securely in environment variables

if (!HUGGINGFACE_API_TOKEN) {
  console.warn("HUGGINGFACE_API_TOKEN is not set. AI report generation will likely fail.");
}
if (!HUGGINGFACE_API_URL) {
  console.warn("HUGGINGFACE_API_URL is not set in .env file. AI report generation will likely fail.");
}
// --- End Configuration ---

/**
 * Builds a prompt for the AI based on goal data.
 * This is a crucial part - tailor the prompt for best results.
 * @param {Object} goal - The goal object from the database.
 * @returns {string} The constructed prompt string.
 */
const buildPrompt = (goal) => {
  let prompt = `Analyze the progress for the goal titled "${goal.title}".\n\n`;
  prompt += `Goal Description: ${goal.description || 'Not provided'}\n`;
  prompt += `Motivation: ${goal.motivation || 'Not provided'}\n`;
  prompt += `Target Date: ${goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'Not set'}\n\n`;
  prompt += `Daily Tasks Defined:\n${goal.dailyTasks && goal.dailyTasks.length > 0 ? goal.dailyTasks.map(task => `- ${task}`).join('\n') : '- None'}\n\n`;
  prompt += `Progress Log (Recent Daily Cards):\n`;

  // Include data from recent daily cards (e.g., last 7 days)
  const recentCards = goal.dailyCards
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
    .slice(0, 7); // Limit to last 7 cards

  if (recentCards.length > 0) {
    recentCards.forEach(card => {
      const cardDate = new Date(card.date).toLocaleDateString();
      prompt += `--- ${cardDate} ---\n`;
      const completions = card.taskCompletions || {};
      const completedTasks = Object.entries(completions)
                                   .filter(([_, completed]) => completed)
                                   .map(([taskId]) => {
                                        // Extract task text from taskId (adjust if ID format changes)
                                        const taskText = taskId.startsWith('task-')
                                            ? taskId.substring(5).replace(/-/g, ' ')
                                            : goal.dailyTasks?.find(t => `task-${t.replace(/\s+/g, '-').toLowerCase()}` === taskId) || taskId;
                                        return `  - Completed: ${taskText}`;
                                    })
                                    .join('\n');
      const incompleteTasks = Object.entries(completions)
                                    .filter(([_, completed]) => !completed)
                                    .map(([taskId]) => {
                                        const taskText = taskId.startsWith('task-')
                                            ? taskId.substring(5).replace(/-/g, ' ')
                                            : goal.dailyTasks?.find(t => `task-${t.replace(/\s+/g, '-').toLowerCase()}` === taskId) || taskId;
                                        return `  - Incomplete: ${taskText}`;
                                    })
                                    .join('\n');

      if (completedTasks) prompt += `${completedTasks}\n`;
      if (incompleteTasks) prompt += `${incompleteTasks}\n`;

      if (card.records && card.records.length > 0) {
        prompt += `  Notes:\n`;
        card.records.forEach(record => {
          prompt += `    - ${record.content} (at ${new Date(record.createdAt).toLocaleTimeString()})\n`;
        });
      } else {
        prompt += `  No notes recorded.\n`;
      }
    });
  } else {
    prompt += `- No daily progress recorded yet.\n`;
  }

  prompt += `\nBased on the goal and the recent progress log, provide a concise analysis (2-3 sentences) focusing on consistency, potential challenges, and actionable suggestions for improvement. Be encouraging but realistic.`;

  console.log("--- Generated AI Prompt ---");
  console.log(prompt);
  console.log("--- End AI Prompt ---");

  return prompt;
};

/**
 * Calls the external AI service.
 * @param {string} prompt - The prompt to send to the AI.
 * @returns {Promise<string>} A promise that resolves with the AI-generated feedback content.
 */
const callAIService = async (prompt) => {
  if (!HUGGINGFACE_API_TOKEN) {
    throw new Error("AI service token is not configured.");
  }
  if (!HUGGINGFACE_API_URL) {
      throw new Error("AI service URL is not configured.");
  }

  try {
    console.log(`Calling AI service at: ${HUGGINGFACE_API_URL}`);
    // --- Adjust this part based on the specific AI model/API requirements ---
    // This example assumes a text-generation or summarization model.
    // You might need to change the payload structure (`inputs` vs. other fields)
    // and how you extract the result (`response.data[0].generated_text` or similar).
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      {
        inputs: prompt,
        // Add any model-specific parameters here, e.g., max_length, temperature
        parameters: {
          max_new_tokens: 150, // Limit the length of the generated response
          // temperature: 0.7, // Adjust creativity vs. factuality
          // Add other parameters as needed by the model
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      }
    );
    // --- End Adjustment Section ---

    console.log('AI service response status:', response.status);
    // console.log('AI service raw response data:', response.data); // Log raw data for debugging

    // --- Extract the actual feedback from the response ---
    // This structure depends heavily on the specific Hugging Face model/API used.
    // Inspect `response.data` carefully to find the generated text.
    // Common structures: response.data[0].generated_text, response.data.summary_text, etc.
    let feedbackContent = "Error: Could not extract feedback from AI response.";
    if (Array.isArray(response.data) && response.data[0] && response.data[0].generated_text) {
        // Often, the result is an array with one object containing generated_text
        // Sometimes the input prompt is included, remove it if necessary.
        feedbackContent = response.data[0].generated_text.replace(prompt, '').trim();
    } else if (response.data && typeof response.data === 'object') {
        // Look for other potential keys if the primary one isn't found
        const possibleKeys = ['generated_text', 'summary_text', 'text'];
        for (const key of possibleKeys) {
            if (response.data[key]) {
                feedbackContent = response.data[key].replace(prompt, '').trim();
                break;
            }
        }
        // Handle nested structures if necessary
        if (feedbackContent.startsWith("Error:") && response.data.outputs && response.data.outputs.generated_text) {
             feedbackContent = response.data.outputs.generated_text.replace(prompt, '').trim();
        }
    } else if (typeof response.data === 'string') {
        // Less common, but sometimes the response is just the string
         feedbackContent = response.data.replace(prompt, '').trim();
    }


    if (!feedbackContent || feedbackContent.startsWith("Error:")) {
         console.error("Failed to extract valid feedback from AI response. Raw data:", response.data);
         throw new Error("Failed to extract valid feedback from AI response.");
    }

     // Simple post-processing: remove potential artifacts or ensure readability
    feedbackContent = feedbackContent.replace(/<pad>/g, '').replace(/<\/s>/g, '').trim();


    console.log('Extracted AI feedback:', feedbackContent);
    return feedbackContent;

  } catch (error) {
    console.error(`Error calling AI service: ${error.message}`);
    if (error.response) {
      console.error('AI Service Error Response Status:', error.response.status);
      console.error('AI Service Error Response Data:', error.response.data);
    } else if (error.request) {
      console.error('AI Service No Response Received:', error.request);
    } else {
      console.error('AI Service Request Setup Error:', error.message);
    }
     // Provide a more user-friendly error based on status if possible
    if (error.response?.status === 401) {
        throw new Error("AI service authentication failed. Check API token.");
    } else if (error.response?.status === 429) {
         throw new Error("AI service rate limit exceeded. Please try again later.");
    } else if (error.code === 'ECONNABORTED') {
         throw new Error("AI service request timed out. Please try again later.");
    }
    // Include more details in the generic error message
    throw new Error(`Failed to get feedback from AI service. Status: ${error.response?.status || 'N/A'}, Data: ${JSON.stringify(error.response?.data) || error.message}`);
  }
};


/**
 * @controller generateReport
 * @desc Fetches goal data, builds a prompt, calls AI service, and returns feedback.
 * @param {Object} req - Express request object, includes goalId in params.
 * @param {Object} res - Express response object.
 */
export const generateReport = async (req, res) => {
  const { goalId } = req.params;

  try {
    console.log(`Generating report for goalId: ${goalId}`);
    // 1. Fetch Goal Data
    const goal = await Goal.findById(goalId).lean(); // Use .lean() for plain JS object

    if (!goal) {
      console.log(`Goal not found for ID: ${goalId}`);
      return res.status(404).json({ success: false, error: { message: 'Goal not found' } });
    }

    console.log(`Goal found: "${goal.title}"`);

    // 2. Build Prompt
    const prompt = buildPrompt(goal);

    // 3. Call AI Service
    const feedbackContent = await callAIService(prompt);

    // 4. (Optional) Save Report to DB - Requires a Report Model
    // const newReport = new Report({ goalId, userId: req.user.id, content: feedbackContent });
    // await newReport.save();
    // console.log('AI report saved to database.');

    // 5. Return Feedback to Frontend
    console.log(`Successfully generated feedback for goal: ${goalId}`);
    res.status(200).json({
      success: true,
      data: {
        goalId: goalId,
        content: feedbackContent,
        generatedAt: new Date(),
        // reportId: newReport._id // Include if saving report
      },
    });

  } catch (error) {
    console.error(`Error in generateReport for goal ${goalId}:`, error);
    res.status(500).json({
      success: false,
      error: {
        message: `Failed to generate AI report: ${error.message}`,
        details: error.stack // Include stack trace for debugging
      }
    });
  }
};
