# Deployment Guide

## Quick Deploy to Vercel

```bash
cd video-call-app
git add .
git commit -m "Add live captions and translation"
git push
```

Vercel will automatically rebuild (2-3 minutes).

## Testing the App

### 1. Create a Call
- Go to: https://video-hack-o8no.vercel.app
- Click "Create New Call"
- Copy the Session ID

### 2. Join from Another Device/Browser
- Open the same URL in another browser/tab
- Paste the Session ID
- Click "Join Call"
- **Allow camera and microphone permissions on BOTH devices**

### 3. Test Live Captions
- Start speaking on either device
- Captions will appear in the sidebar
- Change language dropdown to see translations

## Troubleshooting

### "Waiting for remote participant..." Issue

**Cause:** Remote stream not connecting properly

**Solutions:**

1. **Check Browser Console** (F12)
   - Look for "✅ Remote stream received" message
   - If missing, connection didn't establish

2. **Ensure Both Users Allow Permissions**
   - Both must click "Allow" for camera/microphone
   - Refresh if you denied permissions

3. **Try Different Browsers**
   - Chrome (best support)
   - Edge
   - Safari
   - NOT Firefox (no Web Speech API)

4. **Check Network**
   - Both users need good internet
   - Corporate firewalls may block WebRTC
   - Try mobile hotspot if on restricted network

5. **Clear and Retry**
   - Close all tabs
   - Create a NEW call (new session ID)
   - Join from fresh browser tab

### Debug Steps

1. Open browser console (F12) on BOTH devices
2. Look for these messages:
   ```
   ✅ Local stream received
   ✅ Connected to peer
   ✅ Remote stream received
   ```

3. If "Remote stream received" is missing:
   - One user didn't grant permissions
   - Network/firewall blocking WebRTC
   - PeerJS server issue (rare)

### Still Not Working?

Try this sequence:
1. User 1: Create call, wait for "Local stream received"
2. User 2: Join call, wait 2-3 seconds
3. Both: Check if you see each other's video
4. If not, both refresh and try again

## Browser Requirements

✅ Chrome 74+ (Recommended)
✅ Edge 79+
✅ Safari 12+
❌ Firefox (No Web Speech API support)

## Features

- 🎥 Peer-to-peer video calls
- 💬 Live speech-to-text captions
- 🌍 Real-time translation (15 languages)
- 🎤 Audio/video controls
- 👥 Speaker identification
- 📊 Connection status

## Known Limitations

- Only 2 participants per call
- Speech recognition requires internet (uses Google's servers)
- Translation API has rate limits (free tier)
- WebRTC may not work on some corporate networks
