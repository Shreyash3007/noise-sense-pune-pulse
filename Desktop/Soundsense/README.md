# 🎵 NoiseSense

A modern web application for intelligent sound analysis and music processing.

## ✨ Features

- 🎨 Modern, responsive UI with dark/light theme support
- 🔊 Real-time audio processing and visualization
- 🤖 AI-powered sound analysis
- 📊 Interactive data visualization
- 🔒 Secure user authentication via Supabase
- 💾 Efficient data caching and state management
- 📱 Mobile-first, responsive design

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables
- **Animations**: GSAP, CSS Animations
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Hosting**: Vercel/Render

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/noisesense.git
   cd noisesense
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials and other required variables

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# See .env.example for all required variables
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### Supabase Setup

1. Create a new Supabase project
2. Set up the following tables:
   - `themes` - User theme preferences
   - `audio_data` - Processed audio information
3. Configure authentication providers as needed

## 🔧 Development

### Directory Structure

```
noisesense/
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── supabaseClient.js
├── services/
│   └── themeService.js
├── index.html
├── 404.html
└── README.md
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run format` - Format code

## 🚥 API Reference

### Theme Service

```javascript
// Get user theme
await themeService.getUserTheme(userId)

// Update user theme
await themeService.updateUserTheme(userId, theme)
```

## 📈 Performance

- Implements debouncing for scroll events
- Optimized animations with GSAP
- Efficient caching strategy
- Lazy loading of assets
- Optimized images and assets

## 🔐 Security

- Environment variables for sensitive data
- Secure authentication via Supabase
- Rate limiting on API endpoints
- Input sanitization
- XSS protection

## 🧪 Testing

```bash
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@noisesense.com or join our Discord channel. 