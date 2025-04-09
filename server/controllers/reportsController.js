import Goal from '../models/Goal.js';
import axios from 'axios'; // Keep axios
// import OpenAI from 'openai'; // Remove OpenAI library import

// --- Configuration ---
const HUGGINGFACE_API_URL = process.env.HUGGINGFACE_API_URL; // Read standard API URL
const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
// const HF_MODEL_NAME = process.env.HF_MODEL_NAME; // No longer strictly needed for axios call if URL includes it
// const HUGGINGFACE_API_BASE_URL = process.env.HUGGINGFACE_API_BASE_URL; // Remove Base URL usage


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

  // Updated instruction to explicitly ask for future suggestions
  prompt += `\nBased on the goal and the recent progress log:
1. Provide a concise analysis (1-2 sentences) of recent progress, focusing on consistency and patterns.
2. Identify potential challenges or areas needing attention (1 sentence).
3. Offer specific, actionable suggestions for the **next steps** or **future planning** to help achieve the goal (2-3 sentences).
Be encouraging, realistic, and forward-looking.`;

  console.log("--- Generated AI Prompt ---");
  console.log(prompt);
  console.log("--- End AI Prompt ---");

  return prompt;
};

/**
 * Calls the external AI service using Axios.
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
    console.log(`DEBUG: Attempting to call AI service. URL: ${HUGGINGFACE_API_URL}`); // Log the URL being used
    console.log(`Calling AI service (axios) at: ${HUGGINGFACE_API_URL}`);
    // Use axios to call the standard Hugging Face Inference API
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 250, // Adjust as needed
          return_full_text: false, // Often useful to get only the generated part
          // temperature: 0.7, // Optional: Adjust creativity
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 45000 // Increased timeout slightly (45 seconds)
      }
    );

    console.log('AI service response status:', response.status);
    console.log('AI service raw response data:', JSON.stringify(response.data, null, 2));

    // Extract feedback - structure might differ slightly, check raw response
    let feedbackContent = "Error: Could not extract feedback from AI response.";
    if (Array.isArray(response.data) && response.data[0] && response.data[0].generated_text) {
      feedbackContent = response.data[0].generated_text.trim();
    } else if (response.data && response.data.generated_text) { // Some models might return object directly
       feedbackContent = response.data.generated_text.trim();
    } else {
        console.error("Unexpected AI response format. Raw data:", response.data);
    }

    if (feedbackContent.startsWith("Error:")) {
         throw new Error("Failed to extract valid feedback from AI response.");
    }

    // Simple post-processing
    feedbackContent = feedbackContent.replace(/<pad>/g, '').replace(/<\/s>/g, '').trim();

    console.log('Extracted AI feedback:', feedbackContent);
    return feedbackContent;

  } catch (error) {
    console.error(`Error calling AI service (axios): ${error.message}`);
    if (error.response) {
      console.error('AI Service Error Response Status:', error.response.status);
      console.error('AI Service Error Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('AI Service No Response Received');
    } else {
      console.error('AI Service Request Setup Error:', error.message);
    }

    if (error.response?.status === 401) {
      throw new Error("AI service authentication failed. Check API token.");
    } else if (error.response?.status === 429) {
      throw new Error("AI service rate limit exceeded. Please try again later.");
    } else if (error.response?.status === 503) {
        throw new Error("AI service is unavailable or model is loading. Please try again later."); // More specific 503 message
    } else if (error.code === 'ECONNABORTED') {
      throw new Error("AI service request timed out. Please try again later.");
    }
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
        // Avoid sending full stack trace to client in production
        details: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error' 
      }
    });
  }
};
