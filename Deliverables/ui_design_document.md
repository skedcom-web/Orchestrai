# UI Design & Technology Stack Document
**Project Name**: OrchestrAI Certification Academy  
**Version**: 1.0.0  
**Target Directory**: [Deliverables (file:///C:/Users/VT348/Documents/GitHub/Orchestrai/Deliverables/)](file:///C:/Users/VT348/Documents/GitHub/Orchestrai/Deliverables/)

---

## 1. Design Aesthetics & Visual Identity

The **OrchestrAI Academy** user interface follows a modern, developer-centric aesthetic, employing glassmorphism, gradient accents, and dark mode features to establish a premium and professional user experience.

### A. Color Palette & Gradients
The visual theme relies on tailored HSL colors combined with gradients to draw focus to critical actions and progress markers:
*   **Background Colors**:
    *   *Header/Card Background*: `var(--header-bg)` / `var(--bg-card)` (translucent surfaces with high blur saturation).
    *   *Sunken Surfaces*: `var(--surface-sunken)` (dark slate variations for code panels and mock terminals).
*   **Brand Gradients**:
    *   *Primary Actions*: `from-indigo-500 to-purple-600` (deep blue to violet gradient for verification buttons and headers).
    *   *Success States*: `from-emerald-500 to-teal-700` (rich green gradient for payment approval and passing screens).
    *   *Syllabus Highlights*: `from-indigo-400 via-purple-500 to-cyan-400` bg-clip text.

### B. Typography Hierarchy
Modern web typography is integrated throughout the application, utilizing clean sans-serif layouts to ensure high readability:
*   *Headers & Titles*: Heavy bold weights (`font-extrabold tracking-tight`), scaling from `text-3xl` down to `text-xl`.
*   *Body Copy*: Crisp text sizes (`text-sm leading-relaxed`) optimized for learning slide descriptions.
*   *Code Blocks / Metadata*: Monospace alignments for credentials, passwords, and terminal-simulated displays.

### C. Glassmorphism & Micro-Animations
*   **Surfaces**: Cards utilize class `.glass-card` (soft border shadows, `backdrop-blur-[20px]`, and light border strokes) to separate content cleanly from background glow blobs.
*   **Hover States**: Buttons and syllabus links feature scale transitions (`transition-all duration-300 hover:scale-[1.02] hover:brightness-110`).
*   **Icons**: Interactive Lucide icon modules feature micro-animations (e.g. bouncing CheckCircle indicators, spinning RefreshCw loaders).

---

## 2. Key Pages Visual Layout & Component Schematics

### A. Landing Page
*   **Hero Module**: Dynamic intro copy and action buttons pointing to syllabus modules, surrounded by premium background glows.
*   **Stats Section**: Multi-column row displaying key stats (8+ Training Modules, 7-Day POC benchmarks, 90% Hiring scores).
*   **Proof Card**: Highlighted bottom card showing how the portal itself is proof of the OrchestrAI framework.

### B. Interactive Slide Presenter
*   **Header Section**: Interactive breadcrumbs showing the current module, slide index tracker (e.g. `23/23`), and an audio control button to toggle narration.
*   **Main Workspace**: A central split-pane layout displaying the slide topic illustration on the left and the descriptive text cards on the right.
*   **Footer Controls**: Locked previous/next actions with a primary completion trigger leading to feedback modal popups.

### C. Resource Vault
*   **Search and Filter Grid**: Search input field and category selectors allowing candidates to query reference files.
*   **Document Cards**: Cards displaying the asset title, file size, description, and action buttons. 
*   **Security Gate Overlay**: Access checks prompt guests to authenticate or register.

---

## 3. Technology Stack & Integration Libraries

The application's technology stack is designed to ensure fast load times, modularity, and offline capability.

### A. Core Development Framework
*   **Vite 8**: Build tool for hot module replacement (HMR), static optimization, and bundle chunking.
*   **React 19**: Frontend UI library utilizing hooks (`useState`, `useEffect`, `useCallback`, `useMemo`) to manage client state.
*   **TypeScript (Strict)**: Strong typing across user profiles, configs, and slide data structures.
*   **Tailwind CSS**: Utility-first CSS utility for building layouts directly in component files.

### B. Integrations & File Generation Engines
*   **Firebase SDK (RTDB)**: Realtime synchronization, authentication gates, and schema management.
*   **EmailJS Client**: Dispatches email alerts and OTP verification logs.
*   **jsPDF & jsPDF-Autotable**: Generates and formats certificates on the client side.
*   **SheetJS (XLSX)**: Compiles multi-sheet feedback spreadsheets and analytics data.
*   **Lucide React**: High-fidelity SVG vector icons library.
