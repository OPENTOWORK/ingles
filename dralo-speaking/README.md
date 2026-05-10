# Dralo Speaking Module — Setup Guide

## Quick Start (15 minutes)

### 1. Get your free Gemini API key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### 2. Add to your .env file

Create or edit `.env` in the root of your project:

```
VITE_GEMINI_API_KEY=your_key_here
```

If you use Next.js instead of Vite:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```
And in gemini-coach.js change `import.meta.env.VITE_GEMINI_API_KEY` 
to `process.env.NEXT_PUBLIC_GEMINI_API_KEY`

### 3. Install dependencies

```bash
npm install lucide-react
```

### 4. Copy files to your project

```
your-project/
├── src/
│   ├── pages/
│   │   └── speaking.jsx          ← copy from pages/SpeakingPage.jsx
│   ├── lib/
│   │   ├── gemini-coach.js       ← copy from lib/
│   │   └── useSpeechRecognition.js ← copy from lib/
│   └── prompts/
│       └── cambridge-prompts.js  ← copy from prompts/
```

### 5. Add route

In your router (React Router, Next.js, etc.):

**React Router:**
```jsx
import SpeakingPage from './pages/SpeakingPage';
<Route path="/speaking" element={<SpeakingPage />} />
```

**Next.js (App Router):**
Rename to `app/speaking/page.jsx` — done.

**Next.js (Pages Router):**
Rename to `pages/speaking.jsx` — done.

---

## Free Tier Limits

| Service | Free limit | What happens when exceeded |
|---------|-----------|---------------------------|
| Gemini 1.5 Flash | 1,500 requests/day | Returns 429 error |
| Web Speech API | Unlimited | Nothing — it's free forever |
| Web TTS API | Unlimited | Nothing — it's free forever |

1,500 requests/day = roughly 300 full practice sessions per day.
More than enough until you have paying users.

---

## Browser Compatibility

| Browser | Speech Recognition | TTS |
|---------|-------------------|-----|
| Chrome | ✅ Full support | ✅ |
| Edge | ✅ Full support | ✅ |
| Safari | ⚠️ Partial | ✅ |
| Firefox | ❌ Not supported | ✅ |
| Mobile Chrome | ✅ | ✅ |
| Mobile Safari | ⚠️ | ✅ |

The app shows a warning automatically in unsupported browsers.

---

## Upgrading to paid APIs (when ready)

### Better speech recognition (OpenAI Whisper)
Replace `useSpeechRecognition.js` with actual audio recording + Whisper API.
Cost: ~$0.006/minute of audio.

### Better TTS voices (ElevenLabs)  
Replace `speakText()` in `gemini-coach.js` with ElevenLabs API call.
Cost: ~$0.30/10k characters.

---

## File structure

```
dralo-speaking/
├── README.md                       ← this file
├── pages/
│   └── SpeakingPage.jsx            ← main component, drop into your app
├── lib/
│   ├── gemini-coach.js             ← Gemini API + TTS
│   └── useSpeechRecognition.js     ← Web Speech API hook
└── prompts/
    └── cambridge-prompts.js        ← all system prompts by level + mode
```
