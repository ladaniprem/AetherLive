"use client";
import { useMutation } from 'convex/react';
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
export default function Page() {
  // const users = useQuery(api.users.getMany);
  const addUser = useMutation(api.users.add);
  return (
    <>
         <UserButton />
         <OrganizationSwitcher hidePersonal/>
        <div className="flex flex-col items-center justify-center h-screen">
          <p>apps/web</p>
          <Button onClick={() => addUser()}>Add User</Button>
        </div>
    </>
  )
}
// function Content() {
//   const messages = useQuery(api.messages.getForCurrentUser);
//   return <div>Authenticated content: {messages?.length}</div>;
// }