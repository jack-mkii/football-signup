import { api } from "~/utils/api";
import { useToast } from "./toasts/UseToast";
import { useState } from "react";

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';

interface Props {
  sessionUserId: string,
  onSuccess: () => void;
}

export default function AdminSignUp({
  sessionUserId,
  onSuccess
}: Props) {
  const { toast } = useToast();

  const [name, setName] = useState<string>("");
  const [id, setId] = useState<string>("");

  const { data: users } = api.user.getAll.useQuery();
  const { data: signUps } = api.signUp.getAll.useQuery();
  const { mutate: signUp } = api.signUp.create.useMutation({
      onSuccess: () => {
        setName("");
        setId("");
        onSuccess();
      },
      onError: (e) => {
        toast({
          variant: "destructive",
          title: `Something went wrong when signing up ${name}`,
          description: e.message,
        });
      }
    });

  const handleSelectChange = (event: SelectChangeEvent) => {
    setName(event.target.value);
    if (users) {
      const selectedUser = users?.find((user) => user.name === event.target.value);
      setId(selectedUser?.id ?? "");
    }
  }

  function hasSignUp(id: string | undefined) {
    if (id === undefined) return false;

    const signUp = signUps?.find((signUp) => signUp.userId == id);
    return signUp !== undefined;
  }

  function handleSignUp() {
    if (name === "") {
      console.log("No valid user selected");
    } else {
      signUp({ userId: id, name });
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1 w-full">
        <p className="text-lg font-semibold">Admin</p>
        <FormControl fullWidth>
          <InputLabel id="other-select">Sign up someone else</InputLabel>
          <Select
            labelId="other-select"
            value={name}
            label="Sign up someone else"
            onChange={handleSelectChange}
          >
            {users?.map((user) => {
              return hasSignUp(user.id) || user.id == sessionUserId ? null : (
                <MenuItem key={user.id} value={user.name ?? ""}>{user.name}</MenuItem>
              )
            })}
          </Select>
        </FormControl>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <Button
          onClick={() => handleSignUp()}
          variant="contained"
          disabled={name === ""}
        >
          Sign Them Up
        </Button>
      </div>
    </div>
  );
}
