import { SettingsForm } from "../components/settings-form";

export const SettingsView = () => {
  return (
    <div className="flex min-h-screen flex-col bg-muted p-8">
      <div className="mx-auto w-full max-w-screen-md">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, appearance, and notification preferences
          </p>
        </div>

        <div className="mt-8">
          <SettingsForm />
        </div>
      </div>
    </div>
  );
};
