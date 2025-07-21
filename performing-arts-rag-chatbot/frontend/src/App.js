{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red202\green202\blue202;\red23\green24\blue24;\red183\green111\blue247;
\red54\green192\blue160;\red212\green212\blue212;\red113\green192\blue131;\red109\green115\blue120;\red246\green124\blue48;
}
{\*\expandedcolortbl;;\cssrgb\c83137\c83137\c83137;\cssrgb\c11765\c12157\c12549;\cssrgb\c77255\c54118\c97647;
\cssrgb\c23922\c78824\c69020;\cssrgb\c86275\c86275\c86275;\cssrgb\c50588\c78824\c58431;\cssrgb\c50196\c52549\c54510;\cssrgb\c98039\c56471\c24314;
}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs28 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 React\cf6 \cb3 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  useState\cf6 \strokec6 ,\cf2 \strokec2  useEffect\cf6 \strokec6 ,\cf2 \strokec2  useContext\cf6 \strokec6 ,\cf2 \strokec2  useRef \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 'react'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  \cf5 \cb3 \strokec5 RagContext\cf2 \cb3 \strokec2  \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 './RagContext.js'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 AdminDashboard\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 './AdminDashboard.js'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  collection\cf6 \strokec6 ,\cf2 \strokec2  addDoc\cf6 \strokec6 ,\cf2 \strokec2  serverTimestamp\cf6 \strokec6 ,\cf2 \strokec2  query\cf6 \strokec6 ,\cf2 \strokec2  orderBy\cf6 \strokec6 ,\cf2 \strokec2  onSnapshot \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 'firebase/firestore'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\
\cb3     \cf8 \strokec8 /**\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf8 \cb3 \strokec8      * App component is the main entry point for the RAG application.\cf2 \cb1 \strokec2 \
\cf8 \cb3 \strokec8      * It handles the chat interface, document uploads, and conditionally renders the Admin Dashboard.\cf2 \cb1 \strokec2 \
\cf8 \cb3 \strokec8      */\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3     \cf4 \cb3 \strokec4 export\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 default\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 function\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 App\cf6 \cb3 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  db\cf6 \strokec6 ,\cf2 \strokec2  userId\cf6 \strokec6 ,\cf2 \strokec2  isAdmin\cf6 \strokec6 ,\cf2 \strokec2  authToken\cf6 \strokec6 ,\cf2 \strokec2  appId\cf6 \strokec6 ,\cf2 \strokec2  isAuthReady\cf6 \strokec6 ,\cf2 \strokec2  backendStatus \cf6 \strokec6 \}\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useContext\cf6 \strokec6 (\cf5 \cb3 \strokec5 RagContext\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 queryInput\cf6 \strokec6 ,\cf2 \strokec2  setQueryInput\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf7 \strokec7 ''\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 chatHistory\cf6 \strokec6 ,\cf2 \strokec2  setChatHistory\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 ([]);\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 isLoading\cf6 \strokec6 ,\cf2 \strokec2  setIsLoading\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 uploadMessage\cf6 \strokec6 ,\cf2 \strokec2  setUploadMessage\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf7 \strokec7 ''\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 selectedFile\cf6 \strokec6 ,\cf2 \strokec2  setSelectedFile\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  chatHistoryRef \cf6 \strokec6 =\cf2 \strokec2  useRef\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // Determine backend health status\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  backendHealthy \cf6 \strokec6 =\cf2 \strokec2  backendStatus\cf6 \strokec6 .\cf2 \strokec2 includes\cf6 \strokec6 (\cf7 \strokec7 'healthy'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Firestore Chat History Listener ---\cf2 \cb1 \strokec2 \
\cb3       useEffect\cf6 \strokec6 (()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf8 \strokec8 // Ensure Firebase is ready and userId is available before setting up listener\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 db \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 userId \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 isAuthReady\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setChatHistory\cf6 \strokec6 ([]);\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         \cf8 \strokec8 // Define the collection path for the user's chat history\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  chatCollectionRef \cf6 \strokec6 =\cf2 \strokec2  collection\cf6 \strokec6 (\cf2 \strokec2 db\cf6 \strokec6 ,\cf2 \strokec2  \cf7 \strokec7 `artifacts/\cf6 \strokec6 $\{\cf2 \strokec2 appId\cf6 \strokec6 \}\cf7 \strokec7 /users/\cf6 \strokec6 $\{\cf2 \strokec2 userId\cf6 \strokec6 \}\cf7 \strokec7 /chatHistory`\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf8 \strokec8 // Order by timestamp to display messages chronologically\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  q \cf6 \strokec6 =\cf2 \strokec2  query\cf6 \strokec6 (\cf2 \strokec2 chatCollectionRef\cf6 \strokec6 ,\cf2 \strokec2  orderBy\cf6 \strokec6 (\cf7 \strokec7 'timestamp'\cf6 \strokec6 ));\cf2 \cb1 \strokec2 \
\
\cb3         \cf8 \strokec8 // Set up real-time listener for chat history\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  unsubscribe \cf6 \strokec6 =\cf2 \strokec2  onSnapshot\cf6 \strokec6 (\cf2 \strokec2 q\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 snapshot\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  history \cf6 \strokec6 =\cf2 \strokec2  snapshot\cf6 \strokec6 .\cf2 \strokec2 docs\cf6 \strokec6 .\cf2 \strokec2 map\cf6 \strokec6 (\cf2 \strokec2 doc \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 (\{\cf2 \cb1 \strokec2 \
\cb3             id\cf6 \strokec6 :\cf2 \strokec2  doc\cf6 \strokec6 .\cf2 \strokec2 id\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 ...\cf2 \strokec2 doc\cf6 \strokec6 .\cf2 \strokec2 data\cf6 \strokec6 ()\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}));\cf2 \cb1 \strokec2 \
\cb3           setChatHistory\cf6 \strokec6 (\cf2 \strokec2 history\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error fetching chat history:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  unsubscribe\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 db\cf6 \strokec6 ,\cf2 \strokec2  userId\cf6 \strokec6 ,\cf2 \strokec2  appId\cf6 \strokec6 ,\cf2 \strokec2  isAuthReady\cf6 \strokec6 ]);\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Scroll to bottom of chat history ---\cf2 \cb1 \strokec2 \
\cb3       useEffect\cf6 \strokec6 (()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 chatHistoryRef\cf6 \strokec6 .\cf2 \strokec2 current\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           chatHistoryRef\cf6 \strokec6 .\cf2 \strokec2 current\cf6 \strokec6 .\cf2 \strokec2 scrollTop \cf6 \strokec6 =\cf2 \strokec2  chatHistoryRef\cf6 \strokec6 .\cf2 \strokec2 current\cf6 \strokec6 .\cf2 \strokec2 scrollHeight\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 chatHistory\cf6 \strokec6 ]);\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Handle Query Submission ---\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  handleQuerySubmit \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 e\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         e\cf6 \strokec6 .\cf2 \strokec2 preventDefault\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 queryInput\cf6 \strokec6 .\cf2 \strokec2 trim\cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 ||\cf2 \strokec2  isLoading\cf6 \strokec6 )\cf2 \strokec2  \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           alert\cf6 \strokec6 (\cf7 \strokec7 'Backend is not healthy. Please ensure the backend server is running and accessible.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         setIsLoading\cf6 \strokec6 (\cf4 \cb3 \strokec4 true\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  userQuery \cf6 \strokec6 =\cf2 \strokec2  queryInput\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         setQueryInput\cf6 \strokec6 (\cf7 \strokec7 ''\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3         \cf8 \strokec8 // Add user's query to chat history in Firestore\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  newChatEntry \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'rag_query'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           role\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'user'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           content\cf6 \strokec6 :\cf2 \strokec2  userQuery\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           timestamp\cf6 \strokec6 :\cf2 \strokec2  serverTimestamp\cf6 \strokec6 ()\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 db \cf6 \strokec6 &&\cf2 \strokec2  userId\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  addDoc\cf6 \strokec6 (\cf2 \strokec2 collection\cf6 \strokec6 (\cf2 \strokec2 db\cf6 \strokec6 ,\cf2 \strokec2  \cf7 \strokec7 `artifacts/\cf6 \strokec6 $\{\cf2 \strokec2 appId\cf6 \strokec6 \}\cf7 \strokec7 /users/\cf6 \strokec6 $\{\cf2 \strokec2 userId\cf6 \strokec6 \}\cf7 \strokec7 /chatHistory`\cf6 \strokec6 ),\cf2 \strokec2  newChatEntry\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error saving user query to Firestore:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  response \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  fetch\cf6 \strokec6 (\cf7 \strokec7 '/api/ask'\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             method\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'POST'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             headers\cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf7 \strokec7 'Content-Type'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'application/json'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3               \cf7 \strokec7 'Authorization'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 `Bearer \cf6 \strokec6 $\{\cf2 \strokec2 authToken\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \},\cf2 \cb1 \strokec2 \
\cb3             body\cf6 \strokec6 :\cf2 \strokec2  \cf5 \cb3 \strokec5 JSON\cf6 \cb3 \strokec6 .\cf2 \strokec2 stringify\cf6 \strokec6 (\{\cf2 \cb1 \strokec2 \
\cb3               query\cf6 \strokec6 :\cf2 \strokec2  userQuery\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3               chatHistory\cf6 \strokec6 :\cf2 \strokec2  chatHistory\cf6 \strokec6 .\cf2 \strokec2 filter\cf6 \strokec6 (\cf2 \strokec2 msg \cf6 \strokec6 =>\cf2 \strokec2  msg\cf6 \strokec6 .\cf4 \cb3 \strokec4 type\cf2 \cb3 \strokec2  \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'rag_query'\cf6 \strokec6 ).\cf2 \strokec2 map\cf6 \strokec6 (\cf2 \strokec2 msg \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 (\{\cf2 \strokec2  role\cf6 \strokec6 :\cf2 \strokec2  msg\cf6 \strokec6 .\cf2 \strokec2 role\cf6 \strokec6 ,\cf2 \strokec2  content\cf6 \strokec6 :\cf2 \strokec2  msg\cf6 \strokec6 .\cf2 \strokec2 content \cf6 \strokec6 \}))\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}),\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 response\cf6 \strokec6 .\cf2 \strokec2 ok\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  errorData \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 throw\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Error\cf6 \cb3 \strokec6 (\cf7 \strokec7 `Backend error: \cf6 \strokec6 $\{\cf2 \strokec2 errorData\cf6 \strokec6 .\cf2 \strokec2 error \cf6 \strokec6 ||\cf2 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 statusText\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  data \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  botResponse \cf6 \strokec6 =\cf2 \strokec2  data\cf6 \strokec6 .\cf2 \strokec2 response\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\
\cb3           \cf8 \strokec8 // Add bot's response to chat history in Firestore\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  newBotEntry \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'rag_query'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             role\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'bot'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             content\cf6 \strokec6 :\cf2 \strokec2  botResponse\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             timestamp\cf6 \strokec6 :\cf2 \strokec2  serverTimestamp\cf6 \strokec6 ()\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 db \cf6 \strokec6 &&\cf2 \strokec2  userId\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  addDoc\cf6 \strokec6 (\cf2 \strokec2 collection\cf6 \strokec6 (\cf2 \strokec2 db\cf6 \strokec6 ,\cf2 \strokec2  \cf7 \strokec7 `artifacts/\cf6 \strokec6 $\{\cf2 \strokec2 appId\cf6 \strokec6 \}\cf7 \strokec7 /users/\cf6 \strokec6 $\{\cf2 \strokec2 userId\cf6 \strokec6 \}\cf7 \strokec7 /chatHistory`\cf6 \strokec6 ),\cf2 \strokec2  newBotEntry\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error saving bot response to Firestore:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error fetching RAG response:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  errorEntry \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'rag_query'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             role\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'bot'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             content\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 `Error: Could not get a response. \cf6 \strokec6 $\{\cf2 \strokec2 error\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 . Please try again later.`\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             timestamp\cf6 \strokec6 :\cf2 \strokec2  serverTimestamp\cf6 \strokec6 ()\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 db \cf6 \strokec6 &&\cf2 \strokec2  userId\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  addDoc\cf6 \strokec6 (\cf2 \strokec2 collection\cf6 \strokec6 (\cf2 \strokec2 db\cf6 \strokec6 ,\cf2 \strokec2  \cf7 \strokec7 `artifacts/\cf6 \strokec6 $\{\cf2 \strokec2 appId\cf6 \strokec6 \}\cf7 \strokec7 /users/\cf6 \strokec6 $\{\cf2 \strokec2 userId\cf6 \strokec6 \}\cf7 \strokec7 /chatHistory`\cf6 \strokec6 ),\cf2 \strokec2  errorEntry\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 saveError\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error saving error message to Firestore:"\cf6 \strokec6 ,\cf2 \strokec2  saveError\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 finally\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setIsLoading\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Handle Document Upload ---\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  handleFileChange \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 e\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         setSelectedFile\cf6 \strokec6 (\cf2 \strokec2 e\cf6 \strokec6 .\cf2 \strokec2 target\cf6 \strokec6 .\cf2 \strokec2 files\cf6 \strokec6 [\cf9 \cb3 \strokec9 0\cf6 \cb3 \strokec6 ]);\cf2 \cb1 \strokec2 \
\cb3         setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 ''\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  handleDocumentUpload \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 selectedFile\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 'Please select a file to upload.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 'Backend is not healthy. Cannot upload documents.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         setIsLoading\cf6 \strokec6 (\cf4 \cb3 \strokec4 true\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 'Uploading and ingesting document...'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  formData \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 FormData\cf6 \cb3 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3         formData\cf6 \strokec6 .\cf2 \strokec2 append\cf6 \strokec6 (\cf7 \strokec7 'document'\cf6 \strokec6 ,\cf2 \strokec2  selectedFile\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  uploadStartEntry \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'document_upload'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           fileName\cf6 \strokec6 :\cf2 \strokec2  selectedFile\cf6 \strokec6 .\cf2 \strokec2 name\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           status\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'started'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           timestamp\cf6 \strokec6 :\cf2 \strokec2  serverTimestamp\cf6 \strokec6 ()\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 let\cf2 \cb3 \strokec2  docRef \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 db \cf6 \strokec6 &&\cf2 \strokec2  userId\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             docRef \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  addDoc\cf6 \strokec6 (\cf2 \strokec2 collection\cf6 \strokec6 (\cf2 \strokec2 db\cf6 \strokec6 ,\cf2 \strokec2  \cf7 \strokec7 `artifacts/\cf6 \strokec6 $\{\cf2 \strokec2 appId\cf6 \strokec6 \}\cf7 \strokec7 /users/\cf6 \strokec6 $\{\cf2 \strokec2 userId\cf6 \strokec6 \}\cf7 \strokec7 /chatHistory`\cf6 \strokec6 ),\cf2 \strokec2  uploadStartEntry\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error saving upload start status to Firestore:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  response \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  fetch\cf6 \strokec6 (\cf7 \strokec7 '/api/upload-document'\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             method\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'POST'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             headers\cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf7 \strokec7 'Authorization'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 `Bearer \cf6 \strokec6 $\{\cf2 \strokec2 authToken\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \},\cf2 \cb1 \strokec2 \
\cb3             body\cf6 \strokec6 :\cf2 \strokec2  formData\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 response\cf6 \strokec6 .\cf2 \strokec2 ok\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  errorData \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 throw\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Error\cf6 \cb3 \strokec6 (\cf7 \strokec7 `Upload failed: \cf6 \strokec6 $\{\cf2 \strokec2 errorData\cf6 \strokec6 .\cf2 \strokec2 error \cf6 \strokec6 ||\cf2 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 statusText\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  data \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3           setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 `Success: \cf6 \strokec6 $\{\cf2 \strokec2 data\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 docRef\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  docRef\cf6 \strokec6 .\cf2 \strokec2 update\cf6 \strokec6 (\{\cf2 \strokec2  status\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'completed'\cf2 \strokec2  \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error updating upload status in Firestore:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error uploading document:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 `Error: \cf6 \strokec6 $\{\cf2 \strokec2 error\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 docRef\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  docRef\cf6 \strokec6 .\cf2 \strokec2 update\cf6 \strokec6 (\{\cf2 \strokec2  status\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'failed'\cf6 \strokec6 ,\cf2 \strokec2  errorMessage\cf6 \strokec6 :\cf2 \strokec2  error\cf6 \strokec6 .\cf2 \strokec2 message \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error updating upload status to failed in Firestore:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 finally\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setIsLoading\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setSelectedFile\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setTimeout\cf6 \strokec6 (()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 ''\cf6 \strokec6 ),\cf2 \strokec2  \cf9 \cb3 \strokec9 5000\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Handle Default Ingestion ---\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  handleDefaultIngestion \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 isLoading\cf6 \strokec6 )\cf2 \strokec2  \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           alert\cf6 \strokec6 (\cf7 \strokec7 'Backend is not healthy. Cannot trigger default ingestion.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         setIsLoading\cf6 \strokec6 (\cf4 \cb3 \strokec4 true\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 'Triggering default document ingestion...'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  ingestionStartEntry \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'document_upload'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           fileName\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'AV201_ DEVICE LOCATIONS BASEMENT FLOOR PLAN Rev.4 markup (2).pdf'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           status\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'ingestion_started'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           timestamp\cf6 \strokec6 :\cf2 \strokec2  serverTimestamp\cf6 \strokec6 ()\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 let\cf2 \cb3 \strokec2  docRef \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 db \cf6 \strokec6 &&\cf2 \strokec2  userId\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             docRef \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  addDoc\cf6 \strokec6 (\cf2 \strokec2 collection\cf6 \strokec6 (\cf2 \strokec2 db\cf6 \strokec6 ,\cf2 \strokec2  \cf7 \strokec7 `artifacts/\cf6 \strokec6 $\{\cf2 \strokec2 appId\cf6 \strokec6 \}\cf7 \strokec7 /users/\cf6 \strokec6 $\{\cf2 \strokec2 userId\cf6 \strokec6 \}\cf7 \strokec7 /chatHistory`\cf6 \strokec6 ),\cf2 \strokec2  ingestionStartEntry\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error saving default ingestion start status to Firestore:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  response \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  fetch\cf6 \strokec6 (\cf7 \strokec7 '/api/ingest'\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             method\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'POST'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             headers\cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf7 \strokec7 'Authorization'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 `Bearer \cf6 \strokec6 $\{\cf2 \strokec2 authToken\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 response\cf6 \strokec6 .\cf2 \strokec2 ok\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  errorData \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 throw\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Error\cf6 \cb3 \strokec6 (\cf7 \strokec7 `Ingestion failed: \cf6 \strokec6 $\{\cf2 \strokec2 errorData\cf6 \strokec6 .\cf2 \strokec2 error \cf6 \strokec6 ||\cf2 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 statusText\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  data \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3           setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 `Success: \cf6 \strokec6 $\{\cf2 \strokec2 data\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 docRef\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  docRef\cf6 \strokec6 .\cf2 \strokec2 update\cf6 \strokec6 (\{\cf2 \strokec2  status\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'ingestion_completed'\cf2 \strokec2  \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error updating default ingestion status in Firestore:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error triggering default ingestion:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 `Error: \cf6 \strokec6 $\{\cf2 \strokec2 error\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 docRef\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  docRef\cf6 \strokec6 .\cf2 \strokec2 update\cf6 \strokec6 (\{\cf2 \strokec2  status\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'ingestion_failed'\cf6 \strokec6 ,\cf2 \strokec2  errorMessage\cf6 \strokec6 :\cf2 \strokec2  error\cf6 \strokec6 .\cf2 \strokec2 message \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error updating default ingestion status to failed in Firestore:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 finally\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setIsLoading\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setTimeout\cf6 \strokec6 (()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  setUploadMessage\cf6 \strokec6 (\cf7 \strokec7 ''\cf6 \strokec6 ),\cf2 \strokec2  \cf9 \cb3 \strokec9 5000\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Render UI ---\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 isAuthReady\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "flex items-center justify-center min-h-screen bg-gray-100"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "text-xl text-gray-700"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Loading\cf2 \cb3 \strokec2  application\cf6 \strokec6 ...</\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "min-h-screen bg-gray-100 flex flex-col font-inter"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 <\cf2 \strokec2 header className\cf6 \strokec6 =\cf7 \strokec7 "bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-md"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "container mx-auto flex justify-between items-center"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 h1 className\cf6 \strokec6 =\cf7 \strokec7 "text-2xl font-bold"\cf6 \strokec6 >\cf5 \cb3 \strokec5 RAG\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Chatbot\cf6 \cb3 \strokec6 </\cf2 \strokec2 h1\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "text-sm"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf5 \cb3 \strokec5 User\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 ID\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 <\cf2 \strokec2 span className\cf6 \strokec6 =\cf7 \strokec7 "font-mono"\cf6 \strokec6 >\{\cf2 \strokec2 userId \cf6 \strokec6 ||\cf2 \strokec2  \cf7 \strokec7 'N/A'\cf6 \strokec6 \}</\cf2 \strokec2 span\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 \{\cf2 \strokec2 isAdmin \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 <\cf2 \strokec2 span className\cf6 \strokec6 =\cf7 \strokec7 "ml-4 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Admin\cf6 \cb3 \strokec6 </\cf2 \strokec2 span\cf6 \strokec6 >\}\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 </\cf2 \strokec2 header\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\
\cb3           \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\{\cf7 \strokec7 `text-center py-2 text-sm font-semibold \cf6 \strokec6 $\{\cf2 \strokec2 backendHealthy \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 'bg-green-200 text-green-800'\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'bg-red-200 text-red-800'\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 \}>\cf2 \cb1 \strokec2 \
\cb3             \cf5 \cb3 \strokec5 Backend\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Status\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2 backendStatus\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\
\cb3           \cf6 \strokec6 <\cf2 \strokec2 main className\cf6 \strokec6 =\cf7 \strokec7 "flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-4"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "flex-1 bg-white rounded-lg shadow-lg p-6 flex flex-col max-h-[80vh]"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 h2 className\cf6 \strokec6 =\cf7 \strokec7 "text-xl font-bold text-gray-800 mb-4"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Chat\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 with\cf2 \cb3 \strokec2  your \cf5 \cb3 \strokec5 Documents\cf6 \cb3 \strokec6 </\cf2 \strokec2 h2\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 div ref\cf6 \strokec6 =\{\cf2 \strokec2 chatHistoryRef\cf6 \strokec6 \}\cf2 \strokec2  className\cf6 \strokec6 =\cf7 \strokec7 "flex-grow overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 \{\cf2 \strokec2 chatHistory\cf6 \strokec6 .\cf2 \strokec2 length \cf6 \strokec6 ===\cf2 \strokec2  \cf9 \cb3 \strokec9 0\cf2 \cb3 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-gray-500 text-center"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Start\cf2 \cb3 \strokec2  a conversation or upload a document\cf6 \strokec6 !</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                   chatHistory\cf6 \strokec6 .\cf2 \strokec2 map\cf6 \strokec6 ((\cf2 \strokec2 msg\cf6 \strokec6 ,\cf2 \strokec2  index\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 <\cf2 \strokec2 div key\cf6 \strokec6 =\{\cf2 \strokec2 msg\cf6 \strokec6 .\cf2 \strokec2 id \cf6 \strokec6 ||\cf2 \strokec2  index\cf6 \strokec6 \}\cf2 \strokec2  className\cf6 \strokec6 =\{\cf7 \strokec7 `mb-3 p-3 rounded-lg \cf6 \strokec6 $\{\cf2 \cb1 \strokec2 \
\cb3                       msg\cf6 \strokec6 .\cf2 \strokec2 role \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'user'\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 'bg-blue-100 ml-auto text-right'\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'bg-gray-200 mr-auto text-left'\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 \}\cf7 \strokec7  max-w-[80%] break-words`\cf6 \strokec6 \}>\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 \{\cf2 \strokec2 msg\cf6 \strokec6 .\cf4 \cb3 \strokec4 type\cf2 \cb3 \strokec2  \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'rag_query'\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                         <>\cb1 \
\cb3                           \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "font-semibold"\cf6 \strokec6 >\{\cf2 \strokec2 msg\cf6 \strokec6 .\cf2 \strokec2 role \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'user'\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 'You:'\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'Bot:'\cf6 \strokec6 \}</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                           \cf6 \strokec6 <\cf2 \strokec2 p\cf6 \strokec6 >\{\cf2 \strokec2 msg\cf6 \strokec6 .\cf2 \strokec2 content\cf6 \strokec6 \}</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                         </>\cb1 \
\cb3                       \cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "font-semibold text-sm"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                           \cf6 \strokec6 \{\cf2 \strokec2 msg\cf6 \strokec6 .\cf2 \strokec2 fileName \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 `Document: \cf6 \strokec6 $\{\cf2 \strokec2 msg\cf6 \strokec6 .\cf2 \strokec2 fileName\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'Default Ingestion'\cf6 \strokec6 \}\cf2 \strokec2  \cf6 \strokec6 -\cf2 \strokec2  \cf5 \cb3 \strokec5 Status\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2 msg\cf6 \strokec6 .\cf2 \strokec2 status\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                           \cf6 \strokec6 \{\cf2 \strokec2 msg\cf6 \strokec6 .\cf2 \strokec2 errorMessage \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 <\cf2 \strokec2 span className\cf6 \strokec6 =\cf7 \strokec7 "text-red-600"\cf6 \strokec6 >\cf2 \strokec2  \cf6 \strokec6 (\{\cf2 \strokec2 msg\cf6 \strokec6 .\cf2 \strokec2 errorMessage\cf6 \strokec6 \})</\cf2 \strokec2 span\cf6 \strokec6 >\}\cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 </\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-xs text-gray-500 mt-1"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 \{\cf2 \strokec2 msg\cf6 \strokec6 .\cf2 \strokec2 timestamp \cf6 \strokec6 ?\cf2 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Date\cf6 \cb3 \strokec6 (\cf2 \strokec2 msg\cf6 \strokec6 .\cf2 \strokec2 timestamp\cf6 \strokec6 .\cf2 \strokec2 seconds \cf6 \strokec6 *\cf2 \strokec2  \cf9 \cb3 \strokec9 1000\cf6 \cb3 \strokec6 ).\cf2 \strokec2 toLocaleString\cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'Just now'\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 </\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 ))\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 \{\cf2 \strokec2 isLoading \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "text-center text-gray-500 mt-4"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"\cf2 \strokec2 ></div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                     \cf5 \cb3 \strokec5 Thinking\cf6 \cb3 \strokec6 ...\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\
\cb3               \cf6 \strokec6 <\cf2 \strokec2 form onSubmit\cf6 \strokec6 =\{\cf2 \strokec2 handleQuerySubmit\cf6 \strokec6 \}\cf2 \strokec2  className\cf6 \strokec6 =\cf7 \strokec7 "flex gap-2"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 input\cb1 \
\cb3                   \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 =\cf7 \strokec7 "text"\cf2 \cb1 \strokec2 \
\cb3                   value\cf6 \strokec6 =\{\cf2 \strokec2 queryInput\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   onChange\cf6 \strokec6 =\{(\cf2 \strokec2 e\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  setQueryInput\cf6 \strokec6 (\cf2 \strokec2 e\cf6 \strokec6 .\cf2 \strokec2 target\cf6 \strokec6 .\cf2 \strokec2 value\cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3                   placeholder\cf6 \strokec6 =\cf7 \strokec7 "Ask a question about your documents..."\cf2 \cb1 \strokec2 \
\cb3                   className\cf6 \strokec6 =\cf7 \strokec7 "flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"\cf2 \cb1 \strokec2 \
\cb3                   disabled\cf6 \strokec6 =\{\cf2 \strokec2 isLoading \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                 />\cb1 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 button\cb1 \
\cb3                   \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 =\cf7 \strokec7 "submit"\cf2 \cb1 \strokec2 \
\cb3                   className\cf6 \strokec6 =\cf7 \strokec7 "bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300"\cf2 \cb1 \strokec2 \
\cb3                   disabled\cf6 \strokec6 =\{\cf2 \strokec2 isLoading \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf5 \cb3 \strokec5 Ask\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 button\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 </\cf2 \strokec2 form\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\
\cb3               \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 h3 className\cf6 \strokec6 =\cf7 \strokec7 "text-lg font-semibold text-gray-800 mb-3"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Manage\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Documents\cf6 \cb3 \strokec6 </\cf2 \strokec2 h3\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "flex flex-col sm:flex-row gap-3 items-center"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 input\cb1 \
\cb3                     \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 =\cf7 \strokec7 "file"\cf2 \cb1 \strokec2 \
\cb3                     accept\cf6 \strokec6 =\cf7 \strokec7 ".pdf"\cf2 \cb1 \strokec2 \
\cb3                     onChange\cf6 \strokec6 =\{\cf2 \strokec2 handleFileChange\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     className\cf6 \strokec6 =\cf7 \strokec7 "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4\cf2 \cb1 \strokec2 \
\cb3                                file\cf6 \strokec6 :\cf2 \strokec2 rounded\cf6 \strokec6 -\cf2 \strokec2 full file\cf6 \strokec6 :\cf2 \strokec2 border\cf6 \strokec6 -\cf9 \cb3 \strokec9 0\cf2 \cb3 \strokec2  file\cf6 \strokec6 :\cf2 \strokec2 text\cf6 \strokec6 -\cf2 \strokec2 sm file\cf6 \strokec6 :\cf2 \strokec2 font\cf6 \strokec6 -\cf2 \strokec2 semibold\cb1 \
\cb3                                file\cf6 \strokec6 :\cf2 \strokec2 bg\cf6 \strokec6 -\cf2 \strokec2 purple\cf6 \strokec6 -\cf9 \cb3 \strokec9 50\cf2 \cb3 \strokec2  file\cf6 \strokec6 :\cf2 \strokec2 text\cf6 \strokec6 -\cf2 \strokec2 purple\cf6 \strokec6 -\cf9 \cb3 \strokec9 700\cf2 \cb3 \strokec2  hover\cf6 \strokec6 :\cf2 \strokec2 file\cf6 \strokec6 :\cf2 \strokec2 bg\cf6 \strokec6 -\cf2 \strokec2 purple\cf6 \strokec6 -\cf9 \cb3 \strokec9 100\cf7 \cb3 \strokec7 "\cf2 \cb1 \strokec2 \
\cb3                     disabled\cf6 \strokec6 =\{\cf2 \strokec2 isLoading \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   />\cb1 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 button\cb1 \
\cb3                     onClick\cf6 \strokec6 =\{\cf2 \strokec2 handleDocumentUpload\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     disabled\cf6 \strokec6 =\{\cf2 \strokec2 isLoading \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 selectedFile \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     className\cf6 \strokec6 =\cf7 \strokec7 "w-full sm:w-auto bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:bg-purple-300"\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                     \cf5 \cb3 \strokec5 Upload\cf2 \cb3 \strokec2  \cf6 \strokec6 &\cf2 \strokec2  \cf5 \cb3 \strokec5 Ingest\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 PDF\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 </\cf2 \strokec2 button\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 button\cb1 \
\cb3                   onClick\cf6 \strokec6 =\{\cf2 \strokec2 handleDefaultIngestion\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   disabled\cf6 \strokec6 =\{\cf2 \strokec2 isLoading \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   className\cf6 \strokec6 =\cf7 \strokec7 "mt-3 w-full sm:w-auto bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-green-300"\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf5 \cb3 \strokec5 Ingest\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Default\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Document\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 button\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 \{\cf2 \strokec2 uploadMessage \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\{\cf7 \strokec7 `mt-3 text-sm \cf6 \strokec6 $\{\cf2 \strokec2 uploadMessage\cf6 \strokec6 .\cf2 \strokec2 includes\cf6 \strokec6 (\cf7 \strokec7 'Error'\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 'text-red-600'\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'text-green-600'\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 \}>\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 \{\cf2 \strokec2 uploadMessage\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 </\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\
\cb3             \cf6 \strokec6 \{\cf2 \strokec2 isAdmin \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "lg:w-1/2 w-full"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf5 \cb3 \strokec5 AdminDashboard\cf2 \cb3 \strokec2  />\cb1 \
\cb3               \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 </\cf2 \strokec2 main\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3     \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3     \cb1 \
}