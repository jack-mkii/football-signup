import Button from '@mui/material/Button';
import { useRouter } from "next/router";
import { cn } from '~/utils/styleUtils';

interface Props {
  className?: string;
}

export default function HomeButton({ className }: Props) {
  const router = useRouter();

  return (
    <div className={cn("flex justify-center w-full", className)}>
      <Button onClick={() => router.push("/")} variant="contained">Go home</Button>
    </div>
  );
}
