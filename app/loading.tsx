export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="loading-spinner mx-auto"></div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Carregando CEO SYNC</h2>
          <p className="text-muted-foreground">Preparando seu ambiente corporativo...</p>
        </div>
      </div>
    </div>
  )
}
