import { NextRequest } from 'next/server'
import { Server as NetServer } from 'http'
import { Server as ServerIO } from 'socket.io'

export async function GET(req: NextRequest) {
  return new Response('Socket.IO server is running', { status: 200 })
}
