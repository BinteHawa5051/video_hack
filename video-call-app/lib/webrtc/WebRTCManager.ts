import Peer, { DataConnection, MediaConnection } from 'peerjs';
import { MediaState, ConnectionState } from '@/types';

type EventCallback = (...args: any[]) => void;

interface WebRTCManagerConfig {
  host?: string;
  port?: number;
  path?: string;
  secure?: boolean;
}

export class WebRTCManager {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private mediaConnection: MediaConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private mediaState: MediaState = {
    audioEnabled: true,
    videoEnabled: true,
    stream: null,
  };
  private eventListeners: Map<string, EventCallback[]> = new Map();
  private config: WebRTCManagerConfig;
  private participantCount: number = 0;

  constructor(config?: WebRTCManagerConfig) {
    this.config = {
      host: config?.host || process.env.NEXT_PUBLIC_PEERJS_HOST || '0.peerjs.com',
      port: config?.port || Number(process.env.NEXT_PUBLIC_PEERJS_PORT) || 443,
      path: config?.path || process.env.NEXT_PUBLIC_PEERJS_PATH || '/',
      secure: config?.secure ?? (process.env.NEXT_PUBLIC_PEERJS_SECURE === 'true') ?? true,
    };
  }

  /**
   * Create a new call session and return the session ID
   * Generates a cryptographically secure unique session identifier
   */
  async createSession(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Generate a unique session ID using crypto API for security
        const sessionId = this.generateSecureSessionId();

        this.peer = new Peer(sessionId, {
          host: this.config.host,
          port: this.config.port,
          path: this.config.path,
          secure: this.config.secure,
        });

        this.peer.on('open', (id) => {
          this.participantCount = 1;
          this.setupPeerListeners();
          this.emit('session-created', id);
          resolve(id);
        });

        this.peer.on('error', (error) => {
          console.error('Peer error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Join an existing call session using session ID
   */
  async joinSession(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create a new peer with a random ID for the joiner
        const joinerId = this.generateSecureSessionId();

        this.peer = new Peer(joinerId, {
          host: this.config.host,
          port: this.config.port,
          path: this.config.path,
          secure: this.config.secure,
        });

        this.peer.on('open', async () => {
          this.setupPeerListeners();

          // Get local media stream before connecting
          try {
            await this.getLocalStream();

            // Establish data connection for captions
            this.connection = this.peer!.connect(sessionId);

            this.connection.on('open', () => {
              this.participantCount = 2;
              this.emit('connected', sessionId);
            });

            this.connection.on('error', (error) => {
              console.error('Connection error:', error);
              reject(error);
            });

            // Call the peer with our media stream
            if (this.localStream) {
              this.mediaConnection = this.peer!.call(sessionId, this.localStream);
              this.setupMediaConnection();
              resolve();
            } else {
              reject(new Error('Failed to get local media stream'));
            }
          } catch (error) {
            reject(error);
          }
        });

        this.peer.on('error', (error) => {
          console.error('Peer error:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get local media stream (camera + microphone)
   */
  async getLocalStream(): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      this.localStream = stream;
      this.mediaState.stream = stream;
      this.emit('local-stream', stream);

      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw new Error('Failed to access camera/microphone. Please grant permissions.');
    }
  }

  /**
   * Get remote media stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Toggle audio on/off
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = enabled;
      });
      this.mediaState.audioEnabled = enabled;
      this.emit('audio-toggled', enabled);
    }
  }

  /**
   * Toggle video on/off
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = enabled;
      });
      this.mediaState.videoEnabled = enabled;
      this.emit('video-toggled', enabled);
    }
  }

  /**
   * Get current media state
   */
  getMediaState(): MediaState {
    return { ...this.mediaState };
  }

  /**
   * Send data through data channel (for captions)
   */
  sendData(data: any): void {
    if (this.connection && this.connection.open) {
      this.connection.send(data);
    }
  }

  /**
   * Disconnect and cleanup resources
   */
  disconnect(): void {
    // Stop all media tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close connections
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }

    if (this.mediaConnection) {
      this.mediaConnection.close();
      this.mediaConnection = null;
    }

    // Destroy peer
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.remoteStream = null;
    this.participantCount = 0;
    this.mediaState = {
      audioEnabled: true,
      videoEnabled: true,
      stream: null,
    };

    this.emit('disconnected');
  }

  /**
   * Register event listener
   */
  on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all registered listeners
   */
  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(...args));
    }
  }

  /**
   * Generate a cryptographically secure session ID
   */
  private generateSecureSessionId(): string {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback: generate random string
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Setup peer event listeners
   */
  private setupPeerListeners(): void {
    if (!this.peer) return;

    // Handle incoming calls
    this.peer.on('call', async (call) => {
      // Enforce two-participant limit
      if (this.participantCount >= 2) {
        console.warn('Third participant attempted to join. Rejecting connection.');
        call.close();
        return;
      }

      try {
        // Get local stream if not already available
        if (!this.localStream) {
          await this.getLocalStream();
        }

        // Answer the call with our stream
        call.answer(this.localStream!);
        this.mediaConnection = call;
        this.participantCount = 2;
        this.setupMediaConnection();
      } catch (error) {
        console.error('Error answering call:', error);
        call.close();
      }
    });

    // Handle incoming data connections
    this.peer.on('connection', (conn) => {
      // Enforce two-participant limit
      if (this.participantCount >= 2) {
        console.warn('Third participant attempted to connect. Rejecting connection.');
        conn.close();
        return;
      }

      this.connection = conn;
      this.participantCount = 2;

      conn.on('data', (data) => {
        this.emit('data', data);
      });

      conn.on('open', () => {
        this.emit('connected', conn.peer);
      });

      conn.on('close', () => {
        this.emit('peer-disconnected');
      });
    });

    // Handle peer disconnection
    this.peer.on('disconnected', () => {
      this.emit('peer-disconnected');
    });

    // Handle peer close
    this.peer.on('close', () => {
      this.emit('peer-closed');
    });
  }

  /**
   * Setup media connection event listeners
   */
  private setupMediaConnection(): void {
    if (!this.mediaConnection) return;

    this.mediaConnection.on('stream', (stream) => {
      this.remoteStream = stream;
      this.emit('remote-stream', stream);
    });

    this.mediaConnection.on('close', () => {
      this.remoteStream = null;
      this.emit('media-connection-closed');
    });

    this.mediaConnection.on('error', (error) => {
      console.error('Media connection error:', error);
      this.emit('media-connection-error', error);
    });
  }
}
