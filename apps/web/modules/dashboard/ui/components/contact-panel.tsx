"use client";
import Bowser from "bowser";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils";
import { api } from "@workspace/backend/_generated/api";
import { Id } from "@workspace/backend/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useQuery } from "convex/react";
import { ClockIcon, GlobeIcon, MailIcon, MonitorIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

type InfoItem = {
  label: string;
  value: string | React.ReactNode;
  className?: string;
};

type InfoSection = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: InfoItem[];
};

export const ContactPanel = () => {
  const params = useParams();
  const conversationId = params.conversationId as (Id<"conversations"> | null);

  const contactSession = useQuery(api.private.contactSessions.getOneByConversationId, 
    conversationId ? {
      conversationId,
    } : "skip",
  );

  const parseUserAgent = useMemo(() => {
    return (userAgent?: string) => {
      if (!userAgent) {
        return { browser: "Unknown", os: "Unknown", device: "Unknown" };
      }

      const browser = Bowser.getParser(userAgent);
      const result = browser.getResult();

      let browserName = result.browser.name || "";
      let browserVersion = result.browser.version || "";
      let osName = result.os.name || "";
      let osVersion = result.os.version || "";

      // Fallback for reduced/frozen or non-standard UA strings Bowser can't parse
      if (!browserName) {
        const edge = userAgent.match(/Edg\/([\d.]+)/);
        const chrome = userAgent.match(/Chrome\/([\d.]+)/);
        const firefox = userAgent.match(/Firefox\/([\d.]+)/);
        const safari = userAgent.match(/Version\/([\d.]+).*Safari/);
        if (edge) {
          browserName = "Microsoft Edge"; browserVersion = edge[1] ?? "";
        } else if (chrome) {
          browserName = "Chrome"; browserVersion = chrome[1] ?? "";
        } else if (firefox) {
          browserName = "Firefox"; browserVersion = firefox[1] ?? "";
        } else if (safari) {
          browserName = "Safari"; browserVersion = safari[1] ?? "";
        }
      }
      if (!osName) {
        const win = userAgent.match(/Windows NT ([\d.]+)/);
        const mac = userAgent.match(/Mac OS X ([\d_]+)/);
        const android = userAgent.match(/Android ([\d.]+)/);
        const ios = userAgent.match(/OS ([\d_]+) like Mac OS X/);
        if (win) {
          osName = "Windows"; osVersion = win[1] ?? "";
        } else if (/iPhone|iPad|iPod/.test(userAgent)) {
          osName = "iOS"; osVersion = (ios?.[1] ?? "").replace(/_/g, ".");
        } else if (mac) {
          osName = "macOS"; osVersion = (mac[1] ?? "").replace(/_/g, ".");
        } else if (android) {
          osName = "Android"; osVersion = android[1] ?? "";
        } else if (/Linux/.test(userAgent)) {
          osName = "Linux";
        }
      }

      return {
        browser: browserName || "Unknown",
        browserVersion,
        os: osName || "Unknown",
        osVersion,
        device: result.platform.type || "desktop",
        deviceVendor: result.platform.vendor || "",
        deviceModel: result.platform.model || "",
      };
    };
  }, []);

  const userAgentInfo = useMemo(() => 
    parseUserAgent(contactSession?.metadata?.userAgent), 
  [contactSession?.metadata?.userAgent, parseUserAgent]);

  const countryInfo = useMemo(() => {
    return getCountryFromTimezone(contactSession?.metadata?.timezone);
  }, [contactSession?.metadata?.timezone]);

  const accordionSections = useMemo<InfoSection[]>(() => {
    if (!contactSession?.metadata) {
      return [];
    }

    return [
      {
        id: "device-info",
        icon: MonitorIcon,
        title: "Device Information",
        items: [
          {
            label: "Browser",
            value:
              userAgentInfo.browser + 
                (userAgentInfo.browserVersion
                  ? ` ${userAgentInfo.browserVersion}`
                  : ""
                ),
          },
          {
            label: "OS",
            value:
              userAgentInfo.os +
                (userAgentInfo.osVersion ? ` ${userAgentInfo.osVersion}` : ""),
          },
          {
            label: "Device",
            value:
              userAgentInfo.device +
                (
                  userAgentInfo.deviceModel
                    ? ` - ${userAgentInfo.deviceModel}`
                    : ""
                ),
              className: "capitalize"
          },
          {
            label: "Screen",
            value: contactSession.metadata.screenResolution,
          },
          {
            label: "Viewport",
            value: contactSession.metadata.viewportSize,
          },
          {
            label: "Cookies",
            value: contactSession.metadata.cookieEnabled ? "Enabled" : "Disabled"
          },
        ],
      },
      {
        id: "location-info",
        icon: GlobeIcon,
        title: "Location & Language",
        items: [
          ...(countryInfo
            ? [
              {
                label: "Country",
                value: (
                  <span>
                    {countryInfo.name}
                  </span>
                )
              }
            ]
            : []
          ),
          {
            label: "Language",
            value: contactSession.metadata.language,
          },
          {
            label: "Timezone",
            value: contactSession.metadata.timezone,
          },
          {
            label: "UTC Offset",
            value: contactSession.metadata.timezoneOffset,
          }
        ]
      },
      {
        id: "section-details",
        title: "Section details",
        icon: ClockIcon,
        items: [
          {
            label: "Session Started",
            value: new Date(
              contactSession._creationTime
            ).toLocaleString(),
          }
        ],
      }
    ];
  }, [contactSession, userAgentInfo, countryInfo]);

  if (contactSession === undefined) {
    return (
      <div className="flex h-full w-full flex-col gap-2 p-4">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-3 w-40 rounded bg-muted" />
      </div>
    );
  }

  if (contactSession === null) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-medium text-sm">No contact selected</p>
        <p className="text-muted-foreground text-xs">
          Open a conversation to see visitor details here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden bg-background text-foreground">
      <div className="flex shrink-0 flex-col gap-y-4 p-4">
        <div className="flex min-w-0 items-center gap-x-2">
          <DicebearAvatar
            badgeImageUrl={
              countryInfo?.code
                ? getCountryFlagUrl(countryInfo.code)
                : undefined
            }
            seed={contactSession._id}
            size={42}
          />
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-0 items-center gap-x-2">
              <h4 className="min-w-0 flex-1 truncate">
                {contactSession.name}
              </h4>
            </div>
            <p className="truncate text-muted-foreground text-sm" title={contactSession.email}>
              {contactSession.email}
            </p>
          </div>
        </div>
        <Button asChild className="w-full" size="lg">
          <Link href={`mailto:${contactSession.email}`}>
            <MailIcon />
            <span>Send Email</span>
          </Link>
        </Button>
      </div>

      <div>
        {contactSession.metadata && (
          <Accordion
            className="w-full rounded-none border-y"
            collapsible
            type="single"
          >
            {accordionSections.map((section) => (
              <AccordionItem
                className="rounded-none outline-none has-focus-visible:z-10 has-focus-visible:border-ring has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
                key={section.id}
                value={section.id}
              >
                <AccordionTrigger
                  className="flex w-full flex-1 cursor-pointer items-start justify-between gap-4 rounded-none bg-accent px-5 py-4 text-left font-medium text-sm outline-none transition-all hover:bg-accent/60 hover:no-underline active:bg-accent/40 disabled:pointer-events-none disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <section.icon className="size-4 shrink-0" />
                    <span>{section.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="overflow-hidden px-5 py-4">
                  <div className="min-w-0 space-y-2 text-sm">
                    {section.items.map((item) => (
                      <div className="flex min-w-0 justify-between gap-3" key={`${section.id}-${item.label}`}>
                        <span className="shrink-0 text-muted-foreground">
                          {item.label}:
                        </span>
                        <span className={`min-w-0 text-right break-all ${item.className ?? ""}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};
