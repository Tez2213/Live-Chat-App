import http from "http";
import SocketService from "./services/socket.js";

async function bootstrap() {
  try {
    // Create HTTP server
    const httpServer = http.createServer();

    // Initialize Socket service
    const socketService = new SocketService();

    // Attach Socket.IO to HTTP server
    socketService.io.attach(httpServer);

    // Initialize Socket service (connects to MongoDB and sets up listeners)
    await socketService.initialize();

    // Start HTTP server
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on all interfaces on port ${PORT}`);
    });

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down...");
      await socketService.closeConnections();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
