/**
 * Results Page (Placeholder)
 * Will be implemented in Phase 4: User Story 2
 */

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Lab Results</h1>
        <p className="text-muted-foreground">
          Browse and search historical lab results
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This feature will be available in the next phase of development.
          </p>
          <p>You will be able to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Browse all lab results</li>
            <li>Search by patient name or test type</li>
            <li>Filter by date range</li>
            <li>View detailed test results</li>
          </ul>
          <Link href="/upload">
            <Button>Upload More Results</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
