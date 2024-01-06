import React from "react";
import {useCreateAnonymousPlayerMutation} from "../app/state/api/PlayerApi.ts";
import {useDispatch} from "react-redux";
import {setPlayer} from "../app/state/reducers/PlayerReducer.ts";

interface RegistrationModalProps {

}

const RegistrationModal: React.FC<RegistrationModalProps> = () => {

  const [createAnonymousPlayer] = useCreateAnonymousPlayerMutation();
  const dispatch = useDispatch()

  const handleCreateAnonymousPlayer = () => {
    createAnonymousPlayer(undefined).then(value => {
        if ('data' in value) {
          const valueData = value.data as AnonymousPlayerResponse;
          dispatch(setPlayer(valueData))
        }
      }
    )
  }

  return (
    <div className={`flex space-x-10 text-4xl font-bold`}>
      <div className={`cursor-pointer hover:drop-shadow-lg`} onClick={handleCreateAnonymousPlayer}>Play as quest</div>
      <div className={`cursor-pointer hover:drop-shadow-lg`}>Register</div>
    </div>
  );
};

export default RegistrationModal;