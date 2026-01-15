#!/bin/bash

set -e

echo "🚀 Starting Sheebah Patient Timeline System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start infrastructure services
echo "📦 Starting infrastructure services (Postgres, MongoDB, Redis, Mock Vitals)..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Seed MongoDB if needed
echo "🌱 Seeding MongoDB..."
docker exec -i sheebah-timeline-mongodb mongosh pacs --quiet < infra/mongodb/seed-manual.js || echo "MongoDB seeding completed or already seeded"

# Check if services are healthy
echo "🔍 Checking service health..."
docker-compose ps

# Setup backend
echo "🔧 Setting up backend..."
cd backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/registry?schema=public"
MONGODB_URI="mongodb://localhost:27017/pacs"
REDIS_URL="redis://localhost:6379"
VITALS_SERVICE_URL="http://localhost:3001"
PORT=3000
EOF
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Run Prisma migrations (if needed)
echo "🗄️  Running database migrations..."
npx prisma migrate deploy || npx prisma db push

cd ..

# Setup frontend
echo "🔧 Setting up frontend..."
cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the backend: cd backend && npm run dev"
echo "   2. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Services will be available at:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:3000"
echo "   - API Docs: http://localhost:3000/docs"
echo "   - Mock Vitals: http://localhost:3001"
echo ""
echo "🛑 To stop infrastructure: docker-compose down"
