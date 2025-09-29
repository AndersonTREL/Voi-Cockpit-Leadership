import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function SocketHandler(req: unknown, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new ServerIO(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    })
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id)

      socket.on('join-room', (room) => {
        socket.join(room)
        console.log(`Client ${socket.id} joined room: ${room}`)
      })

      socket.on('leave-room', (room) => {
        socket.leave(room)
        console.log(`Client ${socket.id} left room: ${room}`)
      })

      socket.on('task-updated', (data) => {
        socket.broadcast.emit('task-updated', data)
      })

      socket.on('task-created', (data) => {
        socket.broadcast.emit('task-created', data)
      })

      socket.on('task-deleted', (data) => {
        socket.broadcast.emit('task-deleted', data)
      })

      socket.on('activity-created', (data) => {
        socket.broadcast.emit('activity-created', data)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  res.end()
}
