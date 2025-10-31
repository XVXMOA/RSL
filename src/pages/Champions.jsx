import ChampionTable from '../components/champions/ChampionTable.jsx';

export default function ChampionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Champion Arsenal</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Search, filter, and document every warrior in your collection.
        </p>
      </div>
      <ChampionTable />
    </div>
  );
}
