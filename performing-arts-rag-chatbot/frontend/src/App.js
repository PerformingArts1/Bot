{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import React, \{ useState, useEffect, useRef \} from 'react';\
import \{ initializeApp \} from 'firebase/app';\
import \{ getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged \} from 'firebase/auth';\
import \{ getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp \} from 'firebase/firestore';\
import \{ BookText, MapPin, AlertTriangle, Mic, Image as ImageIcon, Send, X, User as UserIcon, MessageSquare, Files, Upload, Search, Wifi, ThumbsUp, ThumbsDown, Video, Youtube, Lightbulb, Info \} from 'lucide-react'; // Importing all necessary icons\
\
// Ensure Tailwind CSS is available in the environment\
// <script src="https://cdn.tailwindcss.com"></script>\
\
// Helper function to convert File to Base64\
const fileToBase64 = (file) => \{\
  return new Promise((resolve, reject) => \{\
    const reader = new FileReader();\
    reader.readAsDataURL(file);\
    reader.onload = () => resolve(reader.result.split(',')[1]); // Get base64 part\
    reader.onerror = (error) => reject(error);\
  \});\
\};\
\
function App() \{\
  const [chatHistory, setChatHistory] = useState([]);\
  const [inputText, setInputText] = useState('');\
  const [imageFile, setImageFile] = useState(null); // For user's image upload for chat\
  const [loading, setLoading] = useState(false);\
  const [db, setDb] = useState(null);\
  const [auth, setAuth] = useState(null);\
  const [userId, setUserId] = useState(null);\
  const [userRole, setUserRole] = useState('Guest'); // Conceptual user role\
  const [isAuthReady, setIsAuthReady] = useState(false);\
  const [activeView, setActiveView] = useState('chat'); // 'chat' or 'docs-inventory'\
  const [backendStatus, setBackendStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected'\
  const [uploadingDoc, setUploadingDoc] = useState(false);\
  const [docUploadMessage, setDocUploadMessage] = useState(''); // Changed to useState for proper state management\
  const [docSearchTerm, setDocSearchTerm] = useState('');\
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');\
  const [videoSearchTerm, setVideoSearchTerm] = useState(''); // State for video search\
\
  const messagesEndRef = useRef(null);\
\
  const BACKEND_URL = 'http://localhost:5000'; // Define backend URL for consistent use\
\
  // Initialize Firebase and Auth\
  useEffect(() => \{\
    try \{\
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : \{\};\
      const app = initializeApp(firebaseConfig);\
      const firestoreDb = getFirestore(app);\
      const firebaseAuth = getAuth(app);\
\
      setDb(firestoreDb);\
      setAuth(firebaseAuth);\
\
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => \{\
        if (user) \{\
          setUserId(user.uid);\
          // Conceptual: In a real app, fetch user role from a backend user profile service\
          setUserRole(user.uid.startsWith('admin') ? 'Admin' : 'Technician'); // Example role assignment\
        \} else \{\
          try \{\
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;\
            if (initialAuthToken) \{\
              await signInWithCustomToken(firebaseAuth, initialAuthToken);\
            \} else \{\
              await signInAnonymously(firebaseAuth);\
            \}\
          \} catch (error) \{\
            console.error("Firebase Auth Error:", error);\
          \}\
        \}\
        setIsAuthReady(true); // Auth state is ready\
      \});\
\
      return () => unsubscribe(); // Cleanup auth listener\
    \} catch (error) \{\
      console.error("Failed to initialize Firebase:", error);\
    \}\
  \}, []);\
\
  // Listen for chat history changes from Firestore\
  useEffect(() => \{\
    if (db && userId && isAuthReady) \{\
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';\
      const q = query(\
        collection(db, `artifacts/$\{appId\}/users/$\{userId\}/chatMessages`),\
        orderBy('timestamp', 'asc')\
      );\
\
      const unsubscribe = onSnapshot(q, (snapshot) => \{\
        const messages = snapshot.docs.map(doc => (\{ id: doc.id, ...doc.data() \}));\
        setChatHistory(messages);\
      \}, (error) => \{\
        console.error("Error fetching chat messages:", error);\
      \});\
\
      return () => unsubscribe(); // Cleanup snapshot listener\
    \}\
  \}, [db, userId, isAuthReady]);\
\
  // Check backend status\
  useEffect(() => \{\
    const checkBackend = async () => \{\
      try \{\
        const response = await fetch(`$\{BACKEND_URL\}/status`); // Use defined BACKEND_URL\
        if (response.ok) \{\
          setBackendStatus('connected');\
        \} else \{\
          setBackendStatus('disconnected');\
        \}\
      \} catch (error) \{\
        setBackendStatus('disconnected');\
      \}\
    \};\
    checkBackend();\
    const interval = setInterval(checkBackend, 5000); // Check every 5 seconds\
    return () => clearInterval(interval);\
  \}, []);\
\
\
  // Scroll to the latest message\
  useEffect(() => \{\
    messagesEndRef.current?.scrollIntoView(\{ behavior: 'smooth' \});\
  \}, [chatHistory]);\
\
  const handleSendMessage = async (queryOverride = null) => \{\
    const queryToSend = queryOverride || inputText.trim();\
    if (!queryToSend && !imageFile) return;\
    setLoading(true);\
\
    let imageUrlForDisplay = null;\
    if (imageFile) \{\
        imageUrlForDisplay = URL.createObjectURL(imageFile); // Create URL for immediate display\
    \}\
\
    const userMessage = \{\
      role: 'user',\
      text: queryToSend,\
      imageUrl: imageUrlForDisplay, // For displaying in UI\
      timestamp: serverTimestamp()\
    \};\
\
    // Add user message to Firestore\
    if (db && userId) \{\
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';\
      await addDoc(collection(db, `artifacts/$\{appId\}/users/$\{userId\}/chatMessages`), userMessage);\
    \}\
\
    let base64ImageData = null;\
    if (imageFile) \{\
      base64ImageData = await fileToBase64(imageFile);\
    \}\
\
    // Call your local backend API\
    try \{\
      const response = await fetch(`$\{BACKEND_URL\}/chat`, \{ // Use defined BACKEND_URL\
        method: 'POST',\
        headers: \{ 'Content-Type': 'application/json' \},\
        body: JSON.stringify(\{\
          query: queryToSend,\
          image: base64ImageData // Pass base64 image data to backend\
        \})\
      \});\
\
      const result = await response.json();\
      const aiResponseText = result.response || "I'm sorry, I couldn't generate a response from the backend.";\
\
      const aiMessage = \{\
        role: 'model',\
        text: aiResponseText,\
        imageUrl: null, // Backend doesn't generate images for now, only processes them\
        timestamp: serverTimestamp()\
      \};\
\
      // Add AI message to Firestore\
      if (db && userId) \{\
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';\
        await addDoc(collection(db, `artifacts/$\{appId\}/users/$\{userId\}/chatMessages`), aiMessage);\
      \}\
\
    \} catch (error) \{\
      console.error("Error communicating with backend:", error);\
      if (db && userId) \{\
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';\
        await addDoc(collection(db, `artifacts/$\{appId\}/users/$\{userId\}/chatMessages`), \{\
          role: 'model',\
          text: "I apologize, an error occurred while connecting to the AI backend. Please ensure it's running.",\
          timestamp: serverTimestamp()\
        \});\
      \}\
    \} finally \{\
      setInputText('');\
      setImageFile(null); // Clear image file after sending\
      setLoading(false);\
    \}\
  \};\
\
  const handleVoiceInput = () => \{\
    if (!('webkitSpeechRecognition' in window)) \{\
      showMessageBox("Speech recognition is not supported by your browser. Please use Chrome.");\
      return;\
    \}\
\
    const recognition = new window.webkitSpeechRecognition();\
    recognition.continuous = false;\
    recognition.interimResults = false;\
    recognition.lang = 'en-US';\
\
    recognition.onstart = () => \{\
      console.log('Voice recognition started...');\
      setLoading(true);\
    \};\
\
    recognition.onresult = (event) => \{\
      const transcript = event.results[0][0].transcript;\
      setInputText(transcript);\
      console.log('Voice input:', transcript);\
    \};\
\
    recognition.onerror = (event) => \{\
      console.error('Speech recognition error:', event.error);\
      setLoading(false);\
      showMessageBox(`Speech recognition error: $\{event.error\}`);\
    \};\
\
    recognition.onend = () => \{\
      console.log('Voice recognition ended.');\
      setLoading(false);\
      if (inputText.trim()) \{\
        handleSendMessage();\
      \}\
    \};\
\
    recognition.start();\
  \};\
\
  const handleImageUpload = (e) => \{\
    const file = e.target.files[0];\
    if (file) \{\
      setImageFile(file);\
    \}\
  \};\
\
  const handleDocumentUpload = async (e) => \{\
    const file = e.target.files[0];\
    if (!file) return;\
\
    setUploadingDoc(true);\
    setDocUploadMessage('Uploading and processing document...');\
\
    const formData = new FormData();\
    formData.append('file', file);\
\
    try \{\
      const response = await fetch(`$\{BACKEND_URL\}/ingest_document`, \{ // Use defined BACKEND_URL\
        method: 'POST',\
        body: formData,\
      \});\
\
      const result = await response.json();\
      if (response.ok) \{\
        setDocUploadMessage(`Success: $\{result.message\}`);\
      \} else \{\
        setDocUploadMessage(`Error: $\{result.error || 'Failed to upload document.'\}`);\
      \}\
    \} catch (error) \{\
      console.error("Error uploading document:", error);\
      setDocUploadMessage('Error: Could not connect to backend for document upload.');\
    \} finally \{\
      setUploadingDoc(false);\
      setTimeout(() => setDocUploadMessage(''), 5000); // Clear message after 5 seconds\
    \}\
  \};\
\
\
  // Mock data for documents, now more specific to the PDF\
  const mockDocuments = [\
    \{ name: 'AV231_ DEVICE PLACEMENTS 3RD FLOOR PLAN Rev.6 markup (1).pdf', description: 'Detailed floor plan with AV device placements, conduit paths, and general notes for the 3rd floor.' \},\
    \{ name: 'AV-300 Display Elevations.pdf', description: 'Detailed elevations and mounting details for displays.' \},\
    \{ name: 'AV-900 Mounting Details.pdf', description: 'General mounting details for various AV equipment.' \},\
    \{ name: 'Control Room Equipment List.docx', description: 'Inventory of audio, video, and lighting control equipment in the Control Room.' \},\
    \{ name: 'Emergency Exits & Procedures.pdf', description: 'Comprehensive guide for emergency evacuations and safety protocols.' \},\
    \{ name: 'Main Hall Seating Chart.pdf', description: 'Detailed seating plan for the main performance hall, including accessible seating.' \},\
  ];\
\
  const emergencyProtocols = [\
    \{ title: 'Fire Evacuation', content: 'Follow marked exit routes, proceed to assembly points, do not use elevators.' \},\
    \{ title: 'Medical Emergency', content: 'Call 911, notify nearest staff, provide first aid if trained, secure area.' \},\
    \{ title: 'Power Outage', content: 'Remain calm, wait for instructions, emergency lighting will activate.' \},\
    \{ title: 'Security Threat', content: 'Run, Hide, Fight. Follow instructions from security personnel or law enforcement.' \},\
  ];\
\
  const mockTrainingDocuments = [\
    \{ name: 'Stage Lighting Basics.pdf', description: 'Beginner guide to theatrical lighting equipment and techniques.' \},\
    \{ name: 'Sound System Operation Manual.pdf', description: 'Detailed manual for operating the main hall sound console.' \},\
    \{ name: 'Venue Safety Procedures.pdf', description: 'General safety guidelines for all staff and performers.' \},\
    \{ name: 'Ticketing System Training.docx', description: 'Guide for front-of-house staff on using the ticketing software.' \},\
  ];\
\
  const mockInventoryLists = [\
    \{ name: 'Microphone Inventory.xlsx', description: 'List of all microphones, types, and their current locations.' \},\
    \{ name: 'Lighting Fixture Inventory.xlsx', description: 'Detailed list of all stage lighting fixtures, including wattage and lamp type.' \},\
    \{ name: 'Tool & Equipment Checkout.xlsx', description: 'Log for tools and equipment checked out by technicians.' \},\
    \{ name: 'Spare Parts Inventory.xlsx', description: 'List of spare parts for common AV and stage equipment.' \},\
  ];\
\
  const mockTrainingVideos = [\
    \{ name: 'Introduction to DMX Lighting', description: 'A beginner\\'s guide to DMX control for stage lighting.', type: 'Lighting', url: 'https://www.youtube.com/embed/videoseries?list=PL_example_lighting_playlist' \}, // Example Playlist URL\
    \{ name: 'Mixing Live Vocals', description: 'Techniques for achieving clear and powerful live vocal mixes.', type: 'Audio', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' \}, // Example Single Video URL\
    \{ name: 'Rigging Safety Best Practices', description: 'Essential safety procedures for stage rigging and flying.', type: 'Rigging', url: 'https://www.youtube.com/embed/videoseries?list=PL_example_rigging_playlist' \},\
    \{ name: 'Basic Soundboard Setup', description: 'Step-by-step guide to setting up a digital soundboard for small events.', type: 'Audio', url: 'https://www.youtube.com/embed/another_video_id' \},\
    \{ name: 'LED Wall Calibration', description: 'How to calibrate and maintain large LED video walls.', type: 'Video', url: 'https://www.youtube.com/embed/yet_another_video_id' \},\
    \{ name: 'Advanced Stage Lighting Design', description: 'Concepts and tools for complex lighting designs.', type: 'Lighting', url: 'https://www.youtube.com/embed/final_video_id' \},\
  ];\
\
  const filteredTrainingDocuments = mockTrainingDocuments.filter(doc =>\
    doc.name.toLowerCase().includes(docSearchTerm.toLowerCase()) ||\
    doc.description.toLowerCase().includes(docSearchTerm.toLowerCase())\
  );\
\
  const filteredInventoryLists = mockInventoryLists.filter(item =>\
    item.name.toLowerCase().includes(inventorySearchTerm.toLowerCase()) ||\
    item.description.toLowerCase().includes(inventorySearchTerm.toLowerCase())\
  );\
\
  const filteredTrainingVideos = mockTrainingVideos.filter(video =>\
    video.name.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||\
    video.description.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||\
    video.type.toLowerCase().includes(videoSearchTerm.toLowerCase())\
  );\
\
  // Group videos by type\
  const groupedVideos = filteredTrainingVideos.reduce((acc, video) => \{\
    acc[video.type] = acc[video.type] || [];\
    acc[video.type].push(video);\
    return acc;\
  \}, \{\});\
\
\
  const commonQueries = [\
    \{ text: "What are the power requirements for a TV location?", icon: <Lightbulb className="h-5 w-5" /> \},\
    \{ text: "Tell me about the Control Room equipment.", icon: <Info className="h-5 w-5" /> \},\
    \{ text: "Summarize emergency evacuation procedures.", icon: <AlertTriangle className="h-5 w-5" /> \},\
    \{ text: "Where is TV-321 located?", icon: <MapPin className="h-5 w-5" /> \},\
  ];\
\
\
  // Custom Message Box Implementation (replaces alert)\
  const showMessageBox = (message) => \{\
      let messageBox = document.getElementById('customMessageBox');\
      if (!messageBox) \{\
          messageBox = document.createElement('div');\
          messageBox.id = 'customMessageBox';\
          messageBox.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4';\
          messageBox.innerHTML = `\
              <div class="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center transform transition-all duration-300 scale-95 opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100">\
                  <p id="messageBoxContent" class="text-lg font-semibold text-gray-800 mb-4"></p>\
                  <button id="messageBoxClose" class="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200">Close</button>\
              </div>\
          `;\
          document.body.appendChild(messageBox);\
          document.getElementById('messageBoxClose').addEventListener('click', () => \{\
              messageBox.classList.add('opacity-0', 'scale-95');\
              messageBox.addEventListener('transitionend', () => messageBox.classList.add('hidden'), \{ once: true \});\
          \});\
      \}\
      document.getElementById('messageBoxContent').textContent = message;\
      messageBox.classList.remove('hidden');\
      setTimeout(() => \{ // Animate in\
          messageBox.querySelector('div').classList.remove('opacity-0', 'scale-95');\
          messageBox.querySelector('div').classList.add('opacity-100', 'scale-100');\
      \}, 10);\
  \};\
\
  // Helper function to render message content, including RAG context\
  const renderMessageContent = (message) => \{\
    // For user messages, display text and optionally the uploaded image\
    if (message.role === 'user') \{\
      return (\
        <>\
          \{message.text && <p className="text-sm leading-relaxed">\{message.text\}</p>\}\
          \{message.imageUrl && (\
            <img\
              src=\{message.imageUrl\}\
              alt="User Upload"\
              className="mt-2 rounded-lg max-w-full h-auto shadow-sm"\
              onError=\{(e) => \{ e.target.onerror = null; e.target.src = `https://placehold.co/200x150/cccccc/333333?text=Image+Error`; \}\}\
            />\
          )\}\
        </>\
      );\
    \}\
\
    // For AI messages, parse and display RAG context if present\
    if (message.role === 'model') \{\
      // Regex to split the message into parts, identifying RAG chunks by "Source: ... Content:"\
      // The (?:...) creates a non-capturing group for the split pattern itself\
      const parts = message.text.split(/(Source: .*?\\nContent:)/s);\
      const elements = [];\
      let currentTextBuffer = ''; // Buffer for non-RAG text\
\
      parts.forEach((part, index) => \{\
        if (part.startsWith('Source:')) \{\
          // This is a RAG chunk. Process the buffered text first.\
          if (currentTextBuffer.trim()) \{\
            elements.push(<p key=\{`ai-text-pre-rag-$\{index\}`\} className="text-sm leading-relaxed mb-2">\{currentTextBuffer.trim()\}</p>);\
            currentTextBuffer = '';\
          \}\
\
          // Extract details from the RAG chunk\
          const lines = part.split('\\n');\
          const sourceLine = lines.find(line => line.startsWith('Source:'));\
          const tagsLine = lines.find(line => line.startsWith('Tags:'));\
          const tablesLineIndex = lines.findIndex(line => line.startsWith('Tables:'));\
          const imagesLine = lines.find(line => line.startsWith('Associated Images:'));\
          const contentLineIndex = lines.findIndex(line => line.startsWith('Content:'));\
\
          const source = sourceLine ? sourceLine.replace('Source:', '').trim() : 'N/A';\
          const tags = tagsLine ? tagsLine.replace('Tags:', '').trim().split(',').map(t => t.trim()) : [];\
          const associatedImages = imagesLine ? imagesLine.replace('Associated Images:', '').trim().split(',').map(img => img.trim()) : [];\
\
          let tableContent = '';\
          if (tablesLineIndex !== -1) \{\
            // Extract table content between "Tables:" and "Content:" or end of chunk\
            const tableLines = lines.slice(tablesLineIndex + 1, contentLineIndex !== -1 ? contentLineIndex : lines.length);\
            tableContent = tableLines.join('\\n').trim();\
          \}\
          \
          let chunkContent = '';\
          if (contentLineIndex !== -1) \{\
            // Extract content after "Content:"\
            chunkContent = lines.slice(contentLineIndex + 1).join('\\n').trim();\
          \}\
\
          elements.push(\
            <div key=\{`rag-chunk-$\{index\}`\} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-sm text-blue-800 shadow-sm">\
                <p className="font-semibold text-blue-900">Source: \{source\}</p>\
                \{tags.length > 0 && (\
                    <p className="text-xs text-blue-700 mt-1">Tags: \{tags.map((tag, i) => (\
                        <span key=\{i\} className="inline-block bg-blue-200 rounded-full px-2 py-0.5 text-xs font-semibold mr-1 mb-1">\{tag\}</span>\
                    ))\}</p>\
                )\}\
                \{tableContent && (\
                    <div className="mt-2 p-2 bg-blue-100 rounded-md overflow-x-auto">\
                        <p className="font-medium text-blue-900">Extracted Table Data:</p>\
                        <pre className="whitespace-pre-wrap text-xs font-mono">\{tableContent\}</pre>\
                    </div>\
                )\}\
                \{associatedImages.length > 0 && (\
                    <div className="mt-2">\
                        <p className="font-medium text-blue-900">Associated Images:</p>\
                        <div className="flex flex-wrap gap-2 mt-1">\
                            \{associatedImages.map((imgPath, i) => (\
                                <img key=\{i\} src=\{`$\{BACKEND_URL\}/$\{imgPath\}`\} alt=\{`Associated $\{i\}`\} className="w-24 h-24 object-cover rounded-md border border-blue-300" onError=\{(e) => \{ e.target.onerror = null; e.target.src="https://placehold.co/96x96/E0F2F7/000000?text=Image+Error"; \}\} />\
                            ))\}\
                        </div>\
                    </div>\
                )\}\
                <p className="mt-2 text-blue-800">\{chunkContent\}</p>\
            </div>\
          );\
        \} else \{\
          // This is regular AI text\
          currentTextBuffer += part;\
        \}\
      \});\
\
      // Add any remaining buffered text\
      if (currentTextBuffer.trim()) \{\
        elements.push(<p key=\{`ai-text-post-rag`\} className="text-sm leading-relaxed">\{currentTextBuffer.trim()\}</p>);\
      \}\
      return elements;\
    \}\
\
    // Default for system/error messages\
    return <p className="text-sm leading-relaxed">\{message.text\}</p>;\
  \};\
\
\
  return (\
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-inter text-gray-800 antialiased">\
      \{/* Sidebar for Documents and Emergency Protocols */\}\
      <div className="w-full md:w-1/4 bg-white p-6 shadow-xl overflow-y-auto flex flex-col rounded-xl m-4 border border-gray-200">\
        <h2 className="text-2xl font-bold text-indigo-800 mb-6 pb-2 border-b border-indigo-100 flex items-center">\
          <BookText className="h-7 w-7 mr-3 text-indigo-600" /> Knowledge Base\
        </h2>\
\
        \{/* User Profile & Backend Status Display */\}\
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg text-sm text-indigo-800 border border-indigo-200 shadow-inner">\
          <div className="flex items-center mb-2">\
            <UserIcon className="h-5 w-5 mr-2 text-indigo-600" />\
            <strong className="font-semibold">User ID:</strong> <span className="break-all ml-1">\{userId || 'Loading...'\}</span>\
          </div>\
          <div className="flex items-center mb-2">\
            <UserIcon className="h-5 w-5 mr-2 text-indigo-600" /> \{/* Reusing UserIcon for role */\}\
            <strong className="font-semibold">Role:</strong> <span className="ml-1">\{userRole\}</span>\
          </div>\
          <div className="flex items-center">\
            <Wifi className=\{`h-5 w-5 mr-2 $\{backendStatus === 'connected' ? 'text-green-500' : backendStatus === 'connecting' ? 'text-yellow-500 animate-pulse' : 'text-red-500'\}`\} />\
            <strong className="font-semibold">Backend:</strong> <span className="ml-1 capitalize">\{backendStatus\}</span>\
          </div>\
        </div>\
\
        \{/* Navigation Tabs */\}\
        <div className="flex mb-6 p-1 bg-gray-100 rounded-lg shadow-inner">\
          <button\
            onClick=\{() => setActiveView('chat')\}\
            className=\{`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center $\{\
              activeView === 'chat' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'\
            \}`\}\
          >\
            <MessageSquare className="h-5 w-5 mr-2" /> Chat\
          </button>\
          <button\
            onClick=\{() => setActiveView('docs-inventory')\}\
            className=\{`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center $\{\
              activeView === 'docs-inventory' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'\
            \}`\}\
          >\
            <Files className="h-5 w-5 mr-2" /> Docs & Inventory\
          </button>\
        </div>\
\
        \{/* Documents Section (always visible in sidebar) */\}\
        <div className="mb-8">\
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">\
            <BookText className="h-6 w-6 mr-2 text-indigo-500" />\
            Referenced Documents (Simulated RAG)\
          </h3>\
          <ul className="space-y-3">\
            \{mockDocuments.map((doc, index) => (\
              <li key=\{index\} className="bg-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-100 transition duration-200 transform hover:scale-[1.01]">\
                <p className="font-medium text-indigo-600">\{doc.name\}</p>\
                <p className="text-sm text-gray-600 mt-1">\{doc.description\}</p>\
              </li>\
            ))\}\
          </ul>\
          <p className="text-sm text-gray-500 mt-4 italic">\
            In a real system, these documents would be indexed for RAG.\
          </p>\
        </div>\
\
        \{/* Emergency Protocols Section (always visible in sidebar) */\}\
        <div>\
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">\
            <AlertTriangle className="h-6 w-6 mr-2 text-red-500" />\
            Emergency Protocols\
          </h3>\
          <div className="space-y-4">\
            \{emergencyProtocols.map((protocol, index) => (\
              <details key=\{index\} className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200 transition duration-200 hover:shadow-md">\
                <summary className="font-semibold text-red-700 cursor-pointer flex items-center">\
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />\
                  \{protocol.title\}\
                </summary>\
                <p className="mt-2 text-sm text-red-600 leading-relaxed">\{protocol.content\}</p>\
              </details>\
            ))\}\
          </div>\
        </div>\
      </div>\
\
      \{/* Main Content Area (conditionally rendered) */\}\
      \{activeView === 'chat' && (\
        <div className="flex-1 flex flex-col bg-white p-6 shadow-xl m-4 rounded-xl border border-gray-200">\
          <h1 className="text-3xl font-extrabold text-center text-indigo-800 mb-6 pb-3 border-b border-indigo-100">\
            Performing Arts Center AI Assistant\
          </h1>\
\
          \{/* Quick Access & Common Queries Section (Brought back) */\}\
          <div className="mb-6 p-6 bg-blue-50 rounded-xl shadow-inner border border-blue-200">\
            <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">\
              <Lightbulb className="h-6 w-6 mr-2 text-blue-500" />\
              Quick Access & Common Queries\
            </h3>\
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">\
              \{commonQueries.map((query, index) => (\
                <button\
                  key=\{index\}\
                  onClick=\{() => handleSendMessage(query.text)\}\
                  className="flex items-center p-3 bg-blue-100 text-blue-800 rounded-lg shadow-sm hover:bg-blue-200 transition duration-200 transform hover:scale-[1.02] text-left"\
                >\
                  \{query.icon\}\
                  <span className="ml-3 font-medium text-sm">\{query.text\}</span>\
                </button>\
              ))\}\
            </div>\
            <p className="text-sm text-blue-600 mt-3 italic leading-relaxed">\
              Click a suggestion to quickly ask the AI.\
            </p>\
          </div>\
\
          \{/* Chat Display Area */\}\
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-xl shadow-inner mb-4 border border-gray-200">\
            \{chatHistory.map((message, index) => (\
              <div\
                key=\{index\}\
                className=\{`flex mb-4 $\{message.role === 'user' ? 'justify-end' : 'justify-start'\}`\}\
              >\
                <div\
                  className=\{`max-w-md p-3 rounded-xl shadow-md $\{\
                    message.role === 'user'\
                      ? 'bg-indigo-600 text-white rounded-br-none'\
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'\
                  \} transition-all duration-300 ease-in-out transform hover:scale-[1.01]`\}\
                >\
                  \{/* Render message content using the helper function */\}\
                  \{renderMessageContent(message)\}\
                  <div className="flex justify-end items-center mt-2 space-x-2">\
                    <span className="block text-xs opacity-75 text-right">\
                      \{message.timestamp ? new Date(message.timestamp.toDate()).toLocaleTimeString() : 'Sending...'\}\
                    </span>\
                    \{message.role === 'model' && (\
                      <>\
                        <button className="text-gray-500 hover:text-green-600 transition-colors"><ThumbsUp className="h-4 w-4" /></button>\
                        <button className="text-gray-500 hover:text-red-600 transition-colors"><ThumbsDown className="h-4 w-4" /></button>\
                      </>\
                    )\}\
                  </div>\
                </div>\
              </div>\
            ))\}\
            \{loading && (\
              <div className="flex justify-start mb-4">\
                <div className="max-w-md p-3 rounded-xl bg-gray-200 text-gray-800 shadow-md animate-pulse">\
                  <p className="text-sm">Typing...</p>\
                </div>\
              </div>\
            )\}\
            <div ref=\{messagesEndRef\} />\
          </div>\
\
          \{/* Input Area */\}\
          <div className="flex items-center p-4 bg-white border-t border-gray-200 rounded-b-xl shadow-lg">\
            <label htmlFor="image-upload" className="cursor-pointer p-3 rounded-full bg-gray-100 hover:bg-gray-200 mr-2 transition duration-200 shadow-sm">\
              <ImageIcon className="h-6 w-6 text-gray-600" />\
              <input\
                id="image-upload"\
                type="file"\
                accept="image/*"\
                className="hidden"\
                onChange=\{handleImageUpload\}\
                disabled=\{loading\}\
              />\
            </label>\
            \{imageFile && (\
              <span className="text-sm text-gray-600 mr-2 flex items-center p-2 bg-gray-100 rounded-lg shadow-sm">\
                \{imageFile.name\}\
                <button\
                  onClick=\{() => setImageFile(null)\}\
                  className="ml-2 text-red-500 hover:text-red-700 transition duration-200"\
                >\
                  <X className="h-4 w-4" />\
                </button>\
              </span>\
            )\}\
            <input\
              type="text"\
              className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 shadow-sm"\
              placeholder="Ask about the performing arts center..."\
              value=\{inputText\}\
              onChange=\{(e) => setInputText(e.target.value)\}\
              onKeyPress=\{(e) => \{\
                if (e.key === 'Enter' && !loading) \{\
                  handleSendMessage();\
                \}\
              \}\}\
              disabled=\{loading\}\
            />\
            <button\
              onClick=\{handleVoiceInput\}\
              className="ml-2 p-3 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"\
              disabled=\{loading\}\
            >\
              <Mic className="h-6 w-6" />\
            </button>\
            <button\
              onClick=\{() => handleSendMessage()\}\
              className="ml-2 p-3 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"\
              disabled=\{loading || (!inputText.trim() && !imageFile)\}\
            >\
              <Send className="h-6 w-6" />\
            </button>\
          </div>\
        </div>\
      )\}\
\
      \{activeView === 'docs-inventory' && (\
        <div className="flex-1 flex flex-col bg-white p-6 shadow-xl m-4 rounded-xl border border-gray-200">\
          <h1 className="text-3xl font-extrabold text-center text-indigo-800 mb-6 pb-3 border-b border-indigo-100">\
            Documents & Inventory\
          </h1>\
\
          \{/* Document Upload Section */\}\
          <div className="mb-8 p-6 bg-purple-50 rounded-xl shadow-inner border border-purple-200">\
            <h3 className="text-xl font-semibold text-purple-700 mb-4 flex items-center">\
              <Upload className="h-6 w-6 mr-2 text-purple-500" />\
              Upload New Documents\
            </h3>\
            <label htmlFor="document-upload" className="cursor-pointer flex items-center justify-center p-3 border-2 border-purple-400 border-dashed rounded-lg text-purple-600 hover:bg-purple-100 transition duration-200">\
              <Upload className="h-5 w-5 mr-2" />\
              \{uploadingDoc ? 'Uploading...' : 'Click to select document for upload'\}\
              <input\
                id="document-upload"\
                type="file"\
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.json,image/jpeg,image/jpg,image/png,image/gif,image/bmp,image/tiff,.tif,.dxf"\
                className="hidden"\
                onChange=\{handleDocumentUpload\}\
                disabled=\{uploadingDoc\}\
              />\
            </label>\
            \{docUploadMessage && (\
              <p className=\{`mt-3 text-sm font-medium $\{docUploadMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'\}`\}>\
                \{docUploadMessage\}\
              </p>\
            )\}\
            <p className="text-sm text-purple-600 mt-3 italic">\
              Supported formats: PDF, Word, Excel, PowerPoint, Text, Markdown, JSON, common image types, and DXF.\
              Uploaded documents will be processed by the backend for RAG.\
            </p>\
          </div>\
\
          \{/* Training Documents Section */\}\
          <div className="mb-8">\
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">\
              <BookText className="h-6 w-6 mr-2 text-emerald-500" />\
              Training Documents\
            </h3>\
            <div className="relative mb-4">\
              <input\
                type="text"\
                placeholder="Search training documents..."\
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-200"\
                value=\{docSearchTerm\}\
                onChange=\{(e) => setDocSearchTerm(e.target.value)\}\
              />\
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />\
            </div>\
            <ul className="space-y-3">\
              \{filteredTrainingDocuments.length > 0 ? (\
                filteredTrainingDocuments.map((doc, index) => (\
                  <li key=\{index\} className="bg-emerald-50 p-3 rounded-lg shadow-sm border border-emerald-100 hover:bg-emerald-100 transition duration-200 transform hover:scale-[1.01]">\
                    <p className="font-medium text-emerald-700">\{doc.name\}</p>\
                    <p className="text-sm text-emerald-600 mt-1">\{doc.description\}</p>\
                  </li>\
                ))\
              ) : (\
                <li className="text-gray-500 italic p-3">No training documents found matching your search.</li>\
              )\}\
            </ul>\
          </div>\
\
          \{/* Training Videos Section (Moved back here) */\}\
          <div className="mb-8">\
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">\
              <Video className="h-6 w-6 mr-2 text-orange-500" />\
              Training Videos\
            </h3>\
            <div className="relative mb-4">\
              <input\
                type="text"\
                placeholder="Search training videos..."\
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"\
                value=\{videoSearchTerm\}\
                onChange=\{(e) => setVideoSearchTerm(e.target.value)\}\
              />\
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />\
            </div>\
            \{Object.keys(groupedVideos).length > 0 ? (\
              Object.keys(groupedVideos).map(type => (\
                <div key=\{type\} className="mb-6 last:mb-0">\
                  <h4 className="text-lg font-bold text-orange-700 mb-3 border-b border-orange-200 pb-1">\{type\}</h4>\
                  <ul className="space-y-3">\
                    \{groupedVideos[type].map((video, index) => (\
                      <li key=\{index\} className="bg-orange-50 p-3 rounded-lg shadow-sm border border-orange-100 hover:bg-orange-100 transition duration-200 transform hover:scale-[1.01]">\
                        <p className="font-medium text-orange-700">\{video.name\}</p>\
                        <p className="text-sm text-orange-600 mt-1">\{video.description\}</p>\
                        \{video.url && (\
                          <a href=\{video.url\} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:underline mt-2">\
                            <Youtube className="h-4 w-4 mr-1" /> Watch Video\
                          </a>\
                        )\}\
                      </li>\
                    ))\}\
                  </ul>\
                </div>\
              ))\
            ) : (\
              <p className="text-gray-500 italic p-3">No training videos found matching your search criteria.</p>\
            )\}\
          </div>\
\
          \{/* Floor Plans Section (re-using the map placeholder) */\}\
          <div className="mb-8 p-6 bg-blue-50 rounded-xl shadow-inner border border-blue-200">\
            <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">\
              <MapPin className="h-6 w-6 mr-2 text-blue-500" />\
              Floor Plans & Layouts\
            </h3>\
            <div className="w-full h-48 bg-blue-100 rounded-lg flex items-center justify-center text-blue-400 text-lg italic border border-blue-200 relative overflow-hidden shadow-md">\
              \{/* Conceptual SVG for visual representation */\}\
              <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full">\
                  <rect x="50" y="50" width="700" height="300" fill="#cbe8f9" stroke="#90cdf4" strokeWidth="2" rx="8" ry="8" /> \{/* Main Building Outline */\}\
                  <rect x="100" y="100" width="300" height="200" fill="#e0f2fe" stroke="#60a5fa" strokeWidth="2" rx="4" ry="4" className="cursor-pointer hover:fill-blue-200 transition-colors duration-200" onClick=\{() => showMessageBox('Simulated: Details for Main Hall seating and stage dimensions would be shown here, pulled from relevant documents.')\}/>\
                  <text x="250" y="200" textAnchor="middle" fontSize="20" fill="#2563eb" className="pointer-events-none">Main Hall</text>\
\
                  <rect x="450" y="100" width="150" height="80" fill="#e0f2fe" stroke="#60a5fa" strokeWidth="2" rx="4" ry="4" className="cursor-pointer hover:fill-blue-200 transition-colors duration-200" onClick=\{() => showMessageBox('Simulated: Details for Control Room equipment and wiring diagrams (from AV231 PDF) would appear.')\}/>\
                  <text x="525" y="140" textAnchor="middle" fontSize="16" fill="#2563eb" className="pointer-events-none">Control Room</text>\
\
                  <rect x="650" y="100" width="80" height="80" fill="#a7f3d0" stroke="#059669" strokeWidth="2" rx="4" ry="4" className="cursor-pointer hover:fill-green-200 transition-colors duration-200" onClick=\{() => showMessageBox('Simulated: Emergency exit routes and procedures would be highlighted.')\}/>\
                  <text x="690" y="140" textAnchor="middle" fontSize="14" fill="#059669" className="pointer-events-none">Exit</text>\
\
                  <rect x="450" y="220" width="100" height="80" fill="#e0f2fe" stroke="#60a5fa" strokeWidth="2" rx="4" ry="4" className="cursor-pointer hover:fill-blue-200 transition-colors duration-200" onClick=\{() => showMessageBox('Simulated: Details for dressing room facilities and capacity.')\}/>\
                  <text x="500" y="260" textAnchor="middle" fontSize="14" fill="#2563eb" className="pointer-events-none">Dressing Rooms</text>\
              </svg>\
              <p className="absolute bottom-2 text-xs text-blue-800">\
                  <em>Click on areas for simulated details (e.g., "Main Hall" or "Control Room").</em>\
              </p>\
            </div>\
            <p className="text-sm text-blue-600 mt-3 italic leading-relaxed">\
              This interactive map provides a conceptual overview. A full implementation would use detailed SVG/image overlays with clickable zones linked to specific data points from your documents.\
            </p>\
          </div>\
\
          \{/* Inventory Lists Section */\}\
          <div>\
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">\
              <Files className="h-6 w-6 mr-2 text-purple-500" />\
              Inventory Lists\
            </h3>\
            <div className="relative mb-4">\
              <input\
                type="text"\
                placeholder="Search inventory lists..."\
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"\
                value=\{inventorySearchTerm\}\
                onChange=\{(e) => setInventorySearchTerm(e.target.value)\}\
              />\
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />\
            </div>\
            <ul className="space-y-3">\
              \{filteredInventoryLists.length > 0 ? (\
                filteredInventoryLists.map((item, index) => (\
                  <li key=\{index\} className="bg-purple-50 p-3 rounded-lg shadow-sm border border-purple-100 hover:bg-purple-100 transition duration-200 transform hover:scale-[1.01]">\
                    <p className="font-medium text-purple-700">\{item.name\}</p>\
                    <p className="text-sm text-purple-600 mt-1">\{item.description\}</p>\
                  </li>\
                ))\
              ) : (\
                <li className="text-gray-500 italic p-3">No inventory items found matching your search.</li>\
              )\}\
            </ul>\
          </div>\
        </div>\
      )\}\
    </div>\
  );\
\}\
\
export default App;\
}