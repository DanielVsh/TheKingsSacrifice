import {useGetPlayerDataQuery} from "../app/state/api/PlayerApi.ts";
import {setPlayer} from "../app/state/reducers/PlayerReducer.ts";
import {useEffect} from "react";
import {useDispatch} from "react-redux";


export const DashboardPage = () => {
  const dispatch = useDispatch();

  const { data, error, isLoading } = useGetPlayerDataQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data.</div>;

  useEffect(() => {
    if (data) {
      dispatch(setPlayer(data));
    }
  }, [data]);

  return (
    <>

    </>
  )

}