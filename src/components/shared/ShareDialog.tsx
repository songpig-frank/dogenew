import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { incrementShareCount } from "@/lib/social";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Check,
} from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  url: string;
}

const ShareDialog = ({
  open,
  onOpenChange,
  title,
  description,
  url,
}: ShareDialogProps) => {
  const [copied, setCopied] = React.useState(false);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || ""}\n\n${url}`)}`,
  };

  const handleShare = async (platform: keyof typeof shareUrls) => {
    try {
      // First open share window
      const shareWindow = window.open(
        shareUrls[platform],
        "_blank",
        "width=600,height=400",
      );

      // Then increment share count if URL contains submission ID
      if (url.includes("/submissions/")) {
        const submissionId = url.split("/").pop();
        if (submissionId) {
          await incrementShareCount(submissionId);
        }
      }

      // Close dialog if window opened
      if (shareWindow) {
        shareWindow.focus();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onOpenChange(false);
      }, 2000);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        description="Share this content on social media"
      >
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => handleShare("facebook")}
          >
            <Facebook className="h-4 w-4" />
            Facebook
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => handleShare("twitter")}
          >
            <Twitter className="h-4 w-4" />
            Twitter
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => handleShare("linkedin")}
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => handleShare("email")}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 col-span-2"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <LinkIcon className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
