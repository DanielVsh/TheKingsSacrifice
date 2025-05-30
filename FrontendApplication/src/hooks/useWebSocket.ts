import {useEffect, useState} from 'react';
import {Client, IMessage, Stomp} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {backendIp} from "../app/config/backend.ts";

type TopicHandler = {
  topic: string;
  handler: (body: any) => void;
};

type SendOptions = {
  destination: string;
  body: any;
};

export function useWebSocket(topicHandlers: TopicHandler[]) {
  const [stompClient, setStompClient] = useState<Client | null>(null);;

  function webSocketConnection() {
    const sock = new SockJS(`${backendIp}/ws`);
    const client = Stomp.over(sock);

    setStompClient(client)
    client.debug = () => {};

    const onConnect = () => {
      topicHandlers.forEach(({topic, handler}) => {
        client.subscribe(`/topic` + topic, (message: IMessage) => {
          handler(message.body);
        });
      })
    }

    client.connect({}, onConnect);

    return client;
  }

  useEffect(() => {
    const client = webSocketConnection();

    return () => {
      client.disconnect();
    };
  }, []);

  const sendMessage = ({ destination, body}: SendOptions) => {
    stompClient?.publish({
      destination: `/app` + destination,
      body: body,
    });
  };

  return { sendMessage };
}