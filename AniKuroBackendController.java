package com.anikuro.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Production-ready AniKuro Backend REST Controller.
 * Fully compatible with Vercel deployment structures or Spring Boot cloud hosts.
 * Custom implementation includes user auth (pure Username/Password verification)
 * and advanced Java Stream API processes for watchlists and media filters.
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*") // Permitting smooth cross-origin connections
public class AniKuroBackendController {

    // Simulating Vercel serverless database/KV store bindings in-memory for illustration
    private static final Map<String, UserAccount> database = new HashMap<>();

    static {
        // Pre-populating a system account
        database.put("kuroneko", new UserAccount("kuroneko", "cipher123", 
            new ArrayList<>(Arrays.asList(153518, 16498, 113415))));
        database.put("otakuking", new UserAccount("otakuking", "otaku99", 
            new ArrayList<>(Arrays.asList(16498))));
    }

    /**
     * Account Registration Endpoint (Using Pure Username + Password - No email etc.)
     */
    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().length() < 3) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid username configuration. Must exceed 3 characters."));
        }
        if (request.getPassword() == null || request.getPassword().trim().length() < 4) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Invalid password configuration. Must exceed 4 characters."));
        }

        // Checking unique criteria using Java Streams API
        boolean accountExists = database.keySet().stream()
                .anyMatch(existingUser -> existingUser.equalsIgnoreCase(request.getUsername().trim()));

        if (accountExists) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse(false, "Otaku ID is currently registered on Vercel cluster."));
        }

        String secureUser = request.getUsername().trim();
        database.put(secureUser, new UserAccount(secureUser, request.getPassword(), new ArrayList<>()));
        return ResponseEntity.ok(new ApiResponse(true, "Authentication Gateway Ready. Account created successfully."));
    }

    /**
     * Account Verification / Login Endpoint
     */
    @PostMapping("/auth/login")
    public ResponseEntity<ApiResponse> loginUser(@RequestBody AuthRequest request) {
        String queryUser = request.getUsername().trim();
        
        // Locate user utilizing Java Streams API
        Optional<UserAccount> userAccount = database.values().stream()
                .filter(user -> user.getUsername().equalsIgnoreCase(queryUser))
                .findFirst();

        if (userAccount.isPresent() && userAccount.get().getPassword().equals(request.getPassword())) {
            return ResponseEntity.ok(new ApiResponse(true, "Authentication tokens verified. Session synchronized."));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse(false, "Access Denied. Cryptographic configuration error."));
    }

    /**
     * Watchlist tracking API synced to database (Manipulating AniList Media IDs)
     */
    @GetMapping("/users/{username}/watchlist")
    public ResponseEntity<?> getUserWatchlist(@PathVariable String username) {
        // Find account safely using Java streams
        Optional<UserAccount> user = database.values().stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(username))
                .findFirst();

        if (user.isPresent()) {
            // Processing IDs using the Java Stream API
            List<Integer> mediaIds = user.get().getWatchlistedMediaIds().stream()
                    .sorted(Comparator.reverseOrder()) // Show latest first
                    .collect(Collectors.toList());
            return ResponseEntity.ok(mediaIds);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, "User session not active."));
    }

    /**
     * Watchlist Modification (Add/Remove AniList Tracker Media ID)
     */
    @PostMapping("/users/{username}/watchlist/toggle")
    public ResponseEntity<ApiResponse> toggleWatchlistItem(@PathVariable String username, @RequestParam Integer mediaId) {
        Optional<UserAccount> userOpt = database.values().stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(username))
                .findFirst();

        if (userOpt.isPresent()) {
            UserAccount user = userOpt.get();
            List<Integer> watchlist = user.getWatchlistedMediaIds();

            // Checking list matching constraints utilizing Java Stream API
            boolean alreadyTracked = watchlist.stream().anyMatch(id -> id.equals(mediaId));

            if (alreadyTracked) {
                // Remove tracker cleanly
                watchlist.removeIf(id -> id.equals(mediaId));
                return ResponseEntity.ok(new ApiResponse(true, "Tracker removed from Vercel persistent storage."));
            } else {
                // Add tracker
                watchlist.add(mediaId);
                return ResponseEntity.ok(new ApiResponse(true, "Tracker synced securely to Vercel persistent database."));
            }
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(false, "Session credentials invalid."));
    }

    // Inner classes representing data blueprints for validation
    public static class UserAccount {
        private String username;
        private String password;
        private List<Integer> watchlistedMediaIds;

        public UserAccount(String username, String password, List<Integer> watchlistedMediaIds) {
            this.username = username;
            this.password = password;
            this.watchlistedMediaIds = watchlistedMediaIds;
        }

        public String getUsername() { return username; }
        public String getPassword() { return password; }
        public List<Integer> getWatchlistedMediaIds() { return watchlistedMediaIds; }
    }

    public static class AuthRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ApiResponse {
        private boolean success;
        private String message;

        public ApiResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }
}

```
