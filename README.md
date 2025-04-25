# Noise Sense - Pune Pulse

A crowdsourced noise pollution monitoring application for Pune city.

## Overview

Noise Sense enables citizens of Pune to report noise pollution using their smartphone microphones. The app collects, analyzes, and visualizes noise pollution data to help government officials identify causes, patterns, and potential solutions for urban noise issues.

## Recent Updates

- **Advanced Analytics Dashboard**: Added AI-powered analytics with predictive modeling for noise patterns
- **Improved UI/UX**: Enhanced user interface with better accessibility and responsive design
- **Performance Optimization**: Reduced load times and improved application efficiency
- **Bug Fixes**: Resolved issues with report submission and data visualization
- **Admin Portal Enhancements**: Added new tools for government officials to manage noise reports

## Features

- **Anonymous Noise Reporting**: Easily measure and report noise pollution
- **Interactive Maps**: View noise hotspots across the city
- **Data Visualization**: Analyze noise patterns and trends
- **Educational Content**: Learn about noise pollution health effects
- **Government Portal**: Secure access for officials to view aggregated data

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL)
- **Maps**: Mapbox GL
- **Data Visualization**: Recharts
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for database)
- Mapbox account (for maps)

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/noise-sense-pune-pulse.git
   cd noise-sense-pune-pulse
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Database Setup

1. Create a Supabase project
2. Run the following SQL to create the necessary tables:

```sql
CREATE TABLE noise_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  decibel_level FLOAT NOT NULL,
  noise_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  device_info JSONB
);

-- Create indexes for better query performance
CREATE INDEX noise_reports_location_idx ON noise_reports USING gist (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
CREATE INDEX noise_reports_created_at_idx ON noise_reports (created_at);
CREATE INDEX noise_reports_noise_type_idx ON noise_reports (noise_type);
```

## Deployment

### Build for Production

```
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to your hosting provider of choice.

## Project Structure

```
noise-sense-pune-pulse/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # External service integrations
│   ├── layouts/          # Page layouts
│   ├── lib/              # Utility functions and constants
│   ├── pages/            # Application pages
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── .env                  # Environment variables (git-ignored)
└── package.json          # Project dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- PMC (Pune Municipal Corporation) for open data
- Contributors and community members who provided feedback and testing
