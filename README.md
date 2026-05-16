# GitHub Projects v2 Dashboard

A professional, high-performance dashboard for visualizing GitHub Projects v2 metrics. Built with Nuxt 4, Tailwind CSS, and Chart.js.

## Features

- **Multi-Step Selection Flow**: Easily browse through Organizations/Users and their Projects.
- **Real-time Metrics**: Aggregate counts for Total Items, Open/Closed states, and Merged Pull Requests.
- **Dynamic Charts**:
  - **Velocity**: Items created vs. updated over time.
  - **Status Distribution**: Pie chart showing items by their current status.
  - **Label Distribution**: Pie chart showing items by their labels.
- **TV / Focus Mode**: A distraction-free mode for displaying on big screens.
- **Expanded Card View**: Click any card or chart to view it in full screen.
- **Advanced Filtering**: Filter items by labels, states (Issue/PR/Draft), and project status.
- **Modern UI**: Dark-themed, glassmorphic design inspired by Linear and Vercel.

## Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/) (Compatibility mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Iconify](https://iconify.design/)
- **Charts**: [Chart.js](https://www.chartjs.org/) via [vue-chartjs](https://vue-chartjs.org/)
- **State/Hooks**: [@vueuse/nuxt](https://vueuse.org/)

## Setup

### Prerequisites

- Node.js (v18+)
- GitHub Personal Access Token (PAT) with `project` scopes.

### Environment Variables

Create a `.env` file in the root directory:

```env
GITHUB_TOKEN=your_github_pat
# Optional defaults
GITHUB_ORG=your_org_or_user
GITHUB_PROJECT=project_number
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Select Owner**: Type or select a GitHub organization or user.
2. **Select Project**: Choose from the list of available Projects v2.
3. **Explore**: Interact with cards, expand charts, or use the Filters modal to drill down into data.
4. **TV Mode**: Use the "TV Mode" button for a clean, full-screen presentation.

## Architecture

- **Backend**: Nitro server routes (`/api`) fetch data from GitHub's GraphQL API.
- **Caching**: Server-side caching is implemented to avoid GitHub API rate limits.
- **Mapper**: Specialized utility to transform complex GraphQL responses into clean dashboard-ready objects.
- **Components**: Atomic design with reusable `StatCard`, `TypeaheadSelect`, and Chart components.

## License

MIT
