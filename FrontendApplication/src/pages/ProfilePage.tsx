import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {useGetPlayerDataQuery} from "../app/state/api/PlayerApi.ts";
import {setPlayer} from "../app/state/reducers/PlayerReducer.ts";
import {LoadingElement} from "../components/LoadingElement.tsx";

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const { data, error, isLoading } = useGetPlayerDataQuery();

  useEffect(() => {
    if (data) {
      dispatch(setPlayer(data));
    }
  }, [data, dispatch]);

  if (isLoading) return <LoadingElement />;
  if (error) return <div className="text-red-500 text-center mt-6">Error loading data.</div>;

  return (
    <div className="w-full flex justify-center px-4 py-6">
      <div className="w-full max-w-3xl space-y-6">

        {/* Profile Header */}
        <div className="bg-zinc-900 rounded-2xl p-6 shadow-md">
          <h1 className="text-2xl font-bold mb-1">{data!.nickname}</h1>
          <p className="text-sm text-zinc-400">{data!.email}</p>
        </div>

        {/* Ratings */}
        <div className="bg-zinc-900 rounded-2xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Ratings</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <RatingCard label="Bullet" value={data!.bulletRating} />
            <RatingCard label="Blitz" value={data!.blitzRating} />
            <RatingCard label="Rapid" value={data!.rapidRating} />
            <RatingCard label="Classical" value={data!.classicalRating} />
          </div>
        </div>
      </div>
    </div>
  );
};


function RatingCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-zinc-800 rounded-xl p-4 text-center border border-zinc-700">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
