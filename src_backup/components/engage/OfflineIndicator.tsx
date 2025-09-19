"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useOfflineActions,
  getActionDescription,
} from "@/hooks/useOfflineActions";
import {
  WifiOff,
  Wifi,
  Clock,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const {
    isOnline,
    pendingActions,
    syncPendingActions,
    clearPendingActions,
    removePendingAction,
  } = useOfflineActions({
    onSync: (action) => {
      console.log("Action synced:", action);
    },
    onError: (action, error) => {
      console.error("Action failed to sync:", action, error);
    },
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncPendingActions();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearAll = () => {
    clearPendingActions();
    setShowDetails(false);
  };

  if (isOnline && pendingActions.length === 0) {
    return null; // Don't show indicator when online with no pending actions
  }

  return (
    <div className={className}>
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${!isOnline ? "text-red-600" : "text-orange-600"}`}
          >
            {isOnline ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}

            {!isOnline && <span className="text-sm">Offline</span>}

            {pendingActions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingActions.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              Connection Status
            </DialogTitle>
            <DialogDescription>
              {isOnline
                ? "You're online. Pending actions can be synced."
                : "You're offline. Actions will be queued until you're back online."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Connection Status */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span className="font-medium">
                    {isOnline ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pending Actions */}
            {pendingActions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending Actions ({pendingActions.length})
                  </CardTitle>
                  <CardDescription>
                    These actions will be synced when you&apos;re online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingActions.slice(0, 5).map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {getActionDescription(action.action)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(action.timestamp).toLocaleTimeString()}
                          {action.retries > 0 && ` • ${action.retries} retries`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {action.retries > 0 && (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePendingAction(action.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {pendingActions.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      ...and {pendingActions.length - 5} more
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {isOnline && pendingActions.length > 0 && (
                <Button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex-1"
                >
                  {isSyncing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </Button>
              )}

              {pendingActions.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {pendingActions.length === 0 && isOnline && (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">All actions are synced!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
