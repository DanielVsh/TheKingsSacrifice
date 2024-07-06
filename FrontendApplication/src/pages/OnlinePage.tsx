import {useNavigate} from "react-router-dom";
import {useCreateGameMutation} from "../app/state/api/GameApi.ts";
import {useSelector} from "react-redux";
import {RootState} from "../app/state/store.ts";
import {useState} from "react";

export const OnlinePage = () => {

  const user = useSelector((state: RootState) => state.playerReducer.player)
  const [createGame] = useCreateGameMutation()
  const navigate = useNavigate()
  const [timeMode, setTimeMode] = useState('time-range')
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)


  const handleCreateGame = (playerColor: string) => {
    if (user == null) return;

    if (playerColor === 'r') {
      Math.floor(Math.random() * 2) === 0 ? playerColor = 'w' : playerColor = 'b'
    }

    createGame({
      whitePlayer: playerColor === 'w' ? user.uuid : null,
      blackPlayer: playerColor === 'b' ? user.uuid : null,
      timeFormat: timeMode === 'time-range' ? `${minutes*60}+${seconds}` : 'unlimited'
    })
      .then(value => {
        if ('data' in value) {
          const valueData = value.data as GameResponse;
          navigate(`/play/online/${valueData.uuid}`, {replace: true});
        }
      })
  }

  const handleMinutesChange = (event: { target: { value: string; }; }) => {
    const newMinutes = parseInt(event.target.value);
    setMinutes(newMinutes >= 0 ? newMinutes : 0);
  };

  const handleSecondsChange = (event: { target: { value: string; }; }) => {
    const newSeconds = parseInt(event.target.value);
    setSeconds(newSeconds >= 0 ? newSeconds : 0);
  };

  const handleModeChange = (event: { target: { value: string; }; }) => {
    setTimeMode(event.target.value);
  };

  const commonButtonClassName = `${minutes === 0 && seconds === 0 && timeMode == 'time-range' 
    ? 'pointer-events-none opacity-50 cursor-not-allowed ' 
    : 'cursor-pointer'}`;

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen`}>
      <div className={`flex flex-col items-center`}>
        <form className="flex flex-col items-center">
          <label htmlFor="modes" className="block mb-2 text-lg font-bold ">
            Select time mode
          </label>
          <select
            id="modes"
            className={`bg-black w-[50vw] text-lg rounded-lg block p-2.5 cursor-pointer outline-none`}
            value={timeMode}
            onChange={handleModeChange}
          >
            <option value="unlimited">Unlimited</option>
            <option value="time-range">Time range</option>
          </select>
        </form>
        {timeMode === 'time-range' &&
            <div className={`flex flex-col items-center`}>
                <div>
                    <a className={`flex`}>Minutes per side: {minutes}</a>
                    <input type="range" min="0" max="180" value={minutes} step={minutes < 15 ? 1 : 5} onChange={handleMinutesChange}
                           className={`w-[60vw] accent-white cursor-pointer py-2`}/>
                </div>
                <div>
                    <a className={`flex`}>Seconds per move: {seconds}</a>
                    <input type="range" min="0" max="180" value={seconds} step={seconds < 15 ? 1 : 5} onChange={handleSecondsChange}
                           className={`w-[60vw] accent-white cursor-pointer`}/>
                </div>
                <div className={`flex flex-col items-center pt-4 text-6xl font-bold`}>
                  {minutes}m+{seconds}s
                </div>
            </div>
        }
      </div>
      <div className={`flex flex-wrap justify-center gap-4 text-4xl font-bold pt-12`}>
        <div className={commonButtonClassName}
             onClick={() => handleCreateGame("w")}>White
        </div>
        <div className={commonButtonClassName}
             onClick={() => handleCreateGame("r")}>Random
        </div>
        <div className={commonButtonClassName}
             onClick={() => handleCreateGame("b")}>Black
        </div>
      </div>
    </div>
  );
};