import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { markNotificationAsRead } from "@/lib/notificationUtils"; // Correct import path

// Define the Mentor interface (you should already have this in your types)
interface Mentor {
  id: string;
  name: string;
  user_id: string;
}

interface Notification {
  id: string;
  user_id: string | null;
  recipient_id: string | null;
  created_at: string;
  read?: boolean | null;
  is_read?: boolean | null;
  kind: string | null;
  title: string | null;
  body: string | null;
  payload: any;
  seen?: boolean | null;
}

interface MentorNotificationsPanelProps {
  mentor: Mentor; // Mentor as a prop
}

const MentorNotificationsPanel: React.FC<MentorNotificationsPanelProps> = ({ mentor }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession()
      .then(({ data }) => {
        const session = data?.session;
        if (session) {
          const mentorId = session.user?.id;
          setUserId(mentorId);
        } else {
          console.log("No active session");
        }
      })
      .catch((err) => {
        console.error("Error fetching session:", err);
      })
      .finally(() => {
        setLoading(false); // Ensure loading is set to false when request is complete
      });
  }, []);

useEffect(() => {
  const fetchNotifications = async () => {
    if (!mentor.user_id) return; // If there's no mentor user_id, skip

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", mentor.user_id) // Fetch notifications where recipient_id is mentor's user_id
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Set the notifications state
      setNotifications(data ?? []);
    } catch (error) {
      console.error("Error fetching mentor notifications:", error);
      toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" });
    }
  };

  fetchNotifications(); // Call the function to fetch notifications
}, [mentor.user_id]); // Only rerun when the mentor's user_id changes
    

  // Handle marking a notification as read
  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await markNotificationAsRead(notification.id); // Call the mark notification function
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read: true, is_read: true } : n
        )
      );
      window.dispatchEvent(new Event("notifications:updated")); // Dispatch an event to refresh the bell
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

return (
  <div className="mentor-notifications-panel">
    <Card>
      <CardHeader>
        <CardTitle>Mentor Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p>No new notifications.</p>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`mb-4 ${notification.read ? "opacity-50" : ""}`}
              role="button"
              onClick={() => handleMarkAsRead(notification)}
            >
              <CardHeader>
                <CardTitle>{notification.title ?? "No Title"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{notification.body}</p>
                <span className="text-xs text-muted">
                  {formatDistanceToNow(new Date(notification.created_at))} ago
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  </div>
);

};

export default MentorNotificationsPanel;
