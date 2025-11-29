# Implementation Plan

- [x] 1. Set up Next.js project structure and dependencies




  - Initialize Next.js 14+ project with TypeScript and App Router
  - Install dependencies: peerjs, fast-check, vitest, @testing-library/react
  - Configure Tailwind CSS for styling
  - Set up Vitest with React Testing Library
  - Create folder structure: /app, /components, /lib, /hooks, /types
  - Configure TypeScript with strict mode
  - Set up HTTPS for local development (required for WebRTC)
  - Create .env.local for API configuration
  - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - **After completion: Commit to GitHub with user permission**

- [ ] 2. Implement WebRTC Manager for peer-to-peer video calls
  - [ ] 2.1 Create WebRTCManager class with PeerJS integration in /lib/webrtc
    - Create TypeScript interfaces for connection state and media state
    - Implement session creation with unique ID generation
    - Implement session joining with peer connection
    - Implement local media stream capture (camera + microphone)
    - Implement remote stream handling
    - Use EventEmitter pattern or callbacks for state changes
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 2.2 Write property test for session ID uniqueness
    - **Feature: video-call-live-captions, Property 1: Session ID uniqueness**
    - **Validates: Requirements 1.1**
  
  - [ ] 2.3 Implement two-participant limit enforcement
    - Add participant counter to session state
    - Reject connection attempts when session has 2 participants
    - _Requirements: 1.4_
  
  - [ ] 2.4 Write property test for two-participant limit
    - **Feature: video-call-live-captions, Property 4: Two-participant limit enforcement**
    - **Validates: Requirements 1.4**
  
  - [ ] 2.5 Implement media toggle functionality
    - Add toggleAudio method to enable/disable microphone
    - Add toggleVideo method to enable/disable camera
    - Ensure toggles work independently
    - _Requirements: 2.4, 2.5_
  
  - [ ] 2.6 Write property test for media toggle independence
    - **Feature: video-call-live-captions, Property 7: Media toggle independence**
    - **Validates: Requirements 2.4, 2.5**
  
  - [ ] 2.7 Implement disconnect and cleanup
    - Close peer connections on disconnect
    - Stop all media tracks
    - Release resources
    - Emit disconnection events
    - _Requirements: 1.5_
  
  - [ ] 2.8 Write property test for resource cleanup
    - **Feature: video-call-live-captions, Property 5: Resource cleanup on disconnect**
    - **Validates: Requirements 1.5**
  
  - [ ]* 2.9 Write unit tests for WebRTCManager
    - Test session creation returns valid ID
    - Test join with valid/invalid session IDs
    - Test media stream capture
    - Test connection state transitions
  
  - **After completion: Commit to GitHub with user permission**

- [ ] 3. Implement Speech Recognition Service
  - [ ] 3.1 Create SpeechRecognitionService class in /lib/speech using Web Speech API
    - Create TypeScript interfaces for recognition results
    - Check browser support for SpeechRecognition API
    - Initialize with default English language
    - Implement continuous recognition mode
    - Implement start/stop methods
    - Use callbacks or EventEmitter for recognition results
    - Handle recognition errors gracefully
    - _Requirements: 4.1, 4.3, 4.5_
  
  - [ ] 3.2 Write property test for default English language
    - **Feature: video-call-live-captions, Property 13: Default English source language**
    - **Validates: Requirements 4.3**
  
  - [ ] 3.3 Implement caption finalization on silence detection
    - Configure recognition to detect pauses
    - Emit final results when silence detected
    - _Requirements: 4.4_
  
  - [ ] 3.4 Write property test for caption finalization
    - **Feature: video-call-live-captions, Property 14: Caption finalization on silence**
    - **Validates: Requirements 4.4**
  
  - [ ] 3.5 Implement partial caption display for unclear speech
    - Handle interim results from recognition
    - Display partial captions as they arrive
    - _Requirements: 4.5_
  
  - [ ] 3.6 Write property test for partial caption display
    - **Feature: video-call-live-captions, Property 15: Partial caption display on unclear speech**
    - **Validates: Requirements 4.5**
  
  - [ ]* 3.7 Write unit tests for SpeechRecognitionService
    - Test browser support detection
    - Test language configuration
    - Test start/stop lifecycle
    - Test error handling
  
  - **After completion: Commit to GitHub with user permission**

