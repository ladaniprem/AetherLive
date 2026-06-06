import {useQuery} from 'convex/react';
// @ts-expect-error -- Workspace generated Convex API path may not be resolvable by local TS server.
import {api} from "@workspace/backend/convex/_generated/api";

export default function Page() {
  const users = useQuery(api.users.getMany);
  return (
        <div className="flex flex-col items-center justify-center h-screen">
        <p>apps/web</p>
        {JSON.stringify(users)}
        </div>
  )

}
