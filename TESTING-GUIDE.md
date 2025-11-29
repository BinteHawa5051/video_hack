# Testing Guide - Video Call with Live Captions

## 🚀 Deploy First

```bash
cd video-call-live-captions/video-call-app
git add .
git commit -m "Fix connection issues and improve error handling"
git push
```

Wait 2-3 minutes for Vercel to rebuild.

## ✅ Testing Steps

### Device 1 (Host):
1. Open: `https://video-hack-o8no.vercel.app`
2. Click "Create New Call"
3. **IMPORTANT:** Click "Allow" when browser asks for camera/microphone
4. Wait until you see YOUR video
5. Copy the Session ID
6. **Keep this tab open!**

### Device 2 (Guest):
1. Open: `https://video-hack-o8no.vercel.app` (in different browser/device)
2. Paste the Session ID
3. Click "Join Call"
4. **IMPORTANT:** Click "Allow" when browser asks for camera/microphone
5. Wait 3-5 seconds

### What Should Happen:
- ✅ Both users see their own video immediately
- ✅ After 3-5 seconds, both users see each other's video
- ✅ Connection status shows "Connected" (green)
- ✅ Captions appear when you speak

## 🐛 If Video Doesn't Appear

### Check Console (F12):

**Host should see:**
```
👑 Attempting to create session as HOST...
✅ SUCCESS! I am the HOST
📢 Waiting for guest to join...
✅ Local stream received
✅ Connected to peer
✅ Remote stream received
```

**Guest should see:**
```
👑 Attempting to create session as HOST...
👤 Host already exists, joining as GUEST...
⏳ Waiting for host to be ready...
✅ SUCCESS! Joined as GUEST
✅ Local stream received
✅ Connected to peer
✅ Remote stream received
```

### Common Issues:

**Issue 1: "ID is taken" error**
- ✅ FIXED! This is now handled automatically
- The second person will automatically join as guest

**Issue 2: See "Connecting..." forever**
- Solution: One person didn't allow camera/mic
- Fix: Refresh both pages, allow permissions

**Issue 3: See own video but not remote video**
- Solution: Wait 5 more seconds
- If still nothing, check console for errors
- Try: Both users refresh and start over

**Issue 4: "Waiting for remote participant..."**
- Solution: Remote stream not received yet
- Check: Is the other person actually in the call?
- Try: Have the other person refresh their page

## 💡 Pro Tips:

1. **Always HOST first, then JOIN**
   - Person 1: Create call and wait
   - Person 2: Join after Person 1 is ready

2. **Allow permissions immediately**
   - Don't click "Block" or close the permission dialog
   - If you blocked it, click the 🔒 in address bar to allow

3. **Use Chrome**
   - Best compatibility
   - Full feature support

4. **Wait patiently**
   - Connection can take 3-5 seconds
   - Don't refresh immediately

5. **Check console logs**
   - Press F12
   - Look for ✅ or ❌ messages
   - Share errors if you need help

## 🎯 Testing Captions:

Once video is working:

1. **Start speaking** - captions appear in sidebar
2. **Change language** - use dropdown at top
3. **Toggle mic** - captions pause when muted
4. **Check speaker labels** - "You" vs "Remote"

## 📞 Need Help?

If it still doesn't work:
1. Open console (F12) on BOTH devices
2. Take screenshots of console messages
3. Share the screenshots
4. I'll help you debug!
