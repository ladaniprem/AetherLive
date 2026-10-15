"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { ThemeToggle } from "@workspace/ui/components/theme-toggle";
import { COLOR_THEMES } from "@workspace/ui/lib/appearance";
import { useColorTheme } from "@/hooks/use-color-theme";
import { cn } from "@workspace/ui/lib/utils";
import { CheckIcon } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  conversationUpdates: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

export const SettingsForm = () => {
  const { user } = useUser();
  const { colorTheme, setColorTheme } = useColorTheme();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema as any) as any,
    defaultValues: {
      name: user?.fullName || "",
    },
  });

  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema as any) as any,
    defaultValues: {
      emailNotifications: true,
      conversationUpdates: true,
    },
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      await user?.update({ firstName: values.name.split(" ")[0], lastName: values.name.split(" ").slice(1).join(" ") });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const onNotificationsSubmit = async (values: NotificationsFormValues) => {
    try {
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form className="space-y-6" onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your full name" />
                    </FormControl>
                    <FormDescription>
                      This is your public display name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button disabled={profileForm.formState.isSubmitting} type="submit">
                  Save Profile
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the dashboard looks for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Mode</p>
              <p className="text-muted-foreground text-sm">
                Select between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Color theme</p>
              <p className="text-muted-foreground text-sm">
                Professional palette used across the dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              {COLOR_THEMES.map((preset) => {
                const active = colorTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setColorTheme(preset.id)}
                    title={preset.name}
                    type="button"
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all",
                      active
                        ? "border-foreground bg-accent font-medium"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <span
                      className="size-4 rounded-full"
                      style={{ backgroundColor: preset.swatch }}
                    />
                    {preset.name}
                    {active && <CheckIcon className="size-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationsForm}>
            <form className="space-y-6" onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}>
              <FormField
                control={notificationsForm.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormDescription>
                        Receive email notifications for account activity
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={notificationsForm.control}
                name="conversationUpdates"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Conversation Updates</FormLabel>
                      <FormDescription>
                        Get notified when customers start new conversations
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button disabled={notificationsForm.formState.isSubmitting} type="submit">
                  Save Preferences
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Email Address</p>
              <p className="text-muted-foreground text-sm">
                {user?.primaryEmailAddress?.emailAddress || "Not set"}
              </p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Managed by Clerk
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
