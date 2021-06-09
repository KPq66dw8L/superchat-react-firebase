import './App.css';
import React, { useRef, useState } from 'react';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//NO SECURITY RULES USED 

if (firebase.apps.length === 0) {
    firebase.initializeApp({
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    apiKey: "AIzaSyCnJsEhnaeS94HVYmb1hmxbjFuPyonK3nQ",
    authDomain: "superchat-7f6ec.firebaseapp.com",
    projectId: "superchat-7f6ec",
    storageBucket: "superchat-7f6ec.appspot.com",
    messagingSenderId: "693015840514",
    appId: "1:693015840514:web:7aea79d691042ac4ede41b",
    measurementId: "G-BCSKPD8Y60"
})
}


const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth); //hook returns object if user is logged in otherwise returns null

  return (
    <div className="App"> 
      <header>
        
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn /> /*if the user is defined show the ChatRoom otherwise show the SignIng button*/} 
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider(); //redux?
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

function SignOut() { //if we have a currentUSer return a button
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  //connecting the ref of the div 
  const dummy = useRef();


  const messagesRef = firestore.collection('messages'); //reference a firestore collection
  const query = messagesRef.orderBy('createdAt').limit(25); //query documents in a collection

  const [messages] = useCollectionData(query, {idField: 'id'}); //listen to data with a hook
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault(); //prevent re-rendering

    const { uid, photoURL } = auth.currentUser; //destructuring

    await messagesRef.add({ //create a new document in firestore
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });
    setFormValue(''); //reset formValue

    dummy.current.scrollIntoView({ behavior: 'smooth' }); //automatic scroll when sending msg
  }
//div ref dummy for the auto scroll down
  return (
    <>
      <div>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div> 
      </div>

      <form onSubmit={sendMessage} >
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'; //comparing the current id on the firestore document to the current user id, if they are equal current user sent

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}></img>
      <p>{text}</p>
    </div>
  );
}

export default App;
