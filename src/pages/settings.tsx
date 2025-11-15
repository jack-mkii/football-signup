import Head from "next/head";
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import CancelIcon from '@mui/icons-material/Cancel';

import { api } from "~/utils/api";
import { Toaster } from "~/components/toasts/Toaster";
import { useToast } from "~/components/toasts/UseToast";

import { type GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authConfig as authOptions } from "~/server/auth/config";
import { useEffect, useState } from "react";
import {type User } from "~/server/db/schema";
import { useRouter } from "next/router";
import Admin from "~/components/Admin";
import HomeButton from "~/components/HomeButton";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin?callbackUrl=/admin",
        permanent: false,
      },
    };
  }

  if (!session.user.isAdmin) {
    return {
      redirect: {
        destination: "/unauthorized",
        permanent: false,
      }
    }
  }

  return {
    props: {
      session,
    },
  };
};

export default function Settings() {
  const { toast } = useToast();
  const router = useRouter();

  const [admins, setAdmins] = useState<User[]>([]);
  const [name, setName] = useState<string>("");
  const [id, setId] = useState<string>("");

  const { data: users, refetch } = api.user.getAll.useQuery();

  const { mutate: setAdmin } = api.user.setAdmin.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully updated user to admin",
      });
      setName("");
      setId("");
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      refetch();
    },
    onError: (e) => {
      toast({
        variant: "destructive",
        title: "Something went wrong when assigning admin role",
        description: e.message,
      });
    }
  });

  useEffect(() => {
    setAdmins(users?.filter((user) => user.isAdmin) ?? []);
  }, [users]);

  const handleSelectChange = (event: SelectChangeEvent) => {
    setName(event.target.value);
    if (users) {
      const selectedUser = users?.find((user) => user.name === event.target.value);
      setId(selectedUser?.id ?? "");
    }
  }

  function handleSubmit(isAdmin: boolean) {
    if (name === "") {
      console.log("No valid user selected");
    } else {
      setAdmin({ userId: id, isAdmin });
    }
  }

  return (
    <>
      <Head>
        <title>ECSS London FC - Settings</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster />
      <main className="flex min-h-screen flex-col items-center justify-start bg-white">
        <div className="container flex flex-col items-start justify-center gap-10 px-6 py-16">
          {/* Header */}
          <h1 className="text-xl font-bold">Admin Settings</h1>

          {/* Control */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1 w-full">
              <FormControl fullWidth>
                <InputLabel id="other-select">Make someone admin</InputLabel>
                <Select
                  labelId="other-select"
                  value={name}
                  label="Make someone admin"
                  onChange={handleSelectChange}
                >
                  {users?.map((user) => {
                    return user.isAdmin ? null : (
                      <MenuItem key={user.id} value={user.name ?? ""}>{user.name}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button
                onClick={() => handleSubmit(true)}
                variant="contained"
                disabled={name === ""}
              >
                Make admin
              </Button>
            </div>
          </div>

          {/* Admin users */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-4 w-full bg-gray-100 p-4 rounded-md">
              {admins && admins.length > 0 && (
                <div className="flex flex-col gap-0-5 w-full">
                  {admins?.map((admin, index) => (
                    <Admin key={index} id={admin.id} name={admin.name ?? ""} onRemove={refetch} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <HomeButton className="justify-start" />
        </div>
      </main>
    </>
  );
}
