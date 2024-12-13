import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/api/v1/auth/google', {
        credential: credentialResponse.credential
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        login(response.data.data.user);
        navigate('/home');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Google login failed. Please try again.');
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => {
        toast.error('Google login failed');
      }}
      useOneTap={false}
      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
    />
  );
};

export default GoogleLoginButton; 