- [ ] 4. Implement Translation Service
  - [ ] 4.1 Create TranslationService class in /lib/translation with free API integration
    - Create TypeScript interfaces for translation requests/responses
    - Integrate LibreTranslate API (primary) using fetch
    - Add MyMemory API as fallback
    - Implement translate method with error handling
    - Implement language detection logic
    - Add supported languages list with types
    - Use environment variables for API endpoints
    - _Requirements: 6.1, 8.3_
  
  - [ ] 4.2 Write property test for translation service invocation
    - **Feature: video-call-live-captions, Property 19: Translation service invocation for non-English targets**
    - **Validates: Requirements 5.5, 6.1**
  
  - [ ] 4.3 Implement no-translation optimization for matching languages
    - Check if source equals target language
    - Skip translation API call when both are English
    - _Requirements: 5.4_
  
  - [ ] 4.4 Write property test for no translation when languages match
    - **Feature: video-call-live-captions, Property 18: No translation for matching source and target**
    - **Validates: Requirements 5.4**
  
  - [ ] 4.5 Implement fallback to English on translation failure
    - Catch API errors and network failures
    - Return original English text as fallback
    - Log errors for debugging
    - _Requirements: 6.3_
  
  - [ ] 4.6 Write property test for translation fallback
    - **Feature: video-call-live-captions, Property 20: Translation fallback on service failure**
    - **Validates: Requirements 6.3**
  
  - [ ] 4.7 Implement rate limit error handling
    - Detect rate limit errors from API responses
    - Display user-friendly error message
    - Continue operation with English captions
    - _Requirements: 8.5_
  
  - [ ] 4.8 Write property test for rate limit handling
    - **Feature: video-call-live-captions, Property 27: Rate limit error handling**
    - **Validates: Requirements 8.5**
  
  - [ ]* 4.9 Write unit tests for TranslationService
    - Test API call with correct parameters
    - Test error handling for various failure modes
    - Test language code validation
    - Test fallback behavior
  
  - **After completion: Commit to GitHub with user permission**

- [ ] 5. Implement Caption Manager to coordinate speech and translation
  - [ ] 5.1 Create CaptionManager class in /lib/captions
    - Create TypeScript interfaces for Caption type
    - Initialize with SpeechRecognitionService and TranslationService
    - Implement caption queue management with proper typing
    - Add speaker identification (local vs remote)
    - Implement timestamp generation
    - Use callbacks or EventEmitter for new captions
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 5.2 Implement local caption generation
    - Connect speech recognition to caption creation
    - Add captions to queue with timestamps
    - Mark captions as 'local' speaker
    - _Requirements: 3.1, 4.1_
  
  - [ ] 5.3 Write property test for speech recognition invocation
    - **Feature: video-call-live-captions, Property 12: Speech recognition invocation**
    - **Validates: Requirements 4.1**
  
  - [ ] 5.4 Implement remote caption processing
    - Receive caption data from peer via WebRTC data channel
    - Add remote captions to queue
    - Mark captions as 'remote' speaker
    - _Requirements: 7.3_
  
  - [ ] 5.5 Write property test for speaker identification
    - **Feature: video-call-live-captions, Property 25: Speaker identification preservation**
    - **Validates: Requirements 7.3**
  
  - [ ] 5.6 Implement language selection and translation pipeline
    - Set default target language to English
    - Apply translation when target language differs from English
    - Update target language on user selection
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 5.7 Write property test for default English caption language
    - **Feature: video-call-live-captions, Property 16: Default English caption language**
    - **Validates: Requirements 5.1**
  
  - [ ] 5.8 Write property test for language selection affecting future captions
    - **Feature: video-call-live-captions, Property 17: Language selection affects future captions**
    - **Validates: Requirements 5.2, 5.3**
  
  - [ ] 5.9 Implement mute state caption control
    - Pause caption generation when microphone is muted
    - Resume caption generation when microphone is unmuted
    - _Requirements: 3.4, 3.5_
  
  - [ ] 5.10 Write property test for mute state affecting captions
    - **Feature: video-call-live-captions, Property 11: Mute state affects captions**
    - **Validates: Requirements 3.4, 3.5**
  
  - [ ] 5.11 Implement chronological caption ordering
    - Sort captions by timestamp before display
    - Maintain order when adding new captions
    - _Requirements: 7.2_
  
  - [ ] 5.12 Write property test for chronological ordering
    - **Feature: video-call-live-captions, Property 24: Chronological caption ordering**
    - **Validates: Requirements 7.2**
  
  - [ ] 5.13 Implement continued operation after translation failure
    - Catch translation errors per caption
    - Display untranslated text on failure
    - Continue processing next captions
    - _Requirements: 6.5_
  
  - [ ] 5.14 Write property test for continued operation after failure
    - **Feature: video-call-live-captions, Property 22: Continued operation after translation failure**
    - **Validates: Requirements 6.5**
  
  - [ ]* 5.15 Write unit tests for CaptionManager
    - Test caption creation with correct metadata
    - Test queue management
    - Test language change handling
    - Test mute/unmute behavior
  
  - **After completion: Commit to GitHub with user permission**

