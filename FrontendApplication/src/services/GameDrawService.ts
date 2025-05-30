import {GameDrawRequest} from "../app/interfaces/IGame.ts";
import {SoundService} from "./SoundService.ts";


export type DrawServiceParams = {
  player: RegisteredPlayerResponse;
  onDrawRequested: (request: GameDrawRequest) => void;
  onDrawAccepted?: () => void;
  onDrawRejected?: () => void;
  sendMessage: (args: { destination: string; body: string }) => void;
  gameId: string;
};

export function createDrawService({
                                    player,
                                    onDrawRequested,
                                    onDrawAccepted,
                                    onDrawRejected,
                                    sendMessage,
                                    gameId,
                                  }: DrawServiceParams) {
  const handleDrawRequest = (drawRequest: GameDrawRequest) => {
    switch (drawRequest.status) {
      case 'REQUESTED':
        if (player.uuid === drawRequest.toPlayer.uuid) {
          onDrawRequested(drawRequest);
          SoundService.play('notify')
        }
        break;

      case 'ACCEPTED':
        onDrawAccepted?.();
        break;

      case 'REJECTED':
        onDrawRejected?.();
        break;
    }
  };

  const sendDrawRequest = (drawRequest: GameDrawRequest) => {
    sendMessage({
      destination: `/game/${gameId}/draw/request`,
      body: JSON.stringify(drawRequest),
    });
  };

  const respondToDrawRequest = (request: GameDrawRequest, status: 'ACCEPTED' | 'REJECTED') => {
    sendMessage({
      destination: `/game/${gameId}/draw/request`,
      body: JSON.stringify({
        ...request,
        status,
      }),
    });
  };

  return {
    handleDrawRequest,
    sendDrawRequest,
    acceptDraw: (request: GameDrawRequest) => respondToDrawRequest(request, 'ACCEPTED'),
    rejectDraw: (request: GameDrawRequest) => respondToDrawRequest(request, 'REJECTED'),
  };
}
