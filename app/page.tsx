export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Pipedrive MCP Server</h1>
      <p>
        This is a Model Context Protocol (MCP) server for Pipedrive CRM,
        deployable on Vercel.
      </p>
      <p>
        <strong>Endpoint:</strong> <code>/api/mcp</code>
      </p>
      <p>
        <a 
          href="https://github.com/Talentir/pipedrive-mcp-server"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </p>
    </main>
  );
}
