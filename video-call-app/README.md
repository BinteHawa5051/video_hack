# Video Call with Live Translated Captions

A real-time two-person video calling application with live speech-to-text captioning and multi-language translation, built entirely with **100% free technologies**.

## Features

- 🎥 **Real-time Video Calls**: Peer-to-peer video calling using WebRTC
- 🎤 **Live Captions**: Automatic speech-to-text conversion
- 🌍 **Multi-language Translation**: Translate captions into any supported language
- 💰 **Completely Free**: No API keys, no subscriptions, no hidden costs
- 🔒 **Privacy First**: Peer-to-peer connections, no data storage
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14+ with React 18+ and TypeScript
- **Video/Audio**: WebRTC (peer-to-peer)
- **Signaling**: PeerJS (free cloud server)
- **Speech-to-Text**: Web Speech API (built into Chrome/Edge)
- **Translation**: LibreTranslate API (free, open-source)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library + fast-check
- **Hosting**: Vercel (free tier)

## Browser Requirements

- **Chrome 74+** (recommended - full feature support)
- **Edge 79+** (full feature support)
- **Safari 12+** (full feature support)
- **Firefox 68+** (video calls only, no speech recognition)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd video-call-app
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.local.example .env.local
```

### Development

Run the development server:

```bash
npm run dev
```

For HTTPS (required for WebRTC in production):
```bash
npm run dev:https
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

Run tests:
```bash
npm test
```

Run tests once:
```bash
npm run test:run
```

Run tests with UI:
```bash
npm run test:ui
```

## How to Use

1. **Create a Call**: Click "Create Call" on the home page
2. **Share Session ID**: Copy the generated session ID and share it with another person
3. **Join Call**: The other person enters the session ID and clicks "Join Call"
4. **Grant Permissions**: Both participants grant camera and microphone permissions
5. **Select Language**: Choose your preferred caption language from the dropdown
6. **Start Talking**: Captions will appear automatically as you speak

## Project Structure

```
video-call-app/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page (create/join)
│   ├── call/[id]/         # Call page (dynamic route)
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── VideoDisplay.tsx
│   ├── CaptionDisplay.tsx
│   ├── LanguageSelector.tsx
│   ├── MediaControls.tsx
│   └── ConnectionStatus.tsx
├── lib/                   # Service classes
│   ├── webrtc/           # WebRTC manager
│   ├── speech/           # Speech recognition service
│   ├── translation/      # Translation service
│   └── captions/         # Caption manager
├── hooks/                 # Custom React hooks
│   └── useVideoCall.ts
├── types/                 # TypeScript definitions
│   └── index.ts
└── tests/                 # Test files
```

## Free Service Limitations

### Web Speech API
- Requires internet connection (uses Google's servers)
- Only works in Chrome, Edge, and Safari
- No official rate limits

### Translation APIs
- **LibreTranslate**: Public instance may have rate limits
- **MyMemory**: 5000 characters/day free tier
- Fallback: Display English when limits reached

### PeerJS
- Free signaling server
- May have connection limits during high traffic

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables from `.env.local.example`
4. Deploy!

Vercel provides:
- Automatic HTTPS (required for WebRTC)
- Unlimited bandwidth
- Global CDN
- Zero configuration

## Troubleshooting

### Camera/Microphone Not Working
- Ensure you've granted permissions in your browser
- Check if another application is using the devices
- Try refreshing the page

### Speech Recognition Not Working
- Use Chrome, Edge, or Safari (Firefox not supported)
- Check your internet connection
- Ensure microphone permissions are granted

### Translation Not Working
- Check your internet connection
- API may have reached rate limits (will fallback to English)
- Try again later

### Connection Failed
- Check your internet connection
- Ensure both participants are using supported browsers
- Try creating a new session

## Privacy & Security

- All video/audio communication is **peer-to-peer** (no server in between)
- No data is stored on any server
- Session IDs are cryptographically secure
- HTTPS required for production use

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- Built with ❤️ using 100% free and open-source technologies
- Special thanks to the WebRTC, PeerJS, and LibreTranslate communities
