/**
 * Graphs Page (Placeholder)
 * Will be implemented in Phase 5: User Story 3
 */

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function GraphsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Visualize Trends</h1>
        <p className="text-muted-foreground">
          Plot test values over time to track health trends
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This feature will be available in a future phase of development.
          </p>
          <p>You will be able to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Select test types to visualize</li>
            <li>View trends over time with interactive graphs</li>
            <li>See reference ranges highlighted</li>
            <li>Identify abnormal values easily</li>
          </ul>
          <Link href="/upload">
            <Button>Upload Lab Results</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
