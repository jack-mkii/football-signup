import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { api } from "~/utils/api";
import Player from "~/components/Player";
import { Toaster } from "~/components/toasts/Toaster";
import { useToast } from "~/components/toasts/UseToast";

import { type GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authConfig as authOptions } from "~/server/auth/config";
import { useEffect, useState } from "react";
import AdminSignUp from "~/components/AdminSignUp";
import NextGameweek from "~/components/NextGameweek";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

export default function Home() {
  const { data: clientSession } = useSession();
  const { toast } = useToast();

  const [isSignedUp, setIsSignedUp] = useState<boolean>(false);
  const [name, setName] = useState<string>(clientSession?.user.name ?? "");

  const { data: signUps, refetch: refetch } = api.signUp.getAll.useQuery();
  const { mutate: signUp } = api.signUp.create.useMutation({
    onSuccess: () => {
      setIsSignedUp(true);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      refetch();
    },
    onError: (e) => {
      toast({
        variant: "destructive",
        title: "Something went wrong when signing up",
        description: e.message,
      });
    }
  });
  
  const players = signUps && signUps?.length > 10 ? signUps?.slice(0, 10) : signUps;
  const reserves = signUps && signUps?.length > 10 ? signUps?.slice(10) : [];

  useEffect(() => {
    if (signUps && clientSession?.user.id) {
      setIsSignedUp(hasSignUp(clientSession.user.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signUps, clientSession]);

  function handleSignUp() {
    if (!clientSession?.user.name) {
      console.log("No valid user session");
    } else {
      signUp({ userId: clientSession?.user.id, name });
    }
  }

  function hasSignUp(id: string | undefined) {
    if (id === undefined) return false;

    const signUp = signUps?.find((signUp) => signUp.userId == id);
    return signUp !== undefined;
  }

  return (
    <>
      <Head>
        <title>ECSS London FC - Signup</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster />
      <main className="flex min-h-screen flex-col items-center justify-start bg-white">
        <div className="container flex flex-col items-start justify-center gap-10 px-6 py-16">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-bold">ECSS London FC - Signup ⚽</h1>
            <NextGameweek />
          </div>

          {/* Control */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1 w-full">
              <p className="text-lg font-semibold">Name</p>
              <TextField
                required
                id="outlined-basic"
                label="Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSignedUp}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={handleSignUp} variant="contained" disabled={isSignedUp}>Sign Up</Button>
              {isSignedUp && (
                <div className="flex w-full">
                  <div className="flex w-full justify-center gap-1">
                    <CheckCircleIcon fontSize="small" className="text-green-600" />
                    <p className="text-green-600">You&apos;re signed up!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Admin */}
            {clientSession?.user.isAdmin && (
              <AdminSignUp sessionUserId={clientSession?.user.id} onSuccess={refetch} />
            )}
          </div>

          {/* Sign ups */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-4 w-full bg-gray-100 p-4 rounded-md">
              <p className="text-md font-semibold">Players ({players?.length ?? 0}/10)</p>
              {players && players.length > 0 && (
                <div className="flex flex-col gap-0-5 w-full">
                  {players?.map((player, index) => (
                    <Player
                      key={index}
                      id={player.id}
                      name={player.name}
                      isAdmin={clientSession?.user.isAdmin ?? false}
                      isCreator={clientSession?.user.id === player.userId}
                      onDelete={refetch}
                    />
                  ))}
                </div>
              )}
            </div>
            {reserves.length > 0 && (
              <div className="flex flex-col gap-4 w-full bg-gray-100 p-4 rounded-md">
                <p className="text-md font-semibold">Reserves</p>
                <div className="flex flex-col gap-0-5 w-full">
                  {reserves?.map((reserve, index) => (
                    <Player
                      key={index}
                      id={reserve.id}
                      name={reserve.name}
                      isAdmin={clientSession?.user.isAdmin ?? false}
                      isCreator={clientSession?.user.id === reserve.userId}
                      onDelete={refetch}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <LogOut />
        </div>
      </main>
    </>
  );
}

function LogOut() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Button
        onClick={sessionData ? () => void signOut() : () => void signIn()}
        variant="contained"
        sx={{ textTransform: 'none' }}
      >
        {sessionData ? "Log out" : "Log in"}
      </Button>
    </div>
  );
}
