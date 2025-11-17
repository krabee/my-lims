import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold mb-4">
          Welcome to Lab Results Management
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Upload lab result documents, extract data using AI, and visualize
          trends over time.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Link
          href="/upload"
          className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Upload Results</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upload lab result documents (PDF or images) and extract data
            automatically.
          </p>
        </Link>

        <Link
          href="/results"
          className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Browse Results</h3>
          <p className="text-gray-600 dark:text-gray-400">
            View and search historical lab results by date, patient, or test
            type.
          </p>
        </Link>

        <Link
          href="/graphs"
          className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Visualize Trends</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Plot test values over time to track health trends and patterns.
          </p>
        </Link>
      </section>
    </div>
  );
}