- [ ] 6. Implement React components for video and caption display
  - [ ] 6.1 Create VideoDisplay component in /components
    - Create TypeScript props interface
    - Accept local and remote MediaStream as props
    - Use useRef for video element references
    - Implement video element rendering with proper srcObject binding
    - Add muted attribute for local video (prevent echo)
    - Style with Tailwind CSS for responsive layout
    - _Requirements: 7.1, 7.5_
  
  - [ ] 6.2 Create CaptionDisplay component in /components
    - Create TypeScript props interface for caption data
    - Accept array of Caption objects as props
    - Render captions with speaker indicators
    - Implement auto-scroll to newest captions
    - Style with Tailwind CSS for readability
    - _Requirements: 7.1, 7.3_
  
  - [ ] 6.3 Write property test for active media transmission
    - **Feature: video-call-live-captions, Property 6: Active media transmission**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ] 6.4 Write property test for caption display
    - **Feature: video-call-live-captions, Property 23: Caption display in designated area**
    - **Validates: Requirements 7.1**
  
  - [ ] 6.5 Implement caption list management in CaptionDisplay
    - Set maximum number of visible captions (e.g., 10)
    - Use React state to manage caption array
    - Remove oldest captions when limit reached using slice
    - _Requirements: 7.4_
  
  - [ ] 6.6 Write property test for caption list management
    - **Feature: video-call-live-captions, Property 26: Caption list management at capacity**
    - **Validates: Requirements 7.4**
  
  - [ ] 6.7 Create LanguageSelector component in /components
    - Create TypeScript props interface with onChange callback
    - Populate dropdown with supported languages
    - Handle language change events
    - Style with Tailwind CSS
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 6.8 Create MediaControls component in /components
    - Create TypeScript props interface for toggle callbacks
    - Add buttons for audio/video toggle with icons
    - Display current media state (on/off)
    - Style with Tailwind CSS
    - _Requirements: 2.4, 2.5_
  
  - [ ] 6.9 Create ConnectionStatus component in /components
    - Create TypeScript props interface for connection state
    - Show "Connecting..." when establishing connection
    - Show "Connected" when call is active
    - Show "Disconnected" when call ends
    - Style with Tailwind CSS and color indicators
    - _Requirements: 1.3, 1.5_
  
  - [ ]* 6.10 Write unit tests for React components
    - Test VideoDisplay component rendering
    - Test CaptionDisplay component rendering
    - Test LanguageSelector component
    - Test MediaControls component
    - Test ConnectionStatus component
  
  - **After completion: Commit to GitHub with user permission**

