import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "VOI Cockpit - Leadership",
  description: "Professional task management system for VOI Leadership",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
