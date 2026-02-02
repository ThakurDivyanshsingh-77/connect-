import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Download,
  GraduationCap,
  BookOpen,
  Calendar,
  FileImage,
  Loader2,
  ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { VerificationRequest } from "@/hooks/useVerification";

interface VerificationCardProps {
  request: VerificationRequest;
  onApprove?: (request: VerificationRequest, notes?: string) => Promise<boolean>;
  onReject?: (request: VerificationRequest, notes?: string) => Promise<boolean>;
  onGetSignedUrl?: (url: string) => Promise<string | null>;
  delay?: number;
}

export function VerificationCard({ 
  request, 
  onApprove, 
  onReject, 
  onGetSignedUrl,
  delay = 0 
}: VerificationCardProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  const handleViewId = async () => {
    if (!onGetSignedUrl) return;
    
    setLoadingPreview(true);
    const url = await onGetSignedUrl(request.idCardUrl);
    setPreviewUrl(url);
    setLoadingPreview(false);
    setShowPreview(true);
  };

  const handleDownload = async () => {
    if (!onGetSignedUrl) return;
    
    const url = await onGetSignedUrl(request.idCardUrl);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsApproving(true);
    await onApprove(request);
    setIsApproving(false);
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsRejecting(true);
    await onReject(request, rejectNotes);
    setIsRejecting(false);
    setShowRejectDialog(false);
    setRejectNotes("");
  };

  const isImage = request.idCardUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="bg-card rounded-2xl border border-border/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
      >
        {/* ID Card Preview */}
        <div className="h-48 bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative group">
          <div className="text-center">
            <FileImage className="w-16 h-16 text-muted-foreground/50 mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">
              {request.role === "junior" ? "College" : "Faculty"} ID Card
            </span>
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleViewId}
              disabled={loadingPreview}
            >
              {loadingPreview ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Preview
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold text-primary">
                {request.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{request.name}</h3>
                <p className="text-sm text-muted-foreground">{request.email}</p>
              </div>
            </div>
            <Badge variant={request.role === "teacher" ? "teacher" : "junior"}>
              {request.role === "junior" ? (
                <GraduationCap className="w-3 h-3 mr-1" />
              ) : (
                <BookOpen className="w-3 h-3 mr-1" />
              )}
              {request.role.charAt(0).toUpperCase() + request.role.slice(1)}
            </Badge>
          </div>

          <div className="space-y-2 mb-6">
            {request.batch && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="w-4 h-4 text-primary" />
                Batch {request.batch}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              Submitted {request.submittedAt}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="success" 
              className="flex-1"
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Approve
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={() => setShowRejectDialog(true)}
              disabled={isApproving || isRejecting}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>ID Card Preview - {request.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewUrl ? (
              isImage ? (
                <img 
                  src={previewUrl} 
                  alt="ID Card" 
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="text-center py-8">
                  <FileImage className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">PDF Document</p>
                  <Button onClick={() => window.open(previewUrl, "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load preview
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to reject {request.name}'s verification request?
            </p>
            <Textarea
              placeholder="Reason for rejection (optional)..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={3}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={isRejecting}
              >
                {isRejecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
