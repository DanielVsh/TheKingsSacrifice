import {useGetPlayerDataQuery} from "../app/state/api/PlayerApi.ts";
import {setPlayer} from "../app/state/reducers/PlayerReducer.ts";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {LoadingElement} from "../components/LoadingElement.tsx";


export const DashboardPage = () => {
  const dispatch = useDispatch();

  const { data, error, isLoading } = useGetPlayerDataQuery();

  useEffect(() => {
    if (data) {
      dispatch(setPlayer(data));
    }
  }, [data]);

  if (isLoading) return <LoadingElement/>;
  if (error) return <div>Error loading data.</div>;

  return (
    <>
      Welcome
    </>
  )

}