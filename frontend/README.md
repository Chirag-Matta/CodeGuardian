# PR Review Agent - Frontend

Modern web interface for AI-powered code review built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- ✨ **Beautiful UI** - Modern, responsive design with dark mode support
- 🤖 **AI-Powered** - Gemini-powered code analysis
- 🔍 **Smart Filtering** - Filter by severity, file, and search
- 📊 **Visual Summaries** - Issue counts with severity-based badges
- 🎯 **Easy Input** - Paste GitHub PR URL or enter details manually
- 💡 **Actionable Suggestions** - Get fix recommendations for each issue

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configuration

Edit `.env.local` to configure the backend API URL:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── review/          # Review pages
│   │   └── layout.tsx       # Root layout
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components
│   │   ├── layout/          # Layout components
│   │   ├── review/          # Review input components
│   │   └── results/         # Results display components
│   └── lib/                  # Utilities and API client
│       ├── api.ts           # API client
│       ├── types.ts         # TypeScript types
│       └── utils.ts         # Utility functions
```

## Usage

### 1. Review a GitHub PR

1. Navigate to the Review page
2. Paste your GitHub PR URL:
   ```
   https://github.com/owner/repo/pull/123
   ```
3. Select which agents to run (Security, Performance, Logic, etc.)
4. Click "Review Pull Request"

### 2. View Results

- **Summary Card**: See total issues broken down by severity
- **Filters**: Filter by severity, file, or search for specific issues
- **Issue Cards**: Expand to see suggestions and code context
- **File Grouping**: Issues are grouped by file for easy navigation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **Code Highlighting**: react-syntax-highlighter
- **Icons**: Lucide React
- **HTTP Client**: Native fetch API

## Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

## Features Roadmap

### Phase 1: MVP ✅
- [x] Landing page with hero section
- [x] GitHub PR review form
- [x] Results display with filtering
- [x] Summary cards
- [x] Issue cards with suggestions
- [x] Dark mode support

### Phase 2: Enhanced UX (Future)
- [ ] Diff input tab
- [ ] File upload support
- [ ] Syntax-highlighted code viewer
- [ ] Review history page
- [ ] Export results (JSON, Markdown, PDF)

### Phase 3: Advanced Features (Future)
- [ ] Side-by-side diff viewer
- [ ] Settings page
- [ ] Keyboard shortcuts
- [ ] GitHub OAuth integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Gemini AI**
