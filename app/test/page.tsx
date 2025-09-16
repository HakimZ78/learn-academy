export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">
          Tailwind Test Page
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <p className="text-gray-800">
            If you can see this with a blue background, white card, and proper
            styling, Tailwind is working.
          </p>
        </div>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg">
          Test Button
        </button>
        <div className="mt-4 space-x-4">
          <span className="text-academy-primary bg-white px-4 py-2 rounded">
            Academy Primary
          </span>
          <span className="text-white bg-academy-primary px-4 py-2 rounded">
            BG Academy Primary
          </span>
        </div>
      </div>
    </div>
  );
}
