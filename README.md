# PacketFlow - Network Simulation & Packet Analysis Platform

[![CI/CD](https://github.com/shubhamshahdev/PacketFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/shubhamshahdev/PacketFlow/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

PacketFlow is a production-grade network simulation and packet analysis platform that allows users to design network topologies, visualize packet flow, simulate routing behavior, monitor network performance, and learn networking concepts through an interactive drag-and-drop interface.

![Dashboard Screenshot](docs/screenshots/dashboard.png)

## Features

### Network Topology Builder
- Drag-and-drop interface with 8 device types: Router, Switch, PC, Server, Firewall, Wireless AP, Laptop, Printer
- Create connections with Ethernet, Fiber, Wireless, and Serial link types
- Configure device interfaces, IP addressing, and MAC addresses
- VLAN configuration and trunk ports
- Real-time device status indicators

### Packet Flow Simulation
- Animated packet visualization between devices
- Full OSI model layer inspection (Physical through Application)
- Protocol-level detail (TCP, UDP, ICMP, DNS, DHCP)
- Packet path tracing with hop-by-hop analysis
- TTL and fragmentation simulation

### Routing Simulation
- Static route configuration
- Dynamic routing protocols: RIP, OSPF
- Routing table visualization
- Next-hop and metric calculation
- Path finding with BFS algorithm

### Network Diagnostics
- **Ping**: ICMP echo with RTT, packet loss, and hop details
- **Traceroute**: Multi-probe hop discovery with timing
- **Port Scanner**: TCP/UDP port scanning with service detection

### Monitoring & Analytics
- Real-time network statistics dashboard
- Bandwidth usage charts
- Latency monitoring
- Packet throughput metrics
- Network event logging with severity levels

### Technical Features
- JWT-based authentication with role-based access control
- Dark/Light theme support
- Topology save/load with JSON import/export
- RESTful API with Swagger/OpenAPI documentation
- Responsive design for desktop and tablet
- Rate limiting and security headers (Helmet)

## Architecture

```
packetflow/
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── application/       # Use cases & services
│   │   ├── domain/            # Entities, value objects, repositories
│   │   ├── infrastructure/    # Database, security, logging, middleware
│   │   ├── interfaces/        # Controllers, routes, validators
│   │   ├── config/            # Configuration management
│   │   └── shared/            # Shared utilities
│   ├── prisma/                # Database schema & migrations
│   ├── tests/                 # Unit & integration tests
│   └── package.json
├── frontend/                  # React + TypeScript SPA
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route pages
│   │   ├── store/             # Redux Toolkit state management
│   │   ├── services/          # API client & interceptors
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility functions
│   ├── public/                # Static assets
│   └── package.json
├── docker/                    # Docker configurations
├── .github/workflows/         # CI/CD pipelines
├── docs/                      # Documentation & screenshots
├── docker-compose.yml         # Container orchestration
└── README.md
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Redux Toolkit, Recharts, DnD Kit |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 16 |
| **Auth** | JWT (JSON Web Tokens), bcrypt |
| **API Docs** | Swagger/OpenAPI 3.0 |
| **Testing** | Jest, Vitest, Supertest |
| **CI/CD** | GitHub Actions |
| **Container** | Docker, Docker Compose |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shubhamshahdev/PacketFlow.git
   cd packetflow
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

3. **Frontend setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api
   - Swagger Docs: http://localhost:3000/api-docs

### Docker Setup

```bash
docker-compose up -d
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | API server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/packetflow` |
| `JWT_SECRET` | JWT signing secret | (change in production) |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `BCRYPT_SALT_ROUNDS` | Password hash rounds | `12` |

## API Documentation

Full API documentation is available via Swagger UI at `/api-docs` when the server is running.

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/profile` | Get user profile |
| GET | `/api/topologies` | List topologies |
| POST | `/api/topologies` | Create topology |
| GET | `/api/topologies/:id` | Get topology |
| PUT | `/api/topologies/:id` | Update topology |
| DELETE | `/api/topologies/:id` | Delete topology |
| POST | `/api/topologies/:id/ping` | Simulate ping |
| POST | `/api/topologies/:id/traceroute` | Simulate traceroute |
| POST | `/api/topologies/:id/port-scan` | Simulate port scan |
| POST | `/api/topologies/:id/packet-flow` | Get packet flow |
| GET | `/api/topologies/:id/statistics` | Get network stats |
| GET | `/api/topologies/:id/events` | Get event logs |
| GET | `/api/health` | Health check |

## Testing

```bash
# Backend tests
cd backend && npm test
npm run test:coverage

# Frontend tests
cd frontend && npm test
npm run test:coverage
```

## Screenshots

*Screenshots available in `docs/screenshots/`*

## Project Status

This project is actively maintained and open to contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
"# PacketFlow" 
