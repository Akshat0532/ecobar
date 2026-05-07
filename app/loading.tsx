export default function LoadingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-24 text-center">
      <div className="space-y-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] p-10 shadow-apple">
        <div className="h-10 w-48 animate-pulse rounded-full bg-[#D2D2D7] dark:bg-[#38383A]" />
        <div className="space-y-3">
          <div className="h-4 w-72 animate-pulse rounded-full bg-[#D2D2D7] dark:bg-[#38383A]" />
          <div className="h-4 w-56 animate-pulse rounded-full bg-[#D2D2D7] dark:bg-[#38383A]" />
        </div>
        <div className="mx-auto mt-6 h-12 w-32 animate-pulse rounded-full bg-[#D2D2D7] dark:bg-[#38383A]" />
      </div>
    </main>
  );
}
