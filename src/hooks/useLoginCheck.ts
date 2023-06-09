/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiRequest, type ApiResponse, saveToken } from '../api/apiRequest';
import { userData } from '../redux/user/userSlice';

export function useLoginCheck (): {
  sendData: (data: Record<string, any>, event: React.ChangeEvent) => void
  message: string
} {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');

  const sendData = (
    data: Record<string, any>,
    event: React.ChangeEvent
  ): void => {
    event.preventDefault();

    if (data.username.length >= 3 && data.password.length >= 6) {
      const response = async function (): Promise<ApiResponse> {
        return await apiRequest(
          '/auth/login',
          'post',
          {
            username: data.username,
            password: data.password,
            lady: data.role === 'lady'
          },
          data.role
        );
      };

      response()
        .then((res): void => {
          if (res.data.statusCode === -20001) {
            setMessage('Na mail Vam je poslat link za verifikaciju!');
            return;
          }
          if (res.data.status === 'error') {
            setMessage('Pogresna lozinka ili korisnicko ime!');
            return;
          }
          dispatch(
            userData({
              id: res.data.id,
              username: res.data.username,
              token: res.data.token,
              role: res.data.role,
              photosDestination: `${
                process.env.REACT_APP_BASE_URL
              }/assets/photo/${
                res.data.role === 'lady' ? 'Lady' : 'Gentleman'
              }`,
              usersPhotosDestination: `${
                process.env.REACT_APP_BASE_URL
              }/assets/photo/${
                res.data.role === 'lady' ? 'Gentleman' : 'Lady'
              }`
            })
          );

          saveToken(res.data.role, res.data.token);

          navigate('/Home', { replace: true });
        })
        .catch(() => {
          setMessage('Something went wrong!');
        });
    }
  };
  return { sendData, message };
}
