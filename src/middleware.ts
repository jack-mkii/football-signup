import { withAuth } from "next-auth/middleware";

// 🛑 FIX: Change 'export default' to 'export const middleware'
export const middleware = withAuth({
  pages: {
    signIn: "/api/auth/signin", 
  },
});

// The config remains the same
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|api/trpc|unauthorized).*)",
  ],
};