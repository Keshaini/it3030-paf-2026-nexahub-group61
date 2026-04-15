package com.edutrack.backend.auth.controller;

import com.edutrack.backend.auth.dto.AuthResponse;
import com.edutrack.backend.auth.dto.AdminCreateAccountRequest;
import com.edutrack.backend.auth.dto.AdminUpdateUserRequest;
import com.edutrack.backend.auth.dto.AdminUserDto;
import com.edutrack.backend.auth.dto.ForgotPasswordRequest;
import com.edutrack.backend.auth.dto.LoginRequest;
import com.edutrack.backend.auth.dto.NotificationPreferencesResponse;
import com.edutrack.backend.auth.dto.SignUpRequest;
import com.edutrack.backend.auth.dto.UpdateNotificationPreferencesRequest;
import com.edutrack.backend.auth.service.AuthService;
import com.edutrack.backend.auth.service.NotificationPreferenceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final NotificationPreferenceService notificationPreferenceService;

    public AuthController(AuthService authService, NotificationPreferenceService notificationPreferenceService) {
        this.authService = authService;
        this.notificationPreferenceService = notificationPreferenceService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        AuthResponse response = authService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        AuthResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/users")
    public ResponseEntity<AuthResponse> createAdminAccount(@Valid @RequestBody AdminCreateAccountRequest request) {
        AuthResponse response = authService.createAccountByAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/admin/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsersForAdmin());
    }

    @PutMapping("/admin/users/{id}")
    public ResponseEntity<AdminUserDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        return ResponseEntity.ok(authService.updateUserByAdmin(id, request));
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        authService.deleteUserByAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/notification-preferences")
    public ResponseEntity<NotificationPreferencesResponse> getNotificationPreferences(
            @RequestParam String email
    ) {
        return ResponseEntity.ok(notificationPreferenceService.getPreferencesByEmail(email));
    }

    @PutMapping("/notification-preferences")
    public ResponseEntity<NotificationPreferencesResponse> updateNotificationPreferences(
            @Valid @RequestBody UpdateNotificationPreferencesRequest request
    ) {
        return ResponseEntity.ok(notificationPreferenceService.updatePreferences(request));
    }

    @GetMapping("/notification-preferences/categories")
    public ResponseEntity<List<String>> getNotificationCategories() {
        return ResponseEntity.ok(notificationPreferenceService.getSupportedCategories());
    }
}