- [ ] 7. Integrate all components and implement main application flow
  - [ ] 7.1 Create useVideoCall custom hook in /hooks
    - Initialize all service instances (WebRTC, Speech, Translation, Caption)
    - Manage call state with useState (connecting, connected, disconnected)
    - Manage media streams with useState
    - Implement session creation flow
    - Implement session joining flow
    - Return state and control functions
    - _Requirements: 1.1, 1.2_
  
  - [ ] 7.2 Write property test for valid session joinability
    - **Feature: video-call-live-captions, Property 2: Valid session joinability**
    - **Validates: Requirements 1.2**
  
  - [ ] 7.3 Implement connection establishment flow
    - Request camera and microphone permissions
    - Establish WebRTC connection
    - Start media streaming
    - Initialize caption generation
    - _Requirements: 1.3, 2.1, 2.2, 3.1_
  
  - [ ] 7.4 Write property test for stream establishment
    - **Feature: video-call-live-captions, Property 3: Stream establishment on connection**
    - **Validates: Requirements 1.3**
  
  - [ ] 7.5 Write property test for audio capture during call
    - **Feature: video-call-live-captions, Property 8: Audio capture during call**
    - **Validates: Requirements 3.1**
  
  - [ ] 7.6 Implement dual audio path for call and captions
    - Ensure call audio transmission continues during caption processing
    - Clone audio stream for speech recognition
    - _Requirements: 3.2_
  
  - [ ] 7.7 Write property test for dual audio path operation
    - **Feature: video-call-live-captions, Property 9: Dual audio path operation**
    - **Validates: Requirements 3.2**
  
  - [ ] 7.8 Implement complete audio capture without filtering
    - Configure audio capture to include all sounds
    - Do not apply noise cancellation for caption audio
    - _Requirements: 3.3_
  
  - [ ] 7.9 Write property test for complete audio capture
    - **Feature: video-call-live-captions, Property 10: Complete audio capture**
    - **Validates: Requirements 3.3**
  
  - [ ] 7.10 Implement WebRTC data channel for caption sharing
    - Create data channel for sending captions to peer
    - Handle incoming caption data from peer
    - Serialize and deserialize caption objects
    - _Requirements: 7.1, 7.3_
  
  - [ ] 7.11 Write property test for independent participant translation
    - **Feature: video-call-live-captions, Property 21: Independent participant translation**
    - **Validates: Requirements 6.4**
  
  - [ ] 7.12 Implement error handling and user notifications
    - Handle camera/microphone permission denials
    - Handle browser compatibility issues
    - Display error messages in UI
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 7.13 Write integration tests for complete call flow
    - Test create session → join → connect → stream → caption flow
    - Test language switching during active call
    - Test disconnect and cleanup
    - Test error recovery scenarios
  
  - **After completion: Commit to GitHub with user permission**

- [ ] 8. Create Next.js pages and layouts
  - [ ] 8.1 Create home page at /app/page.tsx
    - Add "Create Call" button that navigates to /call/[id]
    - Add "Join Call" input field and button
    - Validate session ID input
    - Add copy-to-clipboard functionality for session ID
    - Style with Tailwind CSS
    - _Requirements: 1.1, 1.2_
  
  - [ ] 8.2 Create call page at /app/call/[id]/page.tsx
    - Use useVideoCall hook for call logic
    - Integrate VideoDisplay component
    - Integrate CaptionDisplay component
    - Integrate LanguageSelector component
    - Integrate MediaControls component
    - Integrate ConnectionStatus component
    - Create responsive layout with Tailwind CSS
    - _Requirements: 7.1, 7.5_
  
  - [ ] 8.3 Add browser compatibility check component
    - Create BrowserCheck component in /components
    - Check for WebRTC support on mount
    - Check for Web Speech API support
    - Display warning messages for unsupported browsers
    - Provide fallback instructions
    - Use in layout or pages
    - _Requirements: 8.1, 8.2_
  
  - [ ]* 8.4 Write unit tests for pages
    - Test home page rendering
    - Test session ID validation
    - Test copy-to-clipboard functionality
    - Test call page component integration
  
  - **After completion: Commit to GitHub with user permission**

