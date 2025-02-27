import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface AnonymousToggleProps {
  isAnonymous: boolean;
  onChange: (value: boolean) => void;
}

const AnonymousToggle = ({ isAnonymous, onChange }: AnonymousToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="anonymous-mode"
        checked={isAnonymous}
        onCheckedChange={onChange}
      />
      <div className="flex items-center gap-1">
        <Label htmlFor="anonymous-mode">Submit anonymously</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                When enabled, your username will not be displayed publicly with
                your submission. Administrators and moderators will still be
                able to see who submitted the content.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default AnonymousToggle;
