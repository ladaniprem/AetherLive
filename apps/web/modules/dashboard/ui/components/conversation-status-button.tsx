import { Hint } from "@workspace/ui/components/hint";
import { Doc } from "@workspace/backend/_generated/dataModel"
import { Button } from "@workspace/ui/components/button";
import { ArrowRightIcon, ArrowUpIcon, CheckIcon, Loader2Icon } from "lucide-react";

export const ConversationStatusButton = ({
  status,
  onClick,
  disabled,
  loading,
}: {
  status: Doc<"conversations">["status"];
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) => {
  const icon = loading ? (
    <Loader2Icon className="animate-spin" />
  ) : status === "resolved" ? (
    <CheckIcon />
  ) : status === "escalated" ? (
    <ArrowUpIcon />
  ) : (
    <ArrowRightIcon />
  );

  if (status === "resolved") {
    return (
      <Hint text="Mark as unresolved">
        <Button disabled={disabled} onClick={onClick} size="sm" variant="tertiary">
          {icon}
          Resolved
        </Button>
      </Hint>
    );
  }

  if (status === "escalated") {
    return (
      <Hint text="Mark as resolved">
        <Button disabled={disabled} onClick={onClick} size="sm" variant="warning">
          {icon}
          Escalated
        </Button>
      </Hint>
    );
  }

  return (
    <Hint text="Mark as escalated">
      <Button disabled={disabled} onClick={onClick} size="sm" variant="destructive">
        {icon}
        Unresolved
      </Button>
    </Hint>
  );
};
