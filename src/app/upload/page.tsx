"use client";

/**
 * Upload Page
 * Main page for uploading lab result documents
 */

import { useState } from "react";
import { FileUpload } from "@/src/components/FileUpload";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function UploadPage() {
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  const handleUploadComplete = (labResultId: string) => {
    setUploadedId(labResultId);
  };

  return (
    <ErrorBoundary>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload Lab Results</h1>
          <p className="text-muted-foreground">
            Upload your lab result documents and let AI extract the data
            automatically.
          </p>
        </div>

        <FileUpload onUploadComplete={handleUploadComplete} />

        {uploadedId && (
          <Card>
            <CardHeader>
              <CardTitle>Success!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Your lab result has been uploaded and processed.</p>
              <div className="flex gap-4">
                <Link href={`/api/upload/status/${uploadedId}`} target="_blank">
                  <Button variant="outline">View Details</Button>
                </Link>
                <Link href="/results">
                  <Button>View All Results</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
}
