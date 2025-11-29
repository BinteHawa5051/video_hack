# Design Document

## Overview

This application provides real-time two-person video calling with live speech-to-text captioning and multi-language translation, built entirely with free technologies. The system uses WebRTC for peer-to-peer video/audio communication, the Web Speech API for speech recognition, and free translation APIs for multi-language support. The architecture is browser-based, requiring no backend infrastructure costs.

### Technology Stack (100% Free)

- **Framework**: Next.js 14+ with React 18+ and TypeScript
- **Video/Audio**: WebRTC (built into browsers, peer-to-peer)
- **Signaling**: PeerJS (free cloud signaling server) or simple WebSocket signaling
- **Speech-to-Text**: Web Speech API (built into Chrome/Edge browsers, free)
- **Translation**: LibreTranslate API (free, open-source) or MyMemory Translation API (free tier)
- **Styling**: Tailwind CSS (for rapid UI development)
- **Testing**: Vitest + React Testing Library + fast-check (property-based testing)
- **Hosting**: Vercel (free tier, optimized for Next.js)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Application                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Video UI   │  │  Caption UI  │  │  Language       │  │
│  │   Component  │  │  Component   │  │  Selector       │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   WebRTC     │  │  Speech      │  │  Translation    │  │
│  │   Manager    │  │  Recognition │  │  Service        │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Signaling Service (PeerJS)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

         Participant 1  ←──────────────→  Participant 2
              (Browser)    P2P WebRTC         (Browser)
```

### Component Flow

1. **Call Initiation**: User creates session → generates unique ID → shares with peer
2. **Connection**: Peer joins → WebRTC handshake via signaling → P2P connection established
3. **Media Streaming**: Camera/mic → WebRTC → peer's browser (bidirectional)
4. **Speech Capture**: Mic audio → Web Speech API → text captions
5. **Translation**: English text → Translation API → target language
6. **Display**: Translated captions → UI overlay on video

## Components and Interfaces

### 1. WebRTC Manager

**Responsibilities:**
- Establish peer-to-peer connections
- Manage video/audio streams
- Handle connection state changes
- Enforce two-person limit

**Interface:**
```javascript
class WebRTCManager {
  // Initialize with signaling service
  constructor(signalingService)
  
  // Create a new call session
  createSession(): Promise<string> // returns session ID
  
  // Join existing session
  joinSession(sessionId: string): Promise<void>
  
  // Get local media stream
  getLocalStream(): Promise<MediaStream>
  
  // Get remote media stream
  getRemoteStream(): MediaStream | null
  
  // Toggle audio/video
  toggleAudio(enabled: boolean): void
  toggleVideo(enabled: boolean): void
  
  // End call
  disconnect(): void
  
  // Events
  on(event: 'connected' | 'disconnected' | 'stream', callback: Function): void
}
```

### 2. Speech Recognition Service

**Responsibilities:**
- Capture audio from microphone
- Convert speech to text in real-time
- Handle recognition errors
- Manage recognition lifecycle

**Interface:**
```javascript
class SpeechRecognitionService {
  // Initialize with language
  constructor(language: string = 'en-US')
  
  // Start continuous recognition
  start(): void
  
  // Stop recognition
  stop(): void
  
  // Change recognition language
  setLanguage(language: string): void
  
  // Events
  on(event: 'result' | 'error' | 'end', callback: Function): void
  
  // Check browser support
  static isSupported(): boolean
}
```

### 3. Translation Service

**Responsibilities:**
- Translate text between languages
- Handle API rate limits
- Provide fallback for failures
- Cache translations (optional optimization)

**Interface:**
```javascript
class TranslationService {
  // Initialize with API endpoint
  constructor(apiEndpoint: string)
  
  // Translate text
  translate(text: string, sourceLang: string, targetLang: string): Promise<string>
  
  // Check if translation is needed
  needsTranslation(sourceLang: string, targetLang: string): boolean
  
  // Get supported languages
  getSupportedLanguages(): Array<{code: string, name: string}>
}
```

### 4. Caption Manager

**Responsibilities:**
- Coordinate speech recognition and translation
- Manage caption queue
- Associate captions with speakers
- Handle display timing

**Interface:**
```javascript
class CaptionManager {
  constructor(speechService, translationService)
  
