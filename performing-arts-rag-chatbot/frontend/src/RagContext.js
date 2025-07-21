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
\outl0\strokewidth0 \strokec2     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 React\cf6 \cb3 \strokec6 ,\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  createContext\cf6 \strokec6 ,\cf2 \strokec2  useState\cf6 \strokec6 ,\cf2 \strokec2  useEffect\cf6 \strokec6 ,\cf2 \strokec2  useCallback \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 'react'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  initializeApp \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 'firebase/app'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  getAuth\cf6 \strokec6 ,\cf2 \strokec2  signInAnonymously\cf6 \strokec6 ,\cf2 \strokec2  signInWithCustomToken\cf6 \strokec6 ,\cf2 \strokec2  onAuthStateChanged \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 'firebase/auth'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 import\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \strokec2  getFirestore \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 from\cf2 \cb3 \strokec2  \cf7 \strokec7 'firebase/firestore'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\
\cb3     \cf8 \strokec8 // Create the context\cf2 \cb1 \strokec2 \
\cb3     \cf4 \cb3 \strokec4 export\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 RagContext\cf2 \cb3 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  createContext\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\
\cb3     \cf8 \strokec8 /**\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf8 \cb3 \strokec8      * RagProvider component manages global state for the RAG application,\cf2 \cb1 \strokec2 \
\cf8 \cb3 \strokec8      * including Firebase authentication, Firestore instance, and backend health.\cf2 \cb1 \strokec2 \
\cf8 \cb3 \strokec8      * It makes these available to all consuming components via the RagContext.\cf2 \cb1 \strokec2 \
\cf8 \cb3 \strokec8      */\cf2 \cb1 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf2 \cb3     \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 RagProvider\cf2 \cb3 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 (\{\cf2 \strokec2  children \cf6 \strokec6 \})\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 db\cf6 \strokec6 ,\cf2 \strokec2  setDb\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 auth\cf6 \strokec6 ,\cf2 \strokec2  setAuth\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 userId\cf6 \strokec6 ,\cf2 \strokec2  setUserId\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 isAdmin\cf6 \strokec6 ,\cf2 \strokec2  setIsAdmin\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 authToken\cf6 \strokec6 ,\cf2 \strokec2  setAuthToken\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 appId\cf6 \strokec6 ,\cf2 \strokec2  setAppId\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 isAuthReady\cf6 \strokec6 ,\cf2 \strokec2  setIsAuthReady\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 backendStatus\cf6 \strokec6 ,\cf2 \strokec2  setBackendStatus\cf6 \strokec6 ]\cf2 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  useState\cf6 \strokec6 (\cf7 \strokec7 'checking...'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 BACKEND_API_KEY\cf2 \cb3 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  \cf7 \strokec7 "your_backend_api_key_here"\cf6 \strokec6 ;\cf2 \strokec2  \cf8 \strokec8 // <<< IMPORTANT: REPLACE THIS\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Firebase Initialization and Authentication ---\cf2 \cb1 \strokec2 \
\cb3       useEffect\cf6 \strokec6 (()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  firebaseConfig \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 typeof\cf2 \cb3 \strokec2  __firebase_config \cf6 \strokec6 !==\cf2 \strokec2  \cf7 \strokec7 'undefined'\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  \cf5 \cb3 \strokec5 JSON\cf6 \cb3 \strokec6 .\cf2 \strokec2 parse\cf6 \strokec6 (\cf2 \strokec2 __firebase_config\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 :\cf2 \strokec2  \cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  initialAuthToken \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 typeof\cf2 \cb3 \strokec2  __initial_auth_token \cf6 \strokec6 !==\cf2 \strokec2  \cf7 \strokec7 'undefined'\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  __initial_auth_token \cf6 \strokec6 :\cf2 \strokec2  \cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  currentAppId \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 typeof\cf2 \cb3 \strokec2  __app_id \cf6 \strokec6 !==\cf2 \strokec2  \cf7 \strokec7 'undefined'\cf2 \strokec2  \cf6 \strokec6 ?\cf2 \strokec2  __app_id \cf6 \strokec6 :\cf2 \strokec2  \cf7 \strokec7 'default-app-id'\cf6 \strokec6 ;\cf2 \cb1 \strokec2 \
\
\cb3         \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 firebaseConfig\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  app \cf6 \strokec6 =\cf2 \strokec2  initializeApp\cf6 \strokec6 (\cf2 \strokec2 firebaseConfig\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  firestoreInstance \cf6 \strokec6 =\cf2 \strokec2  getFirestore\cf6 \strokec6 (\cf2 \strokec2 app\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  authInstance \cf6 \strokec6 =\cf2 \strokec2  getAuth\cf6 \strokec6 (\cf2 \strokec2 app\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3             setDb\cf6 \strokec6 (\cf2 \strokec2 firestoreInstance\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             setAuth\cf6 \strokec6 (\cf2 \strokec2 authInstance\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             setAppId\cf6 \strokec6 (\cf2 \strokec2 currentAppId\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  signIn \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 initialAuthToken\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3                   \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  signInWithCustomToken\cf6 \strokec6 (\cf2 \strokec2 authInstance\cf6 \strokec6 ,\cf2 \strokec2  initialAuthToken\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                   console\cf6 \strokec6 .\cf2 \strokec2 log\cf6 \strokec6 (\cf7 \strokec7 "Signed in with custom token."\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 else\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3                   \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  signInAnonymously\cf6 \strokec6 (\cf2 \strokec2 authInstance\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                   console\cf6 \strokec6 .\cf2 \strokec2 log\cf6 \strokec6 (\cf7 \strokec7 "Signed in anonymously."\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3                 console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Firebase authentication error:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3                   \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  signInAnonymously\cf6 \strokec6 (\cf2 \strokec2 authInstance\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                   console\cf6 \strokec6 .\cf2 \strokec2 log\cf6 \strokec6 (\cf7 \strokec7 "Signed in anonymously after custom token failure."\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 anonError\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3                   console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Anonymous sign-in failed:"\cf6 \strokec6 ,\cf2 \strokec2  anonError\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3             signIn\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  unsubscribe \cf6 \strokec6 =\cf2 \strokec2  onAuthStateChanged\cf6 \strokec6 (\cf2 \strokec2 authInstance\cf6 \strokec6 ,\cf2 \strokec2  \cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 user\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3               \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 user\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3                 setUserId\cf6 \strokec6 (\cf2 \strokec2 user\cf6 \strokec6 .\cf2 \strokec2 uid\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 ADMIN_UID\cf2 \cb3 \strokec2  \cf6 \strokec6 =\cf2 \strokec2  \cf7 \strokec7 'YOUR_ADMIN_UID_HERE'\cf6 \strokec6 ;\cf2 \strokec2  \cf8 \strokec8 // <<< IMPORTANT: REPLACE THIS\cf2 \cb1 \strokec2 \
\cb3                 setIsAdmin\cf6 \strokec6 (\cf2 \strokec2 user\cf6 \strokec6 .\cf2 \strokec2 uid \cf6 \strokec6 ===\cf2 \strokec2  \cf5 \cb3 \strokec5 ADMIN_UID\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 \cb1 \
\cb3                 \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  token \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  user\cf6 \strokec6 .\cf2 \strokec2 getIdToken\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3                 setAuthToken\cf6 \strokec6 (\cf2 \strokec2 token\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 console\cf6 \strokec6 .\cf2 \strokec2 log\cf6 \strokec6 (\cf7 \strokec7 "Firebase Auth State Changed: User is signed in."\cf6 \strokec6 ,\cf2 \strokec2  user\cf6 \strokec6 .\cf2 \strokec2 uid\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 else\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3                 setUserId\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 setIsAdmin\cf6 \strokec6 (\cf4 \cb3 \strokec4 false\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 setAuthToken\cf6 \strokec6 (\cf4 \cb3 \strokec4 null\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3                 console\cf6 \strokec6 .\cf2 \strokec2 log\cf6 \strokec6 (\cf7 \strokec7 "Firebase Auth State Changed: No user is signed in."\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3               \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3               setIsAuthReady\cf6 \strokec6 (\cf4 \cb3 \strokec4 true\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3             \cf6 \strokec6 \});\cf2 \cb1 \strokec2 \
\
\cb3             \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  unsubscribe\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Firebase initialization failed:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 else\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 warn\cf6 \strokec6 (\cf7 \strokec7 "Firebase config not available. Running without Firebase features."\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setIsAuthReady\cf6 \strokec6 (\cf4 \cb3 \strokec4 true\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 []);\cf2 \cb1 \strokec2 \
\
\cb3       \cf8 \strokec8 // --- Backend Health Check ---\cf2 \cb1 \strokec2 \
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  checkBackendHealth \cf6 \strokec6 =\cf2 \strokec2  useCallback\cf6 \strokec6 (\cf4 \cb3 \strokec4 async\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 try\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  response \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  fetch\cf6 \strokec6 (\cf7 \strokec7 '/api/health'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf4 \cb3 \strokec4 if\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 response\cf6 \strokec6 .\cf2 \strokec2 ok\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  data \cf6 \strokec6 =\cf2 \strokec2  \cf4 \cb3 \strokec4 await\cf2 \cb3 \strokec2  response\cf6 \strokec6 .\cf2 \strokec2 json\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3             setBackendStatus\cf6 \strokec6 (\cf2 \strokec2 data\cf6 \strokec6 .\cf2 \strokec2 status\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 else\cf2 \cb3 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3             setBackendStatus\cf6 \strokec6 (\cf7 \strokec7 'unhealthy'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \strokec2  \cf4 \cb3 \strokec4 catch\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \strokec2 error\cf6 \strokec6 )\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3           console\cf6 \strokec6 .\cf2 \strokec2 error\cf6 \strokec6 (\cf7 \strokec7 "Error checking backend health:"\cf6 \strokec6 ,\cf2 \strokec2  error\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3           setBackendStatus\cf6 \strokec6 (\cf7 \strokec7 'unhealthy'\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 []);\cf2 \cb1 \strokec2 \
\
\cb3       useEffect\cf6 \strokec6 (()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         checkBackendHealth\cf6 \strokec6 ();\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  intervalId \cf6 \strokec6 =\cf2 \strokec2  setInterval\cf6 \strokec6 (\cf2 \strokec2 checkBackendHealth\cf6 \strokec6 ,\cf2 \strokec2  \cf9 \cb3 \strokec9 10000\cf6 \cb3 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3         \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  \cf6 \strokec6 ()\cf2 \strokec2  \cf6 \strokec6 =>\cf2 \strokec2  clearInterval\cf6 \strokec6 (\cf2 \strokec2 intervalId\cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 \},\cf2 \strokec2  \cf6 \strokec6 [\cf2 \strokec2 checkBackendHealth\cf6 \strokec6 ]);\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 const\cf2 \cb3 \strokec2  contextValue \cf6 \strokec6 =\cf2 \strokec2  \cf6 \strokec6 \{\cf2 \cb1 \strokec2 \
\cb3         db\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         auth\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         userId\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         isAdmin\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         authToken\cf6 \strokec6 :\cf2 \strokec2  \cf5 \cb3 \strokec5 BACKEND_API_KEY\cf6 \cb3 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         appId\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         isAuthReady\cf6 \strokec6 ,\cf2 \cb1 \strokec2 \
\cb3         backendStatus\cb1 \
\cb3       \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3       \cf4 \cb3 \strokec4 return\cf2 \cb3 \strokec2  \cf6 \strokec6 (\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 <\cf5 \cb3 \strokec5 RagContext\cf6 \cb3 \strokec6 .\cf5 \cb3 \strokec5 Provider\cf2 \cb3 \strokec2  value\cf6 \strokec6 =\{\cf2 \strokec2 contextValue\cf6 \strokec6 \}>\cf2 \cb1 \strokec2 \
\cb3           \cf6 \strokec6 \{\cf2 \strokec2 children\cf6 \strokec6 \}\cf2 \cb1 \strokec2 \
\cb3         \cf6 \strokec6 </\cf5 \cb3 \strokec5 RagContext\cf6 \cb3 \strokec6 .\cf5 \cb3 \strokec5 Provider\cf6 \cb3 \strokec6 >\cf2 \cb1 \strokec2 \
\cb3       \cf6 \strokec6 );\cf2 \cb1 \strokec2 \
\cb3     \cf6 \strokec6 \};\cf2 \cb1 \strokec2 \
\
\cb3     \cf4 \cb3 \strokec4 export\cf2 \cb3 \strokec2  \cf4 \cb3 \strokec4 default\cf2 \cb3 \strokec2  \cf5 \cb3 \strokec5 RagProvider\cf6 \cb3 \strokec6 ;\cf2 \cb1 \strokec2 \
\cb3     \cb1 \
}