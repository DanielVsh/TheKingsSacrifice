import React, { useState } from 'react';
import { PlayerVsBotPage } from './PlayerVsBotPage.tsx';
import BotSelector, {Bot} from "../components/BotSelector.tsx";


export const BotSelectPage: React.FC = () => {
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  if (selectedBot) {
    return <PlayerVsBotPage bot={selectedBot} playerColor={'white'} />;
  }

  return (
    <BotSelector onSelect={setSelectedBot}/>
  );
};