  // Start captioning for local user
  startLocalCaptions(targetLanguage: string): void
  
  // Process remote captions
  processRemoteCaption(caption: Caption): void
  
  // Change target language
  setTargetLanguage(language: string): void
  
  // Events
  on(event: 'caption', callback: (caption: Caption) => void): void
}
```

### 5. UI Controller

**Responsibilities:**
- Render video streams
- Display captions
- Handle user interactions
- Manage language selection

**Interface:**
```javascript
class UIController {
  // Initialize UI elements
  constructor(containerElement: HTMLElement)
  
  // Display video streams
  setLocalStream(stream: MediaStream): void
  setRemoteStream(stream: MediaStream): void
  
  // Display caption
  addCaption(caption: Caption, speaker: 'local' | 'remote'): void
  
  // Update UI state
  setConnectionState(state: 'connecting' | 'connected' | 'disconnected'): void
  
  // Handle user actions
  onLanguageChange(callback: (language: string) => void): void
  onToggleAudio(callback: (enabled: boolean) => void): void
  onToggleVideo(callback: (enabled: boolean) => void): void
}
```

## Data Models

### Caption
```javascript
{
  id: string,              // Unique caption identifier
  text: string,            // Caption text (translated if applicable)
  originalText: string,    // Original text before translation
  speaker: 'local' | 'remote',
  timestamp: number,       // Unix timestamp
  language: string,        // Language code (e.g., 'en', 'es')
  isTranslated: boolean    // Whether translation was applied
}
```

### CallSession
```javascript
{
  sessionId: string,       // Unique session identifier
  participants: number,    // Current participant count (max 2)
  createdAt: number,       // Session creation timestamp
  status: 'waiting' | 'active' | 'ended'
}
```

### MediaState
```javascript
{
  audioEnabled: boolean,
  videoEnabled: boolean,
  stream: MediaStream | null
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After reviewing all testable properties, several can be consolidated:
- Properties 2.1 and 2.2 (video/audio transmission) can be combined into one media transmission property
- Properties 2.4 and 2.5 (toggle camera/mic) can be combined into one media toggle property
- Properties 3.4 and 3.5 (mute/unmute caption behavior) can be combined into one mute state property
- Properties 5.2 and 5.3 (language selection and changes) can be combined into one language application property
- Properties 6.1 and 5.5 are redundant - both test translation service invocation for non-English targets

### Correctness Properties

**Property 1: Session ID uniqueness**
*For any* set of created call sessions, all session identifiers should be unique with no duplicates.
**Validates: Requirements 1.1**

**Property 2: Valid session joinability**
*For any* valid session identifier, a second user should be able to successfully join the call session.
**Validates: Requirements 1.2**

**Property 3: Stream establishment on connection**
*For any* pair of connected participants, both video and audio stream objects should exist and be in connected state.
**Validates: Requirements 1.3**

**Property 4: Two-participant limit enforcement**
*For any* active call session with two participants, any third connection attempt should be rejected and the session should maintain exactly two participants.
**Validates: Requirements 1.4**

**Property 5: Resource cleanup on disconnect**
*For any* call session where either participant disconnects, all media streams and connection resources should be released and the session should terminate.
**Validates: Requirements 1.5**

**Property 6: Active media transmission**
*For any* participant with enabled camera or microphone, the corresponding media track (video or audio) should be present and actively transmitting to the remote peer.
**Validates: Requirements 2.1, 2.2**

**Property 7: Media toggle independence**
*For any* participant, toggling one media type (audio or video) off should disable only that track while the other media type remains in its current state.
**Validates: Requirements 2.4, 2.5**

**Property 8: Audio capture during call**
*For any* participant with an active microphone during a call, the audio stream should be captured and available for processing.
**Validates: Requirements 3.1**

**Property 9: Dual audio path operation**
*For any* active call with caption generation enabled, both the call audio transmission stream and the caption processing audio stream should be active simultaneously.
**Validates: Requirements 3.2**

**Property 10: Complete audio capture**
*For any* audio input including speech and background noise, the system should capture all audio data without filtering.
**Validates: Requirements 3.3**

**Property 11: Mute state affects captions**
*For any* participant, when the microphone is muted, caption generation should be paused, and when unmuted, caption generation should resume immediately.
**Validates: Requirements 3.4, 3.5**

**Property 12: Speech recognition invocation**
*For any* audio input from a participant's speech, the Speech Recognition Engine should be invoked to process the audio data.
**Validates: Requirements 4.1**

**Property 13: Default English source language**
*For any* speech recognition result, the source language should be English unless explicitly configured otherwise.
**Validates: Requirements 4.3**

**Property 14: Caption finalization on silence**
*For any* speech input containing pauses or silence periods, the current caption segment should be finalized when silence is detected.
**Validates: Requirements 4.4**

**Property 15: Partial caption display on unclear speech**
*For any* speech that cannot be clearly recognized, the system should display partial captions containing whatever words were successfully recognized.
**Validates: Requirements 4.5**

**Property 16: Default English caption language**
*For any* participant joining a call, the initial caption display language should be set to English.
**Validates: Requirements 5.1**

**Property 17: Language selection affects future captions**
*For any* participant who selects a target language, all captions generated after the selection should be translated into that language.
**Validates: Requirements 5.2, 5.3**

**Property 18: No translation for matching source and target**
*For any* caption where the source language equals the target language (both English), the caption text should be displayed without invoking the translation service.
**Validates: Requirements 5.4**

**Property 19: Translation service invocation for non-English targets**
*For any* English caption when the target language is not English, the Translation Service should be invoked with the caption text and target language.
**Validates: Requirements 5.5, 6.1**

**Property 20: Translation fallback on service failure**
*For any* caption where translation fails or the Translation Service is unavailable, the original English text should be displayed as fallback.
**Validates: Requirements 6.3**

**Property 21: Independent participant translation**
*For any* target language selected by both participants, each participant should receive translated captions independently in their selected language.
**Validates: Requirements 6.4**

**Property 22: Continued operation after translation failure**
*For any* translation failure on a specific caption, the system should display the untranslated text and continue processing subsequent captions without interruption.
**Validates: Requirements 6.5**

**Property 23: Caption display in designated area**
*For any* generated or translated caption, it should appear in the designated caption UI area.
**Validates: Requirements 7.1**

**Property 24: Chronological caption ordering**
*For any* sequence of multiple captions, they should be displayed in chronological order based on their timestamps.
**Validates: Requirements 7.2**

**Property 25: Speaker identification preservation**
*For any* displayed caption, the speaker identifier (local or remote) should be visually indicated in the UI.
**Validates: Requirements 7.3**

**Property 26: Caption list management at capacity**
*For any* caption list that exceeds the display limit, older captions should be removed or scrolled out to make room for new captions.
**Validates: Requirements 7.4**

**Property 27: Rate limit error handling**
*For any* API rate limit error from free services, the system should display an appropriate error message and continue operating with available features.
**Validates: Requirements 8.5**

## Error Handling

### Network Errors
- **WebRTC Connection Failures**: Display "Connection failed" message, allow retry
- **Signaling Server Unavailable**: Show "Cannot connect to signaling server" with retry option
- **Peer Disconnection**: Detect via WebRTC events, clean up resources, notify user

### Speech Recognition Errors
- **Browser Not Supported**: Check `SpeechRecognition` API availability, show warning message
- **Microphone Permission Denied**: Request permission, show instructions if denied
- **Recognition Service Error**: Log error, attempt to restart recognition service
- **No Speech Detected**: Continue listening, no error shown to user

### Translation Errors
- **API Unavailable**: Fall back to displaying original English text
- **Rate Limit Exceeded**: Show message "Translation temporarily unavailable", display English captions
- **Invalid Language Code**: Log error, fall back to English
- **Network Timeout**: Retry once, then fall back to English

### Media Errors
- **Camera/Microphone Not Found**: Show device selection UI, allow user to choose device
- **Permission Denied**: Display clear instructions on how to grant permissions
- **Device In Use**: Show message "Device is being used by another application"

## Testing Strategy

### Unit Testing

We will use **Vitest** with **React Testing Library** as our testing framework for its speed and modern features. Unit tests will cover:

**WebRTC Manager Tests:**
- Session ID generation produces valid unique identifiers
- Join session with valid ID succeeds
- Join session with invalid ID fails
- Third participant is rejected
- Disconnect cleans up resources

**Speech Recognition Service Tests:**
- Service initializes with correct default language (English)
- Language can be changed
- Start/stop methods work correctly
- Browser support detection works

**Translation Service Tests:**
- Translation API is called with correct parameters
- Fallback to English on API failure
- No translation when source equals target language
- Rate limit errors are handled gracefully

**Caption Manager Tests:**
- Captions are created with correct speaker identification
- Captions maintain chronological order
- Language changes apply to future captions
- Mute state pauses caption generation

**UI Controller Tests:**
- Video streams are attached to correct DOM elements
- Captions are displayed in designated area
- Speaker indicators are shown correctly
- Old captions are removed when limit is reached

### Property-Based Testing

We will use **fast-check** for property-based testing in JavaScript. Each property-based test will run a minimum of 100 iterations.

**Property Test Requirements:**
- Each test must include a comment tag: `// Feature: video-call-live-captions, Property X: [property description]`
- Each correctness property from this document must be implemented as a single property-based test
- Tests should generate random valid inputs to verify properties hold across all cases
- Tests should use appropriate generators (strings, numbers, booleans, objects) to create diverse test cases

**Key Property Tests:**
- Session ID uniqueness across multiple generations (Property 1)
- Two-participant limit enforcement with random join attempts (Property 4)
- Media toggle independence with random state combinations (Property 7)
- Caption chronological ordering with random timestamp sequences (Property 24)
- Translation fallback behavior with simulated API failures (Property 20)
- Rate limit handling with random error scenarios (Property 27)

### Integration Testing

- **End-to-End Call Flow**: Create session → join → establish connection → verify streams
- **Caption Pipeline**: Speak → recognize → translate → display (with mocked APIs)
- **Language Switching**: Change language mid-call → verify new captions use new language
- **Error Recovery**: Simulate API failures → verify fallback behavior → verify recovery

### Testing Approach

1. **Implementation First**: Implement each feature component before writing tests
2. **Unit Tests for Components**: Test individual classes and functions in isolation
3. **Property Tests for Correctness**: Verify universal properties hold across all inputs
4. **Integration Tests for Workflows**: Test complete user flows end-to-end
5. **Manual Testing**: Test in real browsers with actual camera/microphone

## Implementation Notes

### Free Service Limitations

**Web Speech API:**
- Only works in Chrome, Edge, and Safari
- Requires internet connection (uses Google's servers)
- No official rate limits but may throttle heavy usage
- Fallback: Show message "Speech recognition not supported in this browser"

**Translation APIs:**
- **LibreTranslate** (recommended): Self-hosted or use public instance at libretranslate.com
  - Free, open-source, no API key required
  - Public instance may have rate limits
- **MyMemory Translation API**: 
  - Free tier: 5000 characters/day
  - No API key required for free tier
  - Fallback: Display English when limit reached

**PeerJS Cloud Server:**
- Free signaling server for WebRTC
- May have connection limits during high traffic
- Alternative: Deploy own PeerJS server on free hosting (Heroku free tier, Railway, etc.)

### Browser Compatibility

- **WebRTC**: Supported in all modern browsers (Chrome, Firefox, Safari, Edge)
- **Web Speech API**: Chrome, Edge, Safari (not Firefox)
- **MediaDevices API**: All modern browsers
- Minimum browser versions: Chrome 74+, Firefox 68+, Safari 12+, Edge 79+

### Deployment Options (All Free)

1. **Vercel** (Recommended): Optimized for Next.js, unlimited bandwidth, automatic HTTPS, serverless functions, GitHub integration
2. **Netlify**: Static hosting, 100GB bandwidth/month free, automatic HTTPS
3. **Cloudflare Pages**: Static hosting, unlimited bandwidth, automatic HTTPS

Note: Vercel is the recommended choice as it's built by the Next.js team and provides the best performance and developer experience.

### Security Considerations

- **HTTPS Required**: WebRTC and MediaDevices API require HTTPS (except localhost)
- **Permissions**: Request camera/microphone permissions with clear explanations
- **No Data Storage**: All communication is peer-to-peer, no server-side storage
- **Session IDs**: Use cryptographically secure random IDs to prevent guessing

## Future Enhancements (Optional)

- Support for more than 2 participants (requires media server)
- Caption history/transcript download
- Screen sharing capability
- Recording functionality (local only)
- Custom caption styling options
- Offline speech recognition (using browser's local models if available)
