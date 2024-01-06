import {useParams} from "react-router-dom";
import {PlayComponent} from "../components/PlayComponent.tsx";
import {LoadingElement} from "../components/LoadingElement.tsx";
import {NotFoundPage} from "./NotFoundPage.tsx";
import axios from "axios";
import {backendIp} from "../app/config/backend.ts";
import {useEffect, useState} from "react";
import {WaitingRoomPage} from "./WaitingRoomPage.tsx";

export const PlayPage = () => {
  const {id} = useParams();
  const gameID: string = id as string;

  const [data, setData] = useState<GameResponse | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);


  useEffect(() => {
    axios.get(`${backendIp}/api/v1/game/${gameID}`)
      .then((response) => {
        setData(response.data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsError(true);
        setIsLoading(false);
      });
  }, [gameID]);

  if (isLoading) return <LoadingElement/>
  if (isError) return <NotFoundPage/>

  return (
    <>
      {data?.whitePlayer && data?.blackPlayer
        ? data && <PlayComponent {...data} />
        : data && <WaitingRoomPage {...data} />
      }
    </>
  )
};