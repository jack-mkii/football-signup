import { api } from "~/utils/api";
import CancelIcon from '@mui/icons-material/Cancel';
import { useToast } from "./toasts/UseToast";

interface Props {
  id: string;
  name: string;
  isAdmin: boolean;
  isCreator: boolean;
  onDelete: () => void;
}

export default function Player({
  id,
  name,
  isAdmin,
  isCreator,
  onDelete
}: Props) {
  const deleteMutation = api.signUp.delete.useMutation();
  const { toast } = useToast();

  const canDelete = isAdmin ? true : isCreator;

  function handleDelete() {
    deleteMutation.mutate(
      {
        id: id,
      },
      {
        onSuccess: () => {
          toast({
            title: "Signup deleted",
            description: "Successfully deleted signup",
          });
          onDelete();
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Something went wrong when deleting",
            description: error.message,
          });
        }
      }
    );
  }

  return (
    <div className="flex justify-between w-full p-2 border-b-1 border-gray-200 last:border-none"> 
      <div>{name}</div>
      {canDelete && <CancelIcon fontSize="small" onClick={handleDelete} className="text-gray-600 cursor-pointer hover:text-gray-800" />}
    </div>
  );
}
