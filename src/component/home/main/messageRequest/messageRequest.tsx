import { apiRequest } from '../../../../api/apiRequest'
import { Button } from '../../../layout/button/button'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTypedSelector } from '../../../../hooks/useTypedSelector'
import { selectUser, selectUserConversation } from '../../../../redux/user/userSlice'

interface RequestProps {
  destination: any
}

export function MessageRequest ({ destination }: RequestProps): JSX.Element {
  const user = useTypedSelector(selectUser)
  const conversations = useTypedSelector(selectUserConversation)

  const [message, setMessage] = useState({
    message: '',
    class: ''
  });
  const [connected, setConnected] = useState<boolean | undefined>(undefined);

  const navigation = useNavigate();

  useEffect(() => {
    const alreadyConnected = conversations?.some(
      conversation => conversation.id === destination.gentlemanId || destination.ladyId);
    setConnected(alreadyConnected);
  }, []);

  async function sendRequest (): Promise<void> {
    const body = {
      senderId: user.id,
      senderUsername: user.username,
      destinationId: user.role === 'lady' ? destination.gentlemanId : destination.ladyId,
      lady: user.role === 'lady'
    }
    const response = await apiRequest('/api/conversationRequest', 'post', body, user.role)
    if (response.status === 'error') { navigation('/', { replace: true }); return }
    if (response.data.statusCode === 200) { setMessage({ message: 'Zahtev je uspesno prosledjen!', class: 'succes-message' }); return }
    if (response.data.statusCode === 6001) { setMessage({ message: 'Zahtev je vec poslat!', class: 'important-message' }); return }
    setMessage({ message: 'Izgleda da imamo neki problem!', class: 'important-message' })
  }

  return (
    <>
      {
        (connected ?? false)
          ? <div>
            Vec ste povezani!
          </div>
          : <div>
            <h2>Hajde da se dopisujemo!</h2>
            <div>
                <p>
                    Ukoliko zelis da se dopisujes sa ovom osobom,
                    moras da joj posaljes zahtev koji ona mora da prihvati. Srecno!
                </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button implementClass='succes-button' title={'Posalji zahtev'} onClickFunction={sendRequest} />
            </div>

            <div>
                <p className={message.class}>{message.message}</p>
            </div>
        </div>
      }
    </>
  )
}
