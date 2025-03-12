import { Server } from "socket.io";
import { MongoClient, Db, Collection } from "mongodb";

interface ChatMessage {
  message: string;
  userId?: string;
  username?: string;
  roomId?: string;
  timestamp: Date;
}

class SocketService {
  private _io: Server;
  private mongoClient!: MongoClient;
  private db!: Db;
  private messagesCollection!: Collection<ChatMessage>;

  constructor() {
    console.log("Init Socket Service...");
    this._io = new Server({
      cors: {
        // Allow connections from your IP address
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });
  }

  public async initialize() {
    // Connect to MongoDB
    await this.setupMongo();

    // Initialize Socket.IO listeners
    this.initListeners();
  }

  private async setupMongo() {
    try {
      // Connect to MongoDB (update the connection string as needed)
      this.mongoClient = new MongoClient("mongodb://localhost:27017");
      await this.mongoClient.connect();

      // Get database and collection references
      this.db = this.mongoClient.db("chatapp");
      this.messagesCollection = this.db.collection<ChatMessage>("messages");

      // Create indexes for better query performance
      await this.messagesCollection.createIndex({ timestamp: -1 });
      await this.messagesCollection.createIndex({ roomId: 1 });

      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      throw error; // Re-throw to handle in the calling function
    }
  }

  public async getRecentMessages(roomId?: string, limit = 50) {
    try {
      const query = roomId ? { roomId } : {};
      const messages = await this.messagesCollection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return messages;
    } catch (error) {
      console.error("Failed to fetch recent messages:", error);
      return [];
    }
  }

  public initListeners() {
    const io = this.io;
    console.log("Init Socket Listeners...");

    io.on("connect", (socket) => {
      console.log(`New Socket Connected: ${socket.id}`);

      // Join room event
      socket.on("room:join", (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      // Request history event
      socket.on("messages:history", async (roomId: string, callback) => {
        const messages = await this.getRecentMessages(roomId);
        callback(messages);
      });

      // Message event
      socket.on(
        "event:message",
        async ({
          message,
          userId,
          username,
          roomId,
        }: {
          message: string;
          userId?: string;
          username?: string;
          roomId?: string;
        }) => {
          console.log(
            `New Message Received: ${message} in room: ${roomId || "global"}`
          );

          try {
            // Create message document
            const chatMessage: ChatMessage = {
              message,
              userId,
              username,
              roomId,
              timestamp: new Date(),
            };

            // Store message in MongoDB
            await this.messagesCollection.insertOne(chatMessage);

            // Broadcast to room or all clients if no room specified
            if (roomId) {
              io.to(roomId).emit("message", chatMessage);
            } else {
              io.emit("message", chatMessage);
            }
          } catch (error) {
            console.error("Error handling message:", error);
            socket.emit("error", "Failed to process message");
          }
        }
      );

      // Disconnect event
      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }

  public async closeConnections() {
    if (this.mongoClient) {
      await this.mongoClient.close();
      console.log("MongoDB connection closed");
    }
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
