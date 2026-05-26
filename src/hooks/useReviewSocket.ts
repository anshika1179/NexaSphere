import { useEffect, useState, useCallback } from "react";
import { getSocket } from "../services/socket";

export interface Annotation {
  id: string;
  line: number;
  text: string;
  author: string;
  timestamp: string;
  resolved: boolean;
}

export function useReviewSocket(
  roomId: string,
  user: { id: string; name: string; color: string }
) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeUsers, setActiveUsers] = useState<
    Record<string, { id: string; name: string; color: string; line?: number }>
  >({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onUserJoined = (data: { socketId: string; user: any }) => {
      setActiveUsers((prev) => ({ ...prev, [data.socketId]: data.user }));
    };

    const onAnnotationAdded = (data: any) => {
      setAnnotations((prev) => [
        ...prev,
        {
          id: data.id,
          line: data.line,
          text: data.text,
          author: data.author,
          timestamp: data.timestamp,
          resolved: false,
        },
      ]);
    };

    const onAnnotationResolved = (data: { annotationId: string }) => {
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === data.annotationId ? { ...a, resolved: true } : a
        )
      );
    };

    const onCursorSynced = (data: {
      socketId: string;
      line: number;
      col: number;
    }) => {
      setActiveUsers((prev) => {
        if (!prev[data.socketId]) return prev;
        return {
          ...prev,
          [data.socketId]: { ...prev[data.socketId], line: data.line },
        };
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("review:user_joined", onUserJoined);
    socket.on("review:annotation_added", onAnnotationAdded);
    socket.on("review:annotation_resolved", onAnnotationResolved);
    socket.on("review:cursor_synced", onCursorSynced);

    // Join room
    socket.emit("review:join_room", roomId, user);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("review:user_joined", onUserJoined);
      socket.off("review:annotation_added", onAnnotationAdded);
      socket.off("review:annotation_resolved", onAnnotationResolved);
      socket.off("review:cursor_synced", onCursorSynced);
      socket.emit("room:leave", roomId);
    };
  }, [roomId, user]);

  const addAnnotation = useCallback(
    (line: number, text: string) => {
      const id = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const payload = { id, line, text, author: user.name, timestamp };

      // Optimistic update
      setAnnotations((prev) => [...prev, { ...payload, resolved: false }]);

      getSocket().emit("review:annotation_add", { roomId, ...payload });
    },
    [roomId, user]
  );

  const resolveAnnotation = useCallback(
    (annotationId: string) => {
      setAnnotations((prev) =>
        prev.map((a) => (a.id === annotationId ? { ...a, resolved: true } : a))
      );
      getSocket().emit("review:annotation_resolve", { roomId, annotationId });
    },
    [roomId]
  );

  const syncCursor = useCallback(
    (line: number, col: number) => {
      getSocket().emit("review:cursor_sync", { roomId, line, col });
    },
    [roomId]
  );

  return {
    connected,
    annotations,
    activeUsers,
    addAnnotation,
    resolveAnnotation,
    syncCursor,
  };
}