- [ ] 9. Style the application with Tailwind CSS
  - [ ] 9.1 Configure Tailwind theme in tailwind.config.ts
    - Add custom colors for branding
    - Configure responsive breakpoints
    - Add custom animations for captions
    - Set up dark mode support (optional)
    - _Requirements: 7.5_
  
  - [ ] 9.2 Style video components
    - Use Tailwind classes for video containers with aspect ratios
    - Add visual indicators for active speaker using border/shadow
    - Add hover effects for interactive elements
    - Ensure proper video sizing and positioning
    - _Requirements: 7.5_
  
  - [ ] 9.3 Style caption components
    - Use Tailwind typography for readable fonts
    - Add background with opacity for caption text contrast
    - Style speaker indicators with different colors (local/remote)
    - Add smooth transitions for new captions using Tailwind animations
    - _Requirements: 7.3, 7.5_
  
  - [ ] 9.4 Implement responsive design
    - Use Tailwind responsive classes (sm:, md:, lg:)
    - Stack videos vertically on mobile screens
    - Adjust caption font size for mobile
    - Ensure touch-friendly button sizes (min 44px)
    - _Requirements: 7.5_
  
  - [ ] 9.5 Style loading and connection states
    - Create loading spinner with Tailwind animations
    - Style connection status with color indicators (green/yellow/red)
    - Add visual feedback for button clicks using Tailwind active states
    - _Requirements: 1.3, 1.5_
  
  - **After completion: Commit to GitHub with user permission**

- [ ] 10. Checkpoint - Ensure all tests pass
  - Run all unit tests
  - Run all property-based tests
  - Fix any failing tests
  - Ensure all tests pass, ask the user if questions arise
  - **After completion: Commit to GitHub with user permission**

- [ ] 11. Create deployment configuration for Vercel
  - [ ] 11.1 Set up Vercel deployment
    - Create vercel.json configuration file
    - Configure build settings for Next.js
    - Set up environment variables in Vercel dashboard
    - Add HTTPS configuration (automatic with Vercel)
    - Create README with deployment instructions
    - _Requirements: 8.4_
  
  - [ ] 11.2 Add environment configuration
    - Create .env.example file with all required variables
    - Configure PeerJS server connection URL
    - Configure translation API endpoints
    - Add fallback API configuration
    - Document free tier limitations in README
    - _Requirements: 8.3, 8.5_
  
  - [ ] 11.3 Create user documentation
    - Write usage instructions in README
    - Document browser requirements (Chrome, Edge, Safari)
    - Add troubleshooting guide for common issues
    - Include privacy and security notes
    - Add development setup instructions
    - _Requirements: 8.1, 8.2_
  
  - **After completion: Commit to GitHub with user permission**

- [ ] 12. Final testing and polish
  - [ ] 12.1 Test in multiple browsers
    - Test in Chrome
    - Test in Edge
    - Test in Safari
    - Document any browser-specific issues
    - _Requirements: 8.1, 8.2_
  
  - [ ] 12.2 Test with real camera and microphone
    - Test video quality
    - Test audio quality
    - Test caption accuracy
    - Test translation accuracy
    - _Requirements: 2.1, 2.2, 4.1, 6.1_
  
  - [ ] 12.3 Test error scenarios
    - Test with permissions denied
    - Test with no camera/microphone
    - Test with network disconnection
    - Test with API rate limits
    - _Requirements: 6.3, 8.5_
  
  - [ ] 12.4 Performance optimization
    - Minimize caption processing overhead
    - Optimize video quality settings
    - Add debouncing for translation requests
    - Test with slow network conditions
    - _Requirements: 2.3, 4.2, 6.2_
  
  - **After completion: Commit to GitHub with user permission**

- [ ] 13. Final Checkpoint - Ensure all tests pass
  - Run complete test suite
  - Verify all features work end-to-end
  - Ensure all tests pass, ask the user if questions arise
  - **After completion: Final commit to GitHub with user permission**
