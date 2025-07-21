import { GoogleOAuthProvider } from '@react-oauth/google';

import RootProvider from '@/app/RootProvider';

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <RootProvider />
    </GoogleOAuthProvider>
  );
};

export default App;
