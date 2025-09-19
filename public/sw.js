// Clarity Done Service Worker
// Provides offline functionality and caching for the GTD productivity app

const CACHE_NAME = "clarity-done-v1";
const STATIC_CACHE_NAME = "clarity-done-static-v1";
const DYNAMIC_CACHE_NAME = "clarity-done-dynamic-v1";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/engage",
  "/manifest.json",
  // Add critical CSS and JS files here when available
];

// Routes that should work offline
const CACHED_ROUTES = [
  "/",
  "/dashboard",
  "/engage",
  "/auth/login",
  "/onboarding",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate the new service worker immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME
            )
            .map((name) => caches.delete(name))
        );
      })
      .then(() => {
        // Claim all clients to start controlling them immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip external requests (allow Supabase API calls)
  if (url.origin !== location.origin && !url.hostname.includes("supabase")) {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith("/api") || url.hostname.includes("supabase")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback strategy
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }

            // For cached routes, return the cached version
            const requestPath = url.pathname;
            if (CACHED_ROUTES.includes(requestPath)) {
              return caches.match(requestPath);
            }

            // Fallback to main page for other routes
            return caches.match("/");
          });
        })
    );
    return;
  }

  // Handle other assets (images, CSS, JS)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Handle background sync for offline task creation
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "task-sync") {
    event.waitUntil(syncTasks());
  }
});

// Background sync for tasks
async function syncTasks() {
  try {
    // Get offline tasks from IndexedDB
    const offlineTasks = await getOfflineTasks();

    if (offlineTasks.length === 0) {
      return;
    }

    console.log(`[SW] Syncing ${offlineTasks.length} offline tasks`);

    // Attempt to sync each task
    for (const task of offlineTasks) {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(task),
        });

        if (response.ok) {
          await removeOfflineTask(task.id);
          console.log(`[SW] Successfully synced task: ${task.title}`);
        }
      } catch (error) {
        console.error(`[SW] Failed to sync task: ${task.title}`, error);
      }
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
  }
}

// Helper functions for IndexedDB operations
async function getOfflineTasks() {
  // This would integrate with your app's IndexedDB implementation
  // For now, return empty array
  return [];
}

async function removeOfflineTask(taskId) {
  // This would remove the task from IndexedDB after successful sync
  console.log(`[SW] Removing synced task ${taskId} from offline storage`);
}

// Handle push notifications (future feature)
self.addEventListener("push", (event) => {
  console.log("[SW] Push message received");

  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: data.data,
    actions: [
      {
        action: "open",
        title: "Open App",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow("/dashboard"));
  }
});

// Handle app updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("[SW] Service worker loaded successfully");
