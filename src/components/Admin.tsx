import { api } from "~/utils/api";
import CancelIcon from '@mui/icons-material/Cancel';
import { useToast } from "./toasts/UseToast";

interface Props {
  id: string;
  name: string;
  onRemove: () => void;
}

export default function Admin({
  id,
  name,
  onRemove
}: Props) {
  const { toast } = useToast();

  const { mutate: setAdmin } = api.user.setAdmin.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully removed user as admin",
      });
      onRemove();
    },
    onError: (e) => {
      toast({
        variant: "destructive",
        title: "Something went wrong when removing admin role",
        description: e.message,
      });
    }
  });


  function handleDelete() {
    setAdmin({ userId: id, isAdmin: false });
  }

  return (
    <div className="flex justify-between w-full p-2 border-b-1 border-gray-200 last:border-none"> 
      <div>{name}</div>
       <CancelIcon fontSize="small" onClick={handleDelete} className="text-gray-600 cursor-pointer hover:text-gray-800" />
    </div>
  );
}
