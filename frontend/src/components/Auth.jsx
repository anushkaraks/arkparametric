import { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

export default function Auth({ onLogin }) {
  const [view, setView] = useState('login'); // 'login' or 'signup'

  return (
    <>
      {view === 'login' ? (
        <Login 
          onLogin={onLogin} 
          onSwitchToSignUp={() => setView('signup')} 
        />
      ) : (
        <SignUp 
          onLogin={onLogin} 
          onSwitchToLogin={() => setView('login')} 
        />
      )}
    </>
  );
}
