{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 Menlo-Regular;}
{\colortbl;\red255\green255\blue255;\red202\green202\blue202;\red23\green24\blue24;\red183\green111\blue247;
\red54\green192\blue160;\red212\green212\blue212;\red113\green192\blue131;\red109\green115\blue120;\red246\green124\blue48;
\red238\green46\blue56;}
{\*\expandedcolortbl;;\cssrgb\c83137\c83137\c83137;\cssrgb\c11765\c12157\c12549;\cssrgb\c77255\c54118\c97647;
\cssrgb\c23922\c78824\c69020;\cssrgb\c86275\c86275\c86275;\cssrgb\c50588\c78824\c58431;\cssrgb\c50196\c52549\c54510;\cssrgb\c98039\c56471\c24314;
\cssrgb\c95686\c27843\c27843;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs28 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 React\cf6 \cb3 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  useState\cf6 \strokec6 ,\cf2 \strokec2  useEffect\cf6 \strokec6 ,\cf2 \strokec2  useContext\cf6 \strokec6 ,\cf2 \strokec2  useCallback \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 'react'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  \cf5 \cb3 \strokec5 RagContext\cf2 \cb3 \strokec2  \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 './RagContext.js'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  collection\cf6 \strokec6 ,\cf2 \strokec2  query\cf6 \strokec6 ,\cf2 \strokec2  onSnapshot\cf6 \strokec6 ,\cf2 \strokec2  deleteDoc\cf6 \strokec6 ,\cf2 \strokec2  doc \cf4 \cb3 \strokec4 as\cf2 \cb3 \strokec2  firestoreDoc \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 'firebase/firestore'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\
\cb3     \cf8 \strokec8 /**\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf8 \cb3 \strokec8      * AdminDashboard component provides functionalities for administrators,\cf2 \cb1 \strokec2 \
\cf8 \cb3 \strokec8      * including listing users, viewing their chat history, managing uploaded documents,\cf2 \cb1 \strokec2 \
\cf8 \cb3 \strokec8      * and tuning RAG parameters.\cf2 \cb1 \strokec2 \
\cf8 \cb3 \strokec8      */\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3     \cf4 \cb3 \strokec4 export\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 default\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 function\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 AdminDashboard\cf6 \cb3 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  userId\cf6 \strokec6 ,\cf2 \strokec2  isAdmin\cf6 \strokec6 ,\cf2 \strokec2  authToken\cf6 \strokec6 ,\cf2 \strokec2  appId\cf6 \strokec6 ,\cf2 \strokec2  db\cf6 \strokec6 ,\cf2 \strokec2  backendStatus \cf6 \strokec6 \}\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useContext\cf6 \strokec6 (\cf5 \cb3 \strokec5 RagContext\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 allUsers\cf6 \strokec6 ,\cf2 \strokec2  setAllUsers\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 ([]);\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 selectedUser\cf6 \strokec6 ,\cf2 \strokec2  setSelectedUser\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 selectedUserChatHistory\cf6 \strokec6 ,\cf2 \strokec2  setSelectedUserChatHistory\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 ([]);\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 adminMessage\cf6 \strokec6 ,\cf2 \strokec2  setAdminMessage\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf7 \strokec7 ''\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 isConfirmModalOpen\cf6 \strokec6 ,\cf2 \strokec2  setIsConfirmModalOpen\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 itemToDelete\cf6 \strokec6 ,\cf2 \strokec2  setItemToDelete\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 uploadedDocuments\cf6 \strokec6 ,\cf2 \strokec2  setUploadedDocuments\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 ([]);\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 ragParams\cf6 \strokec6 ,\cf2 \strokec2  setRagParams\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\{\cf2 \cb1 \strokec2 \
\cb3         chunk_size\cf6 \strokec6 :\cf2 \strokec2  \cf9 \cb3 \strokec9 1000\cf6 \cb3 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         chunk_overlap\cf6 \strokec6 :\cf2 \strokec2  \cf9 \cb3 \strokec9 200\cf6 \cb3 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         retrieval_k\cf6 \strokec6 :\cf2 \strokec2  \cf9 \cb3 \strokec9 4\cf6 \cb3 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         cross_encoder_top_n\cf6 \strokec6 :\cf2 \strokec2  \cf9 \cb3 \strokec9 3\cf6 \cb3 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         llm_temperature\cf6 \strokec6 :\cf2 \strokec2  \cf9 \cb3 \strokec9 0.7\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 isSavingParams\cf6 \strokec6 ,\cf2 \strokec2  setIsSavingParams\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 paramSaveMessage\cf6 \strokec6 ,\cf2 \strokec2  setParamSaveMessage\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf7 \strokec7 ''\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  backendHealthy \cf6 \strokec6 =\cf2 \strokec2  backendStatus\cf6 \strokec6 .\cf2 \strokec2 includes\cf6 \strokec6 (\cf7 \strokec7 'healthy'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Fetch All Users ---\cf2 \cb1 \strokec2 \
\cb3       useEffect\cf6 \strokec6 (()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 isAdmin \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 authToken \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setAllUsers\cf6 \strokec6 ([]);\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 'Backend not healthy. Cannot fetch users.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  fetchAllUsers \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 'Fetching all users...'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  response \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  fetch\cf6 \strokec6 (\cf7 \strokec7 '/api/admin/users'\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               headers\cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3                 \cf7 \strokec7 'Authorization'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 `Bearer \cf6 \strokec6 $\{\cf2 \strokec2 authToken\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 response\cf6 \strokec6 .\cf2 \strokec2 ok\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  errorData \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3               \cf4 \cb3 \strokec4 throw\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Error\cf6 \cb3 \strokec6 (\cf7 \strokec7 `Failed to fetch users: \cf6 \strokec6 $\{\cf2 \strokec2 errorData\cf6 \strokec6 .\cf2 \strokec2 error \cf6 \strokec6 ||\cf2 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 statusText\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  data \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3             setAllUsers\cf6 \strokec6 (\cf2 \strokec2 data\cf6 \strokec6 .\cf2 \strokec2 users\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 'Users loaded.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error fetching all users:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 `Error fetching users: \cf6 \strokec6 $\{\cf2 \strokec2 error\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 . Ensure backend is running and Firebase Admin SDK is configured.`\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3         fetchAllUsers\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 isAdmin\cf6 \strokec6 ,\cf2 \strokec2  authToken\cf6 \strokec6 ,\cf2 \strokec2  backendHealthy\cf6 \strokec6 ]);\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Listen for Selected User's Chat History ---\cf2 \cb1 \strokec2 \
\cb3       useEffect\cf6 \strokec6 (()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 db \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 selectedUser \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 isAdmin\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setSelectedUserChatHistory\cf6 \strokec6 ([]);\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 `Loading chat history for user: \cf6 \strokec6 $\{\cf2 \strokec2 selectedUser\cf6 \strokec6 .\cf2 \strokec2 uid\cf6 \strokec6 \}\cf7 \strokec7 ...`\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  chatCollectionRef \cf6 \strokec6 =\cf2 \strokec2  collection\cf6 \strokec6 (\cf2 \strokec2 db\cf6 \strokec6 ,\cf2 \strokec2  \cf7 \strokec7 `artifacts/\cf6 \strokec6 $\{\cf2 \strokec2 appId\cf6 \strokec6 \}\cf7 \strokec7 /users/\cf6 \strokec6 $\{\cf2 \strokec2 selectedUser\cf6 \strokec6 .\cf2 \strokec2 uid\cf6 \strokec6 \}\cf7 \strokec7 /chatHistory`\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  q \cf6 \strokec6 =\cf2 \strokec2  query\cf6 \strokec6 (\cf2 \strokec2 chatCollectionRef\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  unsubscribeSnapshot \cf6 \strokec6 =\cf2 \strokec2  onSnapshot\cf6 \strokec6 (\cf2 \strokec2 q\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 snapshot\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  history \cf6 \strokec6 =\cf2 \strokec2  snapshot\cf6 \strokec6 .\cf2 \strokec2 docs\cf6 \strokec6 .\cf2 \strokec2 map\cf6 \strokec6 (\cf2 \strokec2 doc \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 (\{\cf2 \cb1 \strokec2 \
\cb3             id\cf6 \strokec6 :\cf2 \strokec2  doc\cf6 \strokec6 .\cf2 \strokec2 id\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 ...\cf2 \strokec2 doc\cf6 \strokec6 .\cf2 \strokec2 data\cf6 \strokec6 ()\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}));\cf2 \cb1 \strokec2 \
\cb3           setSelectedUserChatHistory\cf6 \strokec6 (\cf2 \strokec2 history\cf6 \strokec6 .\cf2 \strokec2 sort\cf6 \strokec6 ((\cf2 \strokec2 a\cf6 \strokec6 ,\cf2 \strokec2  b\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 a\cf6 \strokec6 .\cf2 \strokec2 timestamp\cf6 \strokec6 ?.\cf2 \strokec2 toDate\cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 ||\cf2 \strokec2  \cf9 \cb3 \strokec9 0\cf6 \cb3 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 -\cf2 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 b\cf6 \strokec6 .\cf2 \strokec2 timestamp\cf6 \strokec6 ?.\cf2 \strokec2 toDate\cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 ||\cf2 \strokec2  \cf9 \cb3 \strokec9 0\cf6 \cb3 \strokec6 )));\cf2 \cb1 \strokec2 \
\cb3           setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 `Chat history loaded for user: \cf6 \strokec6 $\{\cf2 \strokec2 selectedUser\cf6 \strokec6 .\cf2 \strokec2 uid\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error fetching selected user's chat history:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 `Error fetching chat history for \cf6 \strokec6 $\{\cf2 \strokec2 selectedUser\cf6 \strokec6 .\cf2 \strokec2 uid\cf6 \strokec6 \}\cf7 \strokec7 : \cf6 \strokec6 $\{\cf2 \strokec2 error\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  unsubscribeSnapshot\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 db\cf6 \strokec6 ,\cf2 \strokec2  selectedUser\cf6 \strokec6 ,\cf2 \strokec2  isAdmin\cf6 \strokec6 ,\cf2 \strokec2  appId\cf6 \strokec6 ]);\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Fetch Uploaded Documents ---\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  fetchUploadedDocuments \cf6 \strokec6 =\cf2 \strokec2  useCallback\cf6 \strokec6 (\cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 isAdmin \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 authToken \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setUploadedDocuments\cf6 \strokec6 ([]);\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 'Backend not healthy. Cannot fetch documents.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 'Fetching uploaded documents...'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  response \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  fetch\cf6 \strokec6 (\cf7 \strokec7 '/api/admin/documents'\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             headers\cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf7 \strokec7 'Authorization'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 `Bearer \cf6 \strokec6 $\{\cf2 \strokec2 authToken\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 response\cf6 \strokec6 .\cf2 \strokec2 ok\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  errorData \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 throw\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Error\cf6 \cb3 \strokec6 (\cf7 \strokec7 `Failed to fetch documents: \cf6 \strokec6 $\{\cf2 \strokec2 errorData\cf6 \strokec6 .\cf2 \strokec2 error \cf6 \strokec6 ||\cf2 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 statusText\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  data \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3           setUploadedDocuments\cf6 \strokec6 (\cf2 \strokec2 data\cf6 \strokec6 .\cf2 \strokec2 documents\cf6 \strokec6 .\cf2 \strokec2 sort\cf6 \strokec6 ((\cf2 \strokec2 a\cf6 \strokec6 ,\cf2 \strokec2  b\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Date\cf6 \cb3 \strokec6 (\cf2 \strokec2 b\cf6 \strokec6 .\cf2 \strokec2 upload_timestamp\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 -\cf2 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Date\cf6 \cb3 \strokec6 (\cf2 \strokec2 a\cf6 \strokec6 .\cf2 \strokec2 upload_timestamp\cf6 \strokec6 )));\cf2 \cb1 \strokec2 \
\cb3           setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 'Uploaded documents loaded.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error fetching uploaded documents:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 `Error fetching documents: \cf6 \strokec6 $\{\cf2 \strokec2 error\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 isAdmin\cf6 \strokec6 ,\cf2 \strokec2  authToken\cf6 \strokec6 ,\cf2 \strokec2  backendHealthy\cf6 \strokec6 ]);\cf2 \cb1 \strokec2 \
\
\cb3       useEffect\cf6 \strokec6 (()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         fetchUploadedDocuments\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 fetchUploadedDocuments\cf6 \strokec6 ]);\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Fetch RAG Parameters ---\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  fetchRagParameters \cf6 \strokec6 =\cf2 \strokec2  useCallback\cf6 \strokec6 (\cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 isAdmin \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 authToken \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setRagParams\cf6 \strokec6 (\{\cf2 \strokec2  chunk_size\cf6 \strokec6 :\cf2 \strokec2  \cf9 \cb3 \strokec9 1000\cf6 \cb3 \strokec6 ,\cf2 \strokec2  chunk_overlap\cf6 \strokec6 :\cf2 \strokec2  \cf9 \cb3 \strokec9 200\cf6 \cb3 \strokec6 ,\cf2 \strokec2  retrieval_k\cf6 \strokec6 :\cf2 \strokec2  \cf9 \cb3 \strokec9 4\cf6 \cb3 \strokec6 ,\cf2 \strokec2  cross_encoder_top_n\cf6 \strokec6 :\cf2 \strokec2  \cf9 \cb3 \strokec9 3\cf6 \cb3 \strokec6 ,\cf2 \strokec2  llm_temperature\cf6 \strokec6 :\cf2 \strokec2  \cf9 \cb3 \strokec9 0.7\cf2 \cb3 \strokec2  \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  setParamSaveMessage\cf6 \strokec6 (\cf7 \strokec7 'Backend not healthy. Cannot load RAG parameters.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setParamSaveMessage\cf6 \strokec6 (\cf7 \strokec7 'Loading RAG parameters...'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  response \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  fetch\cf6 \strokec6 (\cf7 \strokec7 '/api/admin/rag-params'\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             headers\cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf7 \strokec7 'Authorization'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 `Bearer \cf6 \strokec6 $\{\cf2 \strokec2 authToken\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 response\cf6 \strokec6 .\cf2 \strokec2 ok\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  errorData \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 throw\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Error\cf6 \cb3 \strokec6 (\cf7 \strokec7 `Failed to fetch RAG parameters: \cf6 \strokec6 $\{\cf2 \strokec2 errorData\cf6 \strokec6 .\cf2 \strokec2 error \cf6 \strokec6 ||\cf2 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 statusText\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  data \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3           setRagParams\cf6 \strokec6 (\cf2 \strokec2 data\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setParamSaveMessage\cf6 \strokec6 (\cf7 \strokec7 'RAG parameters loaded.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error fetching RAG parameters:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setParamSaveMessage\cf6 \strokec6 (\cf7 \strokec7 `Error loading RAG parameters: \cf6 \strokec6 $\{\cf2 \strokec2 error\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 isAdmin\cf6 \strokec6 ,\cf2 \strokec2  authToken\cf6 \strokec6 ,\cf2 \strokec2  backendHealthy\cf6 \strokec6 ]);\cf2 \cb1 \strokec2 \
\
\cb3       useEffect\cf6 \strokec6 (()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         fetchRagParameters\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 fetchRagParameters\cf6 \strokec6 ]);\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Deletion Logic ---\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  handleDeleteClick \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 (\cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 ,\cf2 \strokec2  id\cf6 \strokec6 ,\cf2 \strokec2  userId \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 'Backend not healthy. Cannot perform deletion.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         setItemToDelete\cf6 \strokec6 (\{\cf2 \strokec2  \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 ,\cf2 \strokec2  id\cf6 \strokec6 ,\cf2 \strokec2  userId \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3         setIsConfirmModalOpen\cf6 \strokec6 (\cf4 \cb3 \strokec4 true\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  confirmDelete \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 itemToDelete\cf6 \strokec6 )\cf2 \strokec2  \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 'Backend not healthy. Cannot perform deletion.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           cancelDelete\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 ,\cf2 \strokec2  id\cf6 \strokec6 ,\cf2 \strokec2  userId\cf6 \strokec6 :\cf2 \strokec2  targetUserId \cf6 \strokec6 \}\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  itemToDelete\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         setIsConfirmModalOpen\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 `Deleting \cf6 \strokec6 $\{\cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 \}\cf7 \strokec7  entry \cf6 \strokec6 $\{\cf2 \strokec2 id\cf6 \strokec6 \}\cf7 \strokec7 ...`\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 let\cf2 \cb3 \strokec2  response\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf4 \cb3 \strokec4 type\cf2 \cb3 \strokec2  \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'chat'\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             response \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  fetch\cf6 \strokec6 (\cf7 \strokec7 `/api/admin/user/\cf6 \strokec6 $\{\cf2 \strokec2 targetUserId\cf6 \strokec6 \}\cf7 \strokec7 /chat-history/\cf6 \strokec6 $\{\cf2 \strokec2 id\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               method\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'DELETE'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3               headers\cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  \cf7 \strokec7 'Authorization'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 `Bearer \cf6 \strokec6 $\{\cf2 \strokec2 authToken\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \strokec2  \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 else\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf4 \cb3 \strokec4 type\cf2 \cb3 \strokec2  \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'doc'\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             response \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  fetch\cf6 \strokec6 (\cf7 \strokec7 `/api/admin/document/\cf6 \strokec6 $\{\cf2 \strokec2 id\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               method\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'DELETE'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3               headers\cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  \cf7 \strokec7 'Authorization'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 `Bearer \cf6 \strokec6 $\{\cf2 \strokec2 authToken\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \strokec2  \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 else\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 throw\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Error\cf6 \cb3 \strokec6 (\cf7 \strokec7 "Unknown item type for deletion."\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 response\cf6 \strokec6 .\cf2 \strokec2 ok\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  errorData \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 throw\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Error\cf6 \cb3 \strokec6 (\cf7 \strokec7 `Failed to delete \cf6 \strokec6 $\{\cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 \}\cf7 \strokec7  entry: \cf6 \strokec6 $\{\cf2 \strokec2 errorData\cf6 \strokec6 .\cf2 \strokec2 error \cf6 \strokec6 ||\cf2 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 statusText\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  result \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3           setAdminMessage\cf6 \strokec6 (\cf2 \strokec2 result\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf4 \cb3 \strokec4 type\cf2 \cb3 \strokec2  \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'doc'\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             fetchUploadedDocuments\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 `Error deleting \cf6 \strokec6 $\{\cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 \}\cf7 \strokec7  entry:`\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setAdminMessage\cf6 \strokec6 (\cf7 \strokec7 `Error deleting \cf6 \strokec6 $\{\cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 \}\cf7 \strokec7  entry: \cf6 \strokec6 $\{\cf2 \strokec2 error\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 finally\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setItemToDelete\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  cancelDelete \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         setIsConfirmModalOpen\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         setItemToDelete\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- RAG Parameter Handlers ---\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  handleParamChange \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 e\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  name\cf6 \strokec6 ,\cf2 \strokec2  value\cf6 \strokec6 ,\cf2 \strokec2  \cf4 \cb3 \strokec4 type\cf2 \cb3 \strokec2  \cf6 \strokec6 \}\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  e\cf6 \strokec6 .\cf2 \strokec2 target\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         setRagParams\cf6 \strokec6 (\cf2 \strokec2 prevParams \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 (\{\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 ...\cf2 \strokec2 prevParams\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 [\cf2 \strokec2 name\cf6 \strokec6 ]:\cf2 \strokec2  \cf4 \cb3 \strokec4 type\cf2 \cb3 \strokec2  \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'number'\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  parseFloat\cf6 \strokec6 (\cf2 \strokec2 value\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  value\cb1 \
\cb3         \cf6 \strokec6 \}));\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  handleSaveRagParams \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 isAdmin \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 authToken \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setParamSaveMessage\cf6 \strokec6 (\cf7 \strokec7 'Backend not healthy. Cannot save RAG parameters.'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 return\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         setIsSavingParams\cf6 \strokec6 (\cf4 \cb3 \strokec4 true\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         setParamSaveMessage\cf6 \strokec6 (\cf7 \strokec7 'Saving RAG parameters...'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  response \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  fetch\cf6 \strokec6 (\cf7 \strokec7 '/api/admin/rag-params'\cf6 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             method\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'POST'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3             headers\cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf7 \strokec7 'Content-Type'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'application/json'\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3               \cf7 \strokec7 'Authorization'\cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 `Bearer \cf6 \strokec6 $\{\cf2 \strokec2 authToken\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \},\cf2 \cb1 \strokec2 \
\cb3             body\cf6 \strokec6 :\cf2 \strokec2  \cf5 \cb3 \strokec5 JSON\cf6 \cb3 \strokec6 .\cf2 \strokec2 stringify\cf6 \strokec6 (\cf2 \strokec2 ragParams\cf6 \strokec6 )\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 response\cf6 \strokec6 .\cf2 \strokec2 ok\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  errorData \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 throw\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Error\cf6 \cb3 \strokec6 (\cf7 \strokec7 `Failed to save RAG parameters: \cf6 \strokec6 $\{\cf2 \strokec2 errorData\cf6 \strokec6 .\cf2 \strokec2 error \cf6 \strokec6 ||\cf2 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 statusText\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  result \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3           setParamSaveMessage\cf6 \strokec6 (\cf2 \strokec2 result\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error saving RAG parameters:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setParamSaveMessage\cf6 \strokec6 (\cf7 \strokec7 `Error saving RAG parameters: \cf6 \strokec6 $\{\cf2 \strokec2 error\cf6 \strokec6 .\cf2 \strokec2 message\cf6 \strokec6 \}\cf7 \strokec7 `\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 finally\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           setIsSavingParams\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (!\cf2 \strokec2 isAdmin\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "p-8 text-center text-red-600 font-semibold text-xl"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf5 \cb3 \strokec5 Access\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Denied\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf5 \cb3 \strokec5 You\cf2 \cb3 \strokec2  must be an administrator to view \cf4 \cb3 \strokec4 this\cf2 \cb3 \strokec2  page\cf6 \strokec6 .\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "p-6 bg-yellow-50 rounded-2xl shadow-lg border border-yellow-200 font-inter"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 <\cf2 \strokec2 h2 className\cf6 \strokec6 =\cf7 \strokec7 "text-3xl font-bold text-yellow-800 mb-6 text-center"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Admin\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Dashboard\cf6 \cb3 \strokec6 </\cf2 \strokec2 h2\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-lg text-gray-700 mb-4"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf5 \cb3 \strokec5 Welcome\cf6 \cb3 \strokec6 ,\cf2 \strokec2  \cf5 \cb3 \strokec5 Admin\cf6 \cb3 \strokec6 !\cf2 \strokec2  \cf6 \strokec6 (\cf5 \cb3 \strokec5 Your\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 User\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 ID\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 <\cf2 \strokec2 span className\cf6 \strokec6 =\cf7 \strokec7 "font-mono text-base bg-yellow-100 p-1 rounded-md"\cf6 \strokec6 >\{\cf2 \strokec2 userId\cf6 \strokec6 \}</\cf2 \strokec2 span\cf6 \strokec6 >)\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 </\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \{!\cf2 \strokec2 backendHealthy \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center font-semibold"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf5 \cb3 \strokec5 Backend\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 is\cf2 \cb3 \strokec2  not healthy\cf6 \strokec6 .\cf2 \strokec2  \cf5 \cb3 \strokec5 Admin\cf2 \cb3 \strokec2  functions requiring backend interaction may not work\cf6 \strokec6 .\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \{\cf2 \strokec2 adminMessage \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\{\cf7 \strokec7 `status-message \cf6 \strokec6 $\{\cf2 \strokec2 adminMessage\cf6 \strokec6 .\cf2 \strokec2 includes\cf6 \strokec6 (\cf7 \strokec7 'Error'\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 'status-error'\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'status-info'\cf6 \strokec6 \}\cf7 \strokec7  mb-4 p-3 rounded-md`\cf6 \strokec6 \}>\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 \{\cf2 \strokec2 adminMessage\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\
\cb3           \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "grid grid-cols-1 lg:grid-cols-2 gap-6"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "bg-white p-4 rounded-lg shadow-md border border-yellow-100 max-h-96 overflow-y-auto"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 h3 className\cf6 \strokec6 =\cf7 \strokec7 "text-xl font-semibold text-gray-800 mb-3"\cf6 \strokec6 >\cf5 \cb3 \strokec5 All\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Users\cf2 \cb3 \strokec2  \cf6 \strokec6 (\{\cf2 \strokec2 allUsers\cf6 \strokec6 .\cf2 \strokec2 length\cf6 \strokec6 \})</\cf2 \strokec2 h3\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 \{\cf2 \strokec2 allUsers\cf6 \strokec6 .\cf2 \strokec2 length \cf6 \strokec6 ===\cf2 \strokec2  \cf9 \cb3 \strokec9 0\cf2 \cb3 \strokec2  \cf6 \strokec6 &&\cf2 \strokec2  backendHealthy \cf6 \strokec6 ?\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 No\cf2 \cb3 \strokec2  users found\cf6 \strokec6 .</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  allUsers\cf6 \strokec6 .\cf2 \strokec2 length \cf6 \strokec6 ===\cf2 \strokec2  \cf9 \cb3 \strokec9 0\cf2 \cb3 \strokec2  \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy \cf6 \strokec6 ?\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Cannot\cf2 \cb3 \strokec2  load users \cf6 \strokec6 (\cf5 \cb3 \strokec5 Backend\cf2 \cb3 \strokec2  not healthy\cf6 \strokec6 ).</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 ul className\cf6 \strokec6 =\cf7 \strokec7 "space-y-2"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 \{\cf2 \strokec2 allUsers\cf6 \strokec6 .\cf2 \strokec2 map\cf6 \strokec6 ((\cf2 \strokec2 user\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 <\cf2 \strokec2 li\cb1 \
\cb3                       key\cf6 \strokec6 =\{\cf2 \strokec2 user\cf6 \strokec6 .\cf2 \strokec2 uid\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                       className\cf6 \strokec6 =\{\cf7 \strokec7 `p-3 rounded-lg cursor-pointer transition-colors duration-150\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf7 \cb3 \strokec7                         \cf6 \strokec6 $\{\cf2 \strokec2 selectedUser \cf6 \strokec6 &&\cf2 \strokec2  selectedUser\cf6 \strokec6 .\cf2 \strokec2 uid \cf6 \strokec6 ===\cf2 \strokec2  user\cf6 \strokec6 .\cf2 \strokec2 uid \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 'bg-blue-100 text-blue-800 font-semibold'\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'bg-gray-50 hover:bg-gray-100'\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cf7 \cb3 \strokec7                         flex justify-between items-center`\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3                       onClick\cf6 \strokec6 =\{()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  setSelectedUser\cf6 \strokec6 (\cf2 \strokec2 user\cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 <\cf2 \strokec2 span className\cf6 \strokec6 =\cf7 \strokec7 "font-mono text-sm break-all"\cf6 \strokec6 >\{\cf2 \strokec2 user\cf6 \strokec6 .\cf2 \strokec2 uid\cf6 \strokec6 \}</\cf2 \strokec2 span\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 \{\cf2 \strokec2 user\cf6 \strokec6 .\cf2 \strokec2 email \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 <\cf2 \strokec2 span className\cf6 \strokec6 =\cf7 \strokec7 "text-xs text-gray-600 ml-2"\cf6 \strokec6 >(\{\cf2 \strokec2 user\cf6 \strokec6 .\cf2 \strokec2 email\cf6 \strokec6 \})</\cf2 \strokec2 span\cf6 \strokec6 >\}\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 \{\cf2 \strokec2 user\cf6 \strokec6 .\cf2 \strokec2 displayName \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 <\cf2 \strokec2 span className\cf6 \strokec6 =\cf7 \strokec7 "text-xs text-gray-600 ml-2"\cf6 \strokec6 >(\{\cf2 \strokec2 user\cf6 \strokec6 .\cf2 \strokec2 displayName\cf6 \strokec6 \})</\cf2 \strokec2 span\cf6 \strokec6 >\}\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 </\cf2 \strokec2 li\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 ))\}\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 ul\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\
\cb3             \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "bg-white p-4 rounded-lg shadow-md border border-yellow-100 max-h-96 overflow-y-auto"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 h3 className\cf6 \strokec6 =\cf7 \strokec7 "text-xl font-semibold text-gray-800 mb-3"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 \{\cf2 \strokec2 selectedUser \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 `Chat History for \cf6 \strokec6 $\{\cf2 \strokec2 selectedUser\cf6 \strokec6 .\cf2 \strokec2 uid\cf6 \strokec6 \}\cf7 \strokec7 `\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'Select a User to View History'\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 </\cf2 \strokec2 h3\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 \{\cf2 \strokec2 selectedUser \cf6 \strokec6 ?\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                 selectedUserChatHistory\cf6 \strokec6 .\cf2 \strokec2 length \cf6 \strokec6 ===\cf2 \strokec2  \cf9 \cb3 \strokec9 0\cf2 \cb3 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 No\cf2 \cb3 \strokec2  chat history \cf4 \cb3 \strokec4 for\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 this\cf2 \cb3 \strokec2  user\cf6 \strokec6 .</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 ul className\cf6 \strokec6 =\cf7 \strokec7 "space-y-3"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 \{\cf2 \strokec2 selectedUserChatHistory\cf6 \strokec6 .\cf2 \strokec2 map\cf6 \strokec6 ((\cf2 \strokec2 item\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 <\cf2 \strokec2 li key\cf6 \strokec6 =\{\cf2 \strokec2 item\cf6 \strokec6 .\cf2 \strokec2 id\cf6 \strokec6 \}\cf2 \strokec2  className\cf6 \strokec6 =\cf7 \strokec7 "p-3 rounded-lg bg-gray-50 border border-gray-100 shadow-sm relative"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-xs text-gray-500 mb-1"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                           \cf6 \strokec6 \{\cf2 \strokec2 item\cf6 \strokec6 .\cf2 \strokec2 timestamp \cf6 \strokec6 ?\cf2 \strokec2  \cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Date\cf6 \cb3 \strokec6 (\cf2 \strokec2 item\cf6 \strokec6 .\cf2 \strokec2 timestamp\cf6 \strokec6 .\cf2 \strokec2 seconds \cf6 \strokec6 *\cf2 \strokec2  \cf9 \cb3 \strokec9 1000\cf6 \cb3 \strokec6 ).\cf2 \strokec2 toLocaleString\cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'N/A'\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 </\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 \{\cf2 \strokec2 item\cf6 \strokec6 .\cf4 \cb3 \strokec4 type\cf2 \cb3 \strokec2  \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'rag_query'\cf2 \strokec2  \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                           <>\cb1 \
\cb3                             \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "font-semibold text-blue-700 mb-1"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Q\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2 item\cf6 \strokec6 .\cf2 \strokec2 content\cf6 \strokec6 \}</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                             \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-gray-800"\cf6 \strokec6 >\cf5 \cb3 \strokec5 A\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2 item\cf6 \strokec6 .\cf2 \strokec2 response\cf6 \strokec6 \}</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                           </>\cb1 \
\cb3                         \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 \{\cf2 \strokec2 item\cf6 \strokec6 .\cf4 \cb3 \strokec4 type\cf2 \cb3 \strokec2  \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'document_upload'\cf2 \strokec2  \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                           \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "font-semibold text-green-700"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                             \cf5 \cb3 \strokec5 Document\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Uploaded\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 <\cf2 \strokec2 span className\cf6 \strokec6 =\cf7 \strokec7 "text-gray-800"\cf6 \strokec6 >\{\cf2 \strokec2 item\cf6 \strokec6 .\cf2 \strokec2 fileName\cf6 \strokec6 \}</\cf2 \strokec2 span\cf6 \strokec6 >\cf2 \strokec2  \cf6 \strokec6 (\cf5 \cb3 \strokec5 Status\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2 item\cf6 \strokec6 .\cf2 \strokec2 status\cf6 \strokec6 \})\cf2 \cb1 \strokec2 \
\cb3                           \cf6 \strokec6 </\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 <\cf2 \strokec2 button\cb1 \
\cb3                           onClick\cf6 \strokec6 =\{()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  handleDeleteClick\cf6 \strokec6 (\cf7 \strokec7 'chat'\cf6 \strokec6 ,\cf2 \strokec2  item\cf6 \strokec6 .\cf2 \strokec2 id\cf6 \strokec6 ,\cf2 \strokec2  selectedUser\cf6 \strokec6 .\cf2 \strokec2 uid\cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3                           className\cf6 \strokec6 =\cf7 \strokec7 "absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-150 text-xs"\cf2 \cb1 \strokec2 \
\cb3                           title\cf6 \strokec6 =\cf7 \strokec7 "Delete this entry"\cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                           \cf10 \cb3 \strokec10 \uc0\u10005 \cf2 \cb1 \strokec2 \
\cb3                         \cf6 \strokec6 </\cf2 \strokec2 button\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 </\cf2 \strokec2 li\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 ))\}\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 </\cf2 \strokec2 ul\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 )\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Select\cf2 \cb3 \strokec2  a user \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  the left panel to view their chat history\cf6 \strokec6 .</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\
\cb3             \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "bg-white p-4 rounded-lg shadow-md border border-yellow-100 max-h-96 overflow-y-auto"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 h3 className\cf6 \strokec6 =\cf7 \strokec7 "text-xl font-semibold text-gray-800 mb-3"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Uploaded\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Documents\cf2 \cb3 \strokec2  \cf6 \strokec6 (\{\cf2 \strokec2 uploadedDocuments\cf6 \strokec6 .\cf2 \strokec2 length\cf6 \strokec6 \})</\cf2 \strokec2 h3\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 \{\cf2 \strokec2 uploadedDocuments\cf6 \strokec6 .\cf2 \strokec2 length \cf6 \strokec6 ===\cf2 \strokec2  \cf9 \cb3 \strokec9 0\cf2 \cb3 \strokec2  \cf6 \strokec6 &&\cf2 \strokec2  backendHealthy \cf6 \strokec6 ?\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 No\cf2 \cb3 \strokec2  documents uploaded yet\cf6 \strokec6 .</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  uploadedDocuments\cf6 \strokec6 .\cf2 \strokec2 length \cf6 \strokec6 ===\cf2 \strokec2  \cf9 \cb3 \strokec9 0\cf2 \cb3 \strokec2  \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy \cf6 \strokec6 ?\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Cannot\cf2 \cb3 \strokec2  load documents \cf6 \strokec6 (\cf5 \cb3 \strokec5 Backend\cf2 \cb3 \strokec2  not healthy\cf6 \strokec6 ).</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 ul className\cf6 \strokec6 =\cf7 \strokec7 "space-y-2"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 \{\cf2 \strokec2 uploadedDocuments\cf6 \strokec6 .\cf2 \strokec2 map\cf6 \strokec6 ((\cf2 \strokec2 doc\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 <\cf2 \strokec2 li key\cf6 \strokec6 =\{\cf2 \strokec2 doc\cf6 \strokec6 .\cf2 \strokec2 id\cf6 \strokec6 \}\cf2 \strokec2  className\cf6 \strokec6 =\cf7 \strokec7 "p-3 rounded-lg bg-gray-50 border border-gray-100 shadow-sm relative"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "font-semibold text-purple-700 break-words"\cf6 \strokec6 >\{\cf2 \strokec2 doc\cf6 \strokec6 .\cf2 \strokec2 filename\cf6 \strokec6 \}</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-xs text-gray-500"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                         \cf5 \cb3 \strokec5 Uploaded\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf4 \cb3 \strokec4 new\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Date\cf6 \cb3 \strokec6 (\cf2 \strokec2 doc\cf6 \strokec6 .\cf2 \strokec2 upload_timestamp\cf6 \strokec6 ).\cf2 \strokec2 toLocaleString\cf6 \strokec6 ()\}\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 </\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-xs text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Chunks\cf6 \cb3 \strokec6 :\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2 doc\cf6 \strokec6 .\cf2 \strokec2 num_chunks\cf6 \strokec6 \}</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 <\cf2 \strokec2 button\cb1 \
\cb3                         onClick\cf6 \strokec6 =\{()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  handleDeleteClick\cf6 \strokec6 (\cf7 \strokec7 'doc'\cf6 \strokec6 ,\cf2 \strokec2  doc\cf6 \strokec6 .\cf2 \strokec2 id\cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3                         className\cf6 \strokec6 =\cf7 \strokec7 "absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-150 text-xs"\cf2 \cb1 \strokec2 \
\cb3                         title\cf6 \strokec6 =\cf7 \strokec7 "Delete this document and its chunks"\cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                         \cf10 \cb3 \strokec10 \uc0\u10005 \cf2 \cb1 \strokec2 \
\cb3                       \cf6 \strokec6 </\cf2 \strokec2 button\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                     \cf6 \strokec6 </\cf2 \strokec2 li\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 ))\}\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 ul\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\
\cb3             \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "bg-white p-4 rounded-lg shadow-md border border-yellow-100"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 h3 className\cf6 \strokec6 =\cf7 \strokec7 "text-xl font-semibold text-gray-800 mb-3"\cf6 \strokec6 >\cf5 \cb3 \strokec5 RAG\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 System\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Parameters\cf6 \cb3 \strokec6 </\cf2 \strokec2 h3\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 \{\cf2 \strokec2 paramSaveMessage \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\{\cf7 \strokec7 `status-message \cf6 \strokec6 $\{\cf2 \strokec2 paramSaveMessage\cf6 \strokec6 .\cf2 \strokec2 includes\cf6 \strokec6 (\cf7 \strokec7 'Error'\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 'status-error'\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'status-info'\cf6 \strokec6 \}\cf7 \strokec7  mb-4 p-2 text-sm rounded-md`\cf6 \strokec6 \}>\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 \{\cf2 \strokec2 paramSaveMessage\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "space-y-4"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 label htmlFor\cf6 \strokec6 =\cf7 \strokec7 "chunk_size"\cf2 \strokec2  className\cf6 \strokec6 =\cf7 \strokec7 "block text-sm font-medium text-gray-700"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Chunk\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Size\cf6 \cb3 \strokec6 </\cf2 \strokec2 label\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 input\cb1 \
\cb3                     \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 =\cf7 \strokec7 "number"\cf2 \cb1 \strokec2 \
\cb3                     id\cf6 \strokec6 =\cf7 \strokec7 "chunk_size"\cf2 \cb1 \strokec2 \
\cb3                     name\cf6 \strokec6 =\cf7 \strokec7 "chunk_size"\cf2 \cb1 \strokec2 \
\cb3                     value\cf6 \strokec6 =\{\cf2 \strokec2 ragParams\cf6 \strokec6 .\cf2 \strokec2 chunk_size\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     onChange\cf6 \strokec6 =\{\cf2 \strokec2 handleParamChange\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     className\cf6 \strokec6 =\cf7 \strokec7 "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"\cf2 \cb1 \strokec2 \
\cb3                     min\cf6 \strokec6 =\cf7 \strokec7 "100"\cf2 \strokec2  max\cf6 \strokec6 =\cf7 \strokec7 "2000"\cf2 \strokec2  step\cf6 \strokec6 =\cf7 \strokec7 "10"\cf2 \cb1 \strokec2 \
\cb3                     disabled\cf6 \strokec6 =\{!\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   />\cb1 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "mt-1 text-xs text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Size\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 of\cf2 \cb3 \strokec2  text chunks \cf4 \cb3 \strokec4 for\cf2 \cb3 \strokec2  ingestion\cf6 \strokec6 .</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 label htmlFor\cf6 \strokec6 =\cf7 \strokec7 "chunk_overlap"\cf2 \strokec2  className\cf6 \strokec6 =\cf7 \strokec7 "block text-sm font-medium text-gray-700"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Chunk\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Overlap\cf6 \cb3 \strokec6 </\cf2 \strokec2 label\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 input\cb1 \
\cb3                     \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 =\cf7 \strokec7 "number"\cf2 \cb1 \strokec2 \
\cb3                     id\cf6 \strokec6 =\cf7 \strokec7 "chunk_overlap"\cf2 \cb1 \strokec2 \
\cb3                     name\cf6 \strokec6 =\cf7 \strokec7 "chunk_overlap"\cf2 \cb1 \strokec2 \
\cb3                     value\cf6 \strokec6 =\{\cf2 \strokec2 ragParams\cf6 \strokec6 .\cf2 \strokec2 chunk_overlap\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     onChange\cf6 \strokec6 =\{\cf2 \strokec2 handleParamChange\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     className\cf6 \strokec6 =\cf7 \strokec7 "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"\cf2 \cb1 \strokec2 \
\cb3                     min\cf6 \strokec6 =\cf7 \strokec7 "0"\cf2 \strokec2  max\cf6 \strokec6 =\cf7 \strokec7 "500"\cf2 \strokec2  step\cf6 \strokec6 =\cf7 \strokec7 "10"\cf2 \cb1 \strokec2 \
\cb3                     disabled\cf6 \strokec6 =\{!\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   />\cb1 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "mt-1 text-xs text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Overlap\cf2 \cb3 \strokec2  between consecutive text chunks\cf6 \strokec6 .</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 label htmlFor\cf6 \strokec6 =\cf7 \strokec7 "retrieval_k"\cf2 \strokec2  className\cf6 \strokec6 =\cf7 \strokec7 "block text-sm font-medium text-gray-700"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Initial\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Retrieval\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 k\cf6 \strokec6 )</\cf2 \strokec2 label\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 input\cb1 \
\cb3                     \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 =\cf7 \strokec7 "number"\cf2 \cb1 \strokec2 \
\cb3                     id\cf6 \strokec6 =\cf7 \strokec7 "retrieval_k"\cf2 \cb1 \strokec2 \
\cb3                     name\cf6 \strokec6 =\cf7 \strokec7 "retrieval_k"\cf2 \cb1 \strokec2 \
\cb3                     value\cf6 \strokec6 =\{\cf2 \strokec2 ragParams\cf6 \strokec6 .\cf2 \strokec2 retrieval_k\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     onChange\cf6 \strokec6 =\{\cf2 \strokec2 handleParamChange\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     className\cf6 \strokec6 =\cf7 \strokec7 "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"\cf2 \cb1 \strokec2 \
\cb3                     min\cf6 \strokec6 =\cf7 \strokec7 "1"\cf2 \strokec2  max\cf6 \strokec6 =\cf7 \strokec7 "10"\cf2 \strokec2  step\cf6 \strokec6 =\cf7 \strokec7 "1"\cf2 \cb1 \strokec2 \
\cb3                     disabled\cf6 \strokec6 =\{!\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   />\cb1 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "mt-1 text-xs text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Number\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 of\cf2 \cb3 \strokec2  documents retrieved before reranking\cf6 \strokec6 .</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 label htmlFor\cf6 \strokec6 =\cf7 \strokec7 "cross_encoder_top_n"\cf2 \strokec2  className\cf6 \strokec6 =\cf7 \strokec7 "block text-sm font-medium text-gray-700"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Reranked\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Top\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 n\cf6 \strokec6 )</\cf2 \strokec2 label\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 input\cb1 \
\cb3                     \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 =\cf7 \strokec7 "number"\cf2 \cb1 \strokec2 \
\cb3                     id\cf6 \strokec6 =\cf7 \strokec7 "cross_encoder_top_n"\cf2 \cb1 \strokec2 \
\cb3                     name\cf6 \strokec6 =\cf7 \strokec7 "cross_encoder_top_n"\cf2 \cb1 \strokec2 \
\cb3                     value\cf6 \strokec6 =\{\cf2 \strokec2 ragParams\cf6 \strokec6 .\cf2 \strokec2 cross_encoder_top_n\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     onChange\cf6 \strokec6 =\{\cf2 \strokec2 handleParamChange\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     className\cf6 \strokec6 =\cf7 \strokec7 "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"\cf2 \cb1 \strokec2 \
\cb3                     min\cf6 \strokec6 =\cf7 \strokec7 "1"\cf2 \strokec2  max\cf6 \strokec6 =\cf7 \strokec7 "10"\cf2 \strokec2  step\cf6 \strokec6 =\cf7 \strokec7 "1"\cf2 \cb1 \strokec2 \
\cb3                     disabled\cf6 \strokec6 =\{!\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   />\cb1 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "mt-1 text-xs text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Number\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 of\cf2 \cb3 \strokec2  top documents kept after cross\cf6 \strokec6 -\cf2 \strokec2 encoder reranking\cf6 \strokec6 .</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 label htmlFor\cf6 \strokec6 =\cf7 \strokec7 "llm_temperature"\cf2 \strokec2  className\cf6 \strokec6 =\cf7 \strokec7 "block text-sm font-medium text-gray-700"\cf6 \strokec6 >\cf5 \cb3 \strokec5 LLM\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Temperature\cf6 \cb3 \strokec6 </\cf2 \strokec2 label\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 input\cb1 \
\cb3                     \cf4 \cb3 \strokec4 type\cf6 \cb3 \strokec6 =\cf7 \strokec7 "number"\cf2 \cb1 \strokec2 \
\cb3                     id\cf6 \strokec6 =\cf7 \strokec7 "llm_temperature"\cf2 \cb1 \strokec2 \
\cb3                     name\cf6 \strokec6 =\cf7 \strokec7 "llm_temperature"\cf2 \cb1 \strokec2 \
\cb3                     value\cf6 \strokec6 =\{\cf2 \strokec2 ragParams\cf6 \strokec6 .\cf2 \strokec2 llm_temperature\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     onChange\cf6 \strokec6 =\{\cf2 \strokec2 handleParamChange\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     className\cf6 \strokec6 =\cf7 \strokec7 "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"\cf2 \cb1 \strokec2 \
\cb3                     min\cf6 \strokec6 =\cf7 \strokec7 "0.0"\cf2 \strokec2  max\cf6 \strokec6 =\cf7 \strokec7 "1.0"\cf2 \strokec2  step\cf6 \strokec6 =\cf7 \strokec7 "0.1"\cf2 \cb1 \strokec2 \
\cb3                     disabled\cf6 \strokec6 =\{!\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   />\cb1 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "mt-1 text-xs text-gray-500"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Controls\cf2 \cb3 \strokec2  the randomness \cf4 \cb3 \strokec4 of\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 LLM\cf2 \cb3 \strokec2  output \cf6 \strokec6 (\cf9 \cb3 \strokec9 0.0\cf2 \cb3 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  deterministic\cf6 \strokec6 ,\cf2 \strokec2  \cf9 \cb3 \strokec9 1.0\cf2 \cb3 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  creative\cf6 \strokec6 ).</\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 button\cb1 \
\cb3                   onClick\cf6 \strokec6 =\{\cf2 \strokec2 handleSaveRagParams\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   disabled\cf6 \strokec6 =\{\cf2 \strokec2 isSavingParams \cf6 \strokec6 ||\cf2 \strokec2  \cf6 \strokec6 !\cf2 \strokec2 backendHealthy\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                   className\cf6 \strokec6 =\cf7 \strokec7 "w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300"\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 \{\cf2 \strokec2 isSavingParams \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 'Saving...'\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'Save RAG Parameters'\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 button\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\
\cb3           \cf6 \strokec6 \{\cf2 \strokec2 isConfirmModalOpen \cf6 \strokec6 &&\cf2 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "bg-white p-6 rounded-lg shadow-xl text-center"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 h3 className\cf6 \strokec6 =\cf7 \strokec7 "text-lg font-semibold text-gray-800 mb-4"\cf6 \strokec6 >\cf5 \cb3 \strokec5 Confirm\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 Deletion\cf6 \cb3 \strokec6 </\cf2 \strokec2 h3\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 p className\cf6 \strokec6 =\cf7 \strokec7 "text-gray-600 mb-6"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf5 \cb3 \strokec5 Are\cf2 \cb3 \strokec2  you sure you want to \cf4 \cb3 \strokec4 delete\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 this\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2 itemToDelete\cf6 \strokec6 ?.\cf4 \cb3 \strokec4 type\cf2 \cb3 \strokec2  \cf6 \strokec6 ===\cf2 \strokec2  \cf7 \strokec7 'chat'\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  \cf7 \strokec7 'chat history entry'\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'document and its associated data'\cf6 \strokec6 \}?\cf2 \strokec2  \cf5 \cb3 \strokec5 This\cf2 \cb3 \strokec2  action cannot be undone\cf6 \strokec6 .\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 p\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 <\cf2 \strokec2 div className\cf6 \strokec6 =\cf7 \strokec7 "flex justify-center space-x-4"\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 button\cb1 \
\cb3                     onClick\cf6 \strokec6 =\{\cf2 \strokec2 confirmDelete\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     className\cf6 \strokec6 =\cf7 \strokec7 "px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                     \cf5 \cb3 \strokec5 Delete\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 </\cf2 \strokec2 button\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 <\cf2 \strokec2 button\cb1 \
\cb3                     onClick\cf6 \strokec6 =\{\cf2 \strokec2 cancelDelete\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3                     className\cf6 \strokec6 =\cf7 \strokec7 "px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                     \cf5 \cb3 \strokec5 Cancel\cf2 \cb1 \strokec2 \
\cb3                   \cf6 \strokec6 </\cf2 \strokec2 button\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 )\}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 </\cf2 \strokec2 div\cf6 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3     \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3     \cb1 \
}