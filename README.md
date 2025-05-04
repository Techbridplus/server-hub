# Server Hub

A modern server management and communication platform built with Next.js and Socket.io.

## Features

- Real-time member status updates
- One-to-one chat with real-time messaging
- Audio and video calling
- Role-based member management (Admin, Moderator, Member)
- Server privacy controls
- Modern and responsive UI

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/server-hub.git
cd server-hub
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install Socket.io server dependencies
cd socket-server
npm install
cd ..
```

3. Set up environment variables:
```bash
# Root directory (.env)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Socket server directory (socket-server/.env)
SOCKET_PORT=3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

Run both the Next.js app and Socket server:

```bash
npm run dev
```

This will start:
- Next.js development server at http://localhost:3000
- Socket.io server at http://localhost:3001

### Production

Build and start the application:

```bash
npm run build
npm start
```

## Project Structure

- `/src` - Next.js application code
- `/socket-server` - Socket.io server for real-time features
- `/prisma` - Database schema and migrations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request (granted)

## License
This project is licence under the MIT License - see the [LICENSE](LICENSE) file for details.
your project have issue in middleware please give me access to code.

tghis ;is readme file .lk
