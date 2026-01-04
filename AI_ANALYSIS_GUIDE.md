# ChronoFlow AI Productivity Coach Guide

This document describes how the AI analysis feature works in ChronoFlow, including data structures, security, and API configuration.

## 1. How it Works

The AI Productivity Coach uses the **Google Gemini API (gemini-3-flash-preview)** to process your task history and generate actionable advice.

1. **Data Collection**: The app filters your task list for "active" tasks (those with recorded time or marked as completed).
2. **Data Sanitization**: To protect privacy, only the task title, tags, and cumulative duration are extracted. Individual time logs (timestamps) are NOT sent.
3. **Prompt Engineering**: The data is wrapped in a system prompt that instructs Gemini to act as a "Productivity Coach" and return a structured JSON response.
4. **Analysis**: Gemini looks for patterns like:
   - Context switching (many different tags).
   - Time sinks (tasks with long durations but simple titles).
   - Focus areas.
5. **Reporting**: The app renders the JSON response into a visual report with a score, a summary, and bulleted suggestions.

## 2. Input Data Structure

The AI receives a JSON array formatted as follows:

```json
[
  {
    "title": "Project Meeting",
    "tags": "Work, Team",
    "durationMinutes": 60,
    "status": "COMPLETED"
  },
  {
    "title": "Learning React",
    "tags": "Study, Code",
    "durationMinutes": 120,
    "status": "RUNNING"
  }
]
```

## 3. Output Schema

The AI is forced to return a valid JSON object with the following fields:

- `summary`: A concise overview of your current productivity state.
- `suggestions`: An array of strings containing specific, actionable advice.
- `productivityScore`: A numeric value between 0 and 100.

## 4. API Key Configuration

### Security Architecture
ChronoFlow adheres to strict security guidelines. **There is no input field for API Keys in the UI.** This is by design to prevent keys from being leaked or accidentally shared.

### How to provide the key:
The application expects the API key to be available in the environment via `process.env.API_KEY`.

- **On Hosted Platforms**: Configure the `API_KEY` secret in your environment settings.
- **Local Development**: If using a build tool like Vite, you would typically use a `.env` file (e.g., `VITE_API_KEY=your_key`).
- **Production Injection**: The key is injected automatically by the runtime provider.

## 5. Model Selection
ChronoFlow uses `gemini-3-flash-preview` for this feature. It provides a great balance between:
- **Speed**: Analysis is typically completed in 2-4 seconds.
- **Context Window**: It can handle hundreds of task entries without truncating data.
- **Reasoning**: It's specifically optimized for JSON extraction and structured reasoning tasks.