# NoiseSense - Crowdsourced Noise Pollution Monitoring

NoiseSense is a web application that allows users to measure, report, and visualize noise pollution in their communities.

## Features

- Real-time noise level measurement using device microphone
- Interactive map for location selection
- Noise source categorization
- Data visualization with charts and heatmaps
- Report generation and submission to authorities

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Maps**: Leaflet, Mapbox GL

## Environment Variables

The application uses the following environment variables:

### Root Directory (.env)
```
# Environment
NODE_ENV=development

# Server Configuration
PORT=3000

# MongoDB Configuration
MONGODB_URI=your_mongodb_uri
DB_NAME=noisesense

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# API Configuration
API_URL=http://localhost:3000

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Frontend Directory (frontend/.env)
```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Deployment on Render

This application is configured for deployment on Render. Follow these steps to deploy:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following environment variables:
   - `NODE_ENV`: production
   - `PORT`: 3000
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `DB_NAME`: noisesense
   - `CORS_ORIGIN`: Your Render app URL
   - `API_URL`: Your Render app URL
   - `NEXT_PUBLIC_API_URL`: Your Render app URL

4. Set the build command to:
   ```
   npm install && cd frontend && npm install && npm run build
   ```

5. Set the start command to:
   ```
   node noisesense/server.js
   ```

6. Deploy the application

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd frontend && npm install
   ```

3. Create a `.env` file in the root directory with the environment variables listed above

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

MIT 