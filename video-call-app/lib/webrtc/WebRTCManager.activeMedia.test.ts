import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { WebRTCManager } from './WebRTCManager';

// Mock PeerJS
vi.mock('peerjs', () => {
  return {
    default: class MockPeer {
      constructor(public id: string, public config: any) {}
      on(event: string, callback: Function) {
        if (event === 'open') {
          setTimeout(() => callback(this.id), 0);
        }
      }
      destroy() {}
      connect() {
        return {
          on: () => {},
          close: () => {},
        };
      }
      call() {
        return {
          on: () => {},
          close: () => {},
          answer: () => {},
        };
      }
    },
  };
});

// Mock navigator.mediaDevices
global.navigator = {
  mediaDevices: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [
        { kind: 'video', enabled: true, stop: vi.fn() },
        { kind: 'audio', enabled: true, stop: vi.fn() },
      ],
      getVideoTracks: () => [{ kind: 'video', enabled: true, stop: vi.fn() }],
      getAudioTracks: () => [{ kind: 'audio', enabled: true, stop: vi.fn() }],
    }),
  },
} as any;

// Mock crypto for session ID generation
if (!global.crypto) {
  (global as any).crypto = {};
}
if (!global.crypto.randomUUID) {
  (global.crypto as any).randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}
if (!global.crypto.getRandomValues) {
  global.crypto.getRandomValues = (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

describe('WebRTCManager - Active Media Transmission', () => {
  let manager: WebRTCManager;

  beforeEach(() => {
    manager = new WebRTCManager();
  });

  afterEach(() => {
    if (manager) {
      manager.disconnect();
    }
  });

  // Feature: video-call-live-captions, Property 6: Active media transmission
  // Validates: Requirements 2.1, 2.2
  it('should have active media tracks when camera or microphone is enabled', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(), // audioEnabled
        fc.boolean(), // videoEnabled
        async (audioEnabled, videoEnabled) => {
          const mgr = new WebRTCManager();
          
          // Get local stream
          const stream = await mgr.getLocalStream();
          expect(stream).toBeDefined();

          // Set the media states
          mgr.toggleAudio(audioEnabled);
          mgr.toggleVideo(videoEnabled);

          // Get media state
          const mediaState = mgr.getMediaState();

          // Verify state matches what we set
          expect(mediaState.audioEnabled).toBe(audioEnabled);
          expect(mediaState.videoEnabled).toBe(videoEnabled);

          // Get the actual tracks from the stream
          const audioTracks = stream.getAudioTracks();
          const videoTracks = stream.getVideoTracks();

          // If audio is enabled, audio track should exist and be enabled
          if (audioEnabled) {
            expect(audioTracks.length).toBeGreaterThan(0);
            expect(audioTracks[0].enabled).toBe(true);
            expect(audioTracks[0].kind).toBe('audio');
          }

          // If video is enabled, video track should exist and be enabled
          if (videoEnabled) {
            expect(videoTracks.length).toBeGreaterThan(0);
            expect(videoTracks[0].enabled).toBe(true);
            expect(videoTracks[0].kind).toBe('video');
          }

          // If audio is disabled, audio track should be disabled (but still exist)
          if (!audioEnabled && audioTracks.length > 0) {
            expect(audioTracks[0].enabled).toBe(false);
          }

          // If video is disabled, video track should be disabled (but still exist)
          if (!videoEnabled && videoTracks.length > 0) {
            expect(videoTracks[0].enabled).toBe(false);
          }

          mgr.disconnect();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional test: verify at least one media type is active when both are enabled
  it('should have both audio and video tracks active when both are enabled', async () => {
    const mgr = new WebRTCManager();
    
    const stream = await mgr.getLocalStream();
    
    // Enable both
    mgr.toggleAudio(true);
    mgr.toggleVideo(true);

    const audioTracks = stream.getAudioTracks();
    const videoTracks = stream.getVideoTracks();

    // Both should be present and enabled
    expect(audioTracks.length).toBeGreaterThan(0);
    expect(videoTracks.length).toBeGreaterThan(0);
    expect(audioTracks[0].enabled).toBe(true);
    expect(videoTracks[0].enabled).toBe(true);

    mgr.disconnect();
  });
});
