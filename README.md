# ChronoFlow - AI Task Timer

ChronoFlow is a React-based task management and timing application. It features a task timer, milestone tracking, a fullscreen focus mode, data visualization, and AI-powered productivity insights using the Google Gemini API.

## 🚀 How to Start / Deploy

This project is designed as a **No-Build** React application using ES Modules and `importmap`. This means it runs directly in the browser without needing a complex build step (like Webpack or Vite) for basic usage, though a local server is required to handle module loading.

### Prerequisites

1.  **Google Gemini API Key**: You need a valid API key from [Google AI Studio](https://aistudio.google.com/).
2.  **Local Web Server**: Browsers block ES module imports from local file paths (`file://`). You need a simple HTTP server.

### Option 1: Using VS Code (Recommended)

1.  Open the project folder in **VS Code**.
2.  Install the **"Live Server"** extension (by Ritwick Dey).
3.  Open `index.html`.
4.  Right-click and select **"Open with Live Server"**.
5.  **Important**: Open `services/geminiService.ts`. Since this is a no-build setup, `process.env` does not exist in the browser. You must manually replace:
    ```typescript
    // OLD
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // NEW (Replace with your actual key string)
    const ai = new GoogleGenAI({ apiKey: "YOUR_ACTUAL_GOOGLE_API_KEY" });
    ```

### Option 2: Using Python

1.  Open your terminal/command prompt in the project directory.
2.  Run:
    ```bash
    # Python 3
    python -m http.server 8000
    ```
3.  Open `http://localhost:8000` in your browser.
4.  (Remember to replace the API Key in `services/geminiService.ts` as mentioned above).

### Option 3: Using Node.js `http-server`

1.  Run:
    ```bash
    npx http-server .
    ```
2.  Open the URL shown in the terminal.

---

## 📂 File Structure & Descriptions

Here is a breakdown of the project files and their specific responsibilities:

### Core Entry Points

*   **`index.html`**
    *   The main entry point of the application.
    *   Contains the `<importmap>` which tells the browser where to download dependencies (React, Lucide, Google GenAI, etc.) from `esm.sh` (a CDN for ES modules).
    *   Includes the Tailwind CSS CDN for styling.
    *   Mounts the React app into the `<div id="root">`.

*   **`index.tsx`**
    *   The TypeScript entry point.
    *   Finds the root DOM element and renders the main `<App />` component wrapped in `React.StrictMode`.

*   **`App.tsx`**
    *   The main application logic container.
    *   **State Management**: Holds the state for tasks, the active timer, the current navigation tab, focus mode status, and background image preferences.
    *   **Persistence**: Handles loading and saving data to `localStorage`.
    *   **Routing**: Renders the sidebar and switches views between the Timer/List, Dashboard (Stats), AI Insights, and Fullscreen Focus mode.

### Data & Configuration

*   **`types.ts`**
    *   Defines the TypeScript interfaces and Enums used throughout the app.
    *   Key types: `Task`, `TaskStatus`, `TimeLog`, `Milestone`, `AIAnalysisResult`.

*   **`constants.ts`**
    *   Stores static configuration data.
    *   Includes the App Name, Navigation Items configuration, and default Task Categories.

*   **`metadata.json`**
    *   Contains project metadata like name and description, and permissions request (e.g., for camera/mic if features are added later).

### Services (Logic Layer)

*   **`services/geminiService.ts`**
    *   Handles interaction with the **Google Gemini API**.
    *   Contains the logic to format task data into a text prompt.
    *   Sends the prompt to Gemini to generate productivity summaries, suggestions, and scores in JSON format.
    *   **Note**: Requires an API Key.

*   **`services/storageService.ts`**
    *   A utility wrapper around the browser's `localStorage`.
    *   Handles safely saving and loading the task list JSON data to ensure data persists after a page refresh.

### Components (UI Layer)

*   **`components/TaskTimer.tsx`**
    *   The active task controller.
    *   Displays the elapsed time for the *currently running* task.
    *   Provides controls to Pause, Resume, Complete, Add Milestones, and enter **Focus Mode**.

*   **`components/TaskList.tsx`**
    *   Displays the list of all tasks.
    *   Allows filtering (All/Active/Done).
    *   Handles creating new tasks.
    *   **Timeline View**: Each task can be expanded to show a vertical timeline of milestones (creation, updates, custom markers). Allows adding and editing milestone branches.

*   **`components/FullscreenFocus.tsx`**
    *   An immersive, full-screen view for the active task.
    *   Shows a large timer and task title.
    *   Allows uploading a custom background image (stored locally).
    *   Provides large Play/Pause/Exit controls.

*   **`components/Stats.tsx`**
    *   The Analytics dashboard.
    *   Uses `recharts` to render visual graphs (Bar Chart and Pie Chart).
    *   Calculates statistics like Total Time, Average Task Time, and Time Distribution by Category.

*   **`components/AIInsights.tsx`**
    *   The UI interface for the AI Coach.
    *   Displays the "Analyze" button.
    *   Renders the structured feedback (Score, Summary, Bullet points) received from the Gemini API.

*   **`components/Button.tsx`**
    *   A reusable generic Button component.
    *   Handles visual variants (Primary, Secondary, Ghost, Danger) and loading states.
