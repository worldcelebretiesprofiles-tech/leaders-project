import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";

export const Route = createFileRoute("/dashboard/account")({
  component: AccountPage,
});

function AccountPage() {
  const { user, profile } = useAuth();

  return (
    <div className="p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6 text-zinc-100">Account Settings</h1>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800">
          <h3 className="text-base font-semibold leading-6 text-zinc-100">Profile Information</h3>
          <p className="mt-1 text-sm text-zinc-400">Personal details and application status.</p>
        </div>
        <div className="px-6 py-5">
          <dl className="divide-y divide-zinc-800">
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-400">Email address</dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-100 sm:col-span-2 sm:mt-0">{user?.email}</dd>
            </div>
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-400">System Role</dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-100 sm:col-span-2 sm:mt-0">
                <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-300 ring-1 ring-inset ring-zinc-700">
                  {profile?.role || 'CLIENT'}
                </span>
              </dd>
            </div>
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-400">Account Status</dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-100 sm:col-span-2 sm:mt-0 capitalize">
                {profile?.status?.toLowerCase() || 'Pending'}
              </dd>
            </div>
            <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm font-medium leading-6 text-zinc-400">User ID</dt>
              <dd className="mt-1 text-xs leading-6 text-zinc-500 sm:col-span-2 sm:mt-0 font-mono">
                {user?.id}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
