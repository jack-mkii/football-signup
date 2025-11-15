import Head from "next/head";
import Button from '@mui/material/Button';
import { useRouter } from "next/router";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Unauthorized</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-start bg-white">
        <div className="container flex flex-col items-center justify-center gap-10 px-16 py-16">
          {/* Header */}
          <h1 className="text-xl font-bold">Unauthorized</h1>

          {/* Body */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-2 w-full">
              Oops! You do not have permission to view this page
            </div>
            <div className="flex justify-center w-full">
              <Button onClick={() => router.push("/")} variant="contained">Go home</Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
