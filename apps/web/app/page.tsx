"use client";
import { useMutation, useQuery, Authenticated, Unauthenticated } from 'convex/react';
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { SignInButton, UserButton } from "@clerk/nextjs";
export default function Page() {
  const users = useQuery(api.users.getMany);
  const addUser = useMutation(api.users.add);
  return (
    <>
      <Authenticated>
         <UserButton />
        <div className="flex flex-col items-center justify-center h-screen">
          <p>apps/web</p>
          <Button onClick={() => addUser()}>Add User</Button>
          <div className="max-w-sm w-full mx-auto">
            {JSON.stringify(users, null, 2)}
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <SignInButton >Sign In</SignInButton>
      </Unauthenticated>
    </>
  )
}
// function Content() {
//   const messages = useQuery(api.messages.getForCurrentUser);
//   return <div>Authenticated content: {messages?.length}</div>;
// }