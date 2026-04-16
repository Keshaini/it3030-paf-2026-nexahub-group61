package com.edutrack.backend.auth.service;

import com.edutrack.backend.auth.dto.AuthResponse;
import com.edutrack.backend.auth.dto.AdminCreateAccountRequest;
import com.edutrack.backend.auth.dto.AdminUpdateUserRequest;
import com.edutrack.backend.auth.dto.AdminUserDto;
import com.edutrack.backend.auth.dto.ForgotPasswordRequest;
import com.edutrack.backend.auth.dto.LoginRequest;
import com.edutrack.backend.auth.dto.SignUpRequest;
import com.edutrack.backend.auth.config.RoleNames;
import com.edutrack.backend.auth.entity.UserAccount;
import com.edutrack.backend.auth.exception.AuthException;
import com.edutrack.backend.auth.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@Service
public class AuthService {

    private static final Pattern TECHNICIAN_IT_NUMBER_PATTERN = Pattern.compile("^ITTECH(\\d{3})$");

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse signUp(SignUpRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String normalizedItNumber = normalizeItNumber(request.itNumber());

        if (!request.password().equals(request.confirmPassword())) {
            throw new AuthException("Passwords do not match");
        }

        if (userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new AuthException("An account with this email already exists");
        }

        if (userAccountRepository.existsByItNumberIgnoreCase(normalizedItNumber)) {
            throw new AuthException("An account with this IT number already exists");
        }

        UserAccount userAccount = new UserAccount();
        userAccount.setFullName(request.fullName().trim());
        userAccount.setItNumber(normalizedItNumber);
        userAccount.setEmail(normalizedEmail);
        userAccount.setPasswordHash(passwordEncoder.encode(request.password()));
        userAccount.setRole(RoleNames.USER);

        UserAccount saved = userAccountRepository.save(userAccount);

        return AuthResponse.success(
                "Signup successful",
                saved.getEmail(),
            saved.getItNumber(),
                saved.getFullName(),
                saved.getRole()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        UserAccount userAccount = userAccountRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new AuthException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), userAccount.getPasswordHash())) {
            throw new AuthException("Invalid email or password");
        }

        String normalizedRole = RoleNames.normalize(userAccount.getRole());

        return AuthResponse.success(
                "Login successful",
                userAccount.getEmail(),
            userAccount.getItNumber(),
                userAccount.getFullName(),
            normalizedRole
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        boolean accountExists = userAccountRepository.existsByEmailIgnoreCase(normalizedEmail);
        if (!accountExists) {
            return AuthResponse.messageOnly("If the email exists, a password reset link has been sent.");
        }

        return AuthResponse.messageOnly("If the email exists, a password reset link has been sent.");
    }

    @Transactional
    public AuthResponse createAccountByAdmin(AdminCreateAccountRequest request) {
        String normalizedRole = request.role().trim().toUpperCase(Locale.ROOT);
        boolean isStudent = "STUDENT".equals(normalizedRole);
        boolean isTechnician = RoleNames.TECHNICIAN.equals(normalizedRole);

        String normalizedItNumber = resolveItNumberForAdminCreate(request.itNumber(), normalizedRole, isStudent, isTechnician);

        String normalizedEmail = resolveEmailForAdminCreate(request, normalizedItNumber, isStudent);
        String resolvedFullName = resolveFullNameForAdminCreate(request, normalizedItNumber, isStudent);
        String resolvedPassword = resolvePasswordForAdminCreate(request, normalizedItNumber, isStudent);

        if (userAccountRepository.existsByItNumberIgnoreCase(normalizedItNumber)) {
            throw new AuthException("An account with this IT number already exists");
        }

        if (userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new AuthException("An account with this email already exists");
        }

        UserAccount userAccount = new UserAccount();
        userAccount.setFullName(resolvedFullName);
        userAccount.setItNumber(normalizedItNumber);
        userAccount.setEmail(normalizedEmail);
        userAccount.setPasswordHash(passwordEncoder.encode(resolvedPassword));
        userAccount.setRole(normalizedRole);

        UserAccount saved = userAccountRepository.save(userAccount);

        return AuthResponse.success(
                "Admin account created successfully",
                saved.getEmail(),
                saved.getItNumber(),
                saved.getFullName(),
                saved.getRole()
        );
    }

    private String resolveItNumberForAdminCreate(String itNumber, String normalizedRole, boolean isStudent, boolean isTechnician) {
        if (itNumber != null && !itNumber.isBlank()) {
            String normalizedItNumber = normalizeItNumber(itNumber);
            if (isTechnician) {
                if (!TECHNICIAN_IT_NUMBER_PATTERN.matcher(normalizedItNumber).matches()) {
                    throw new AuthException("Technician IT number must match format ITTECH001");
                }
                return normalizedItNumber;
            }

            if (!normalizedItNumber.matches("^IT\\d{8}$")) {
                throw new AuthException("IT number must match format IT23608054");
            }
            return normalizedItNumber;
        }

        if (isStudent) {
            throw new AuthException("IT number is required for students");
        }

        if (isTechnician) {
            return generateTechnicianItNumber();
        }

        return generateItNumber();
    }

    private String generateTechnicianItNumber() {
        int nextSequence = userAccountRepository.findAll().stream()
                .map(UserAccount::getItNumber)
                .map(TECHNICIAN_IT_NUMBER_PATTERN::matcher)
                .filter(Matcher::matches)
                .mapToInt(matcher -> Integer.parseInt(matcher.group(1)))
                .max()
                .orElse(0) + 1;

        String generatedItNumber;
        do {
            generatedItNumber = String.format("ITTECH%03d", nextSequence++);
        } while (userAccountRepository.existsByItNumberIgnoreCase(generatedItNumber));

        return generatedItNumber;
    }

    private String generateItNumber() {
        String generatedItNumber;
        do {
            generatedItNumber = String.format("IT%08d", ThreadLocalRandom.current().nextInt(100_000_000));
        } while (userAccountRepository.existsByItNumberIgnoreCase(generatedItNumber));

        return generatedItNumber;
    }

    private String resolveEmailForAdminCreate(AdminCreateAccountRequest request, String normalizedItNumber, boolean isStudent) {
        String email = request.email();
        if (email != null && !email.isBlank()) {
            return normalizeEmail(email);
        }

        if (isStudent) {
            return normalizedItNumber.toLowerCase(Locale.ROOT) + "@smartcampus.local";
        }

        throw new AuthException("Email is required for this role");
    }

    private String resolveFullNameForAdminCreate(AdminCreateAccountRequest request, String normalizedItNumber, boolean isStudent) {
        String fullName = request.fullName();
        if (fullName != null && !fullName.isBlank()) {
            return fullName.trim();
        }

        if (isStudent) {
            return "Student " + normalizedItNumber;
        }

        throw new AuthException("Full name is required for this role");
    }

    private String resolvePasswordForAdminCreate(AdminCreateAccountRequest request, String normalizedItNumber, boolean isStudent) {
        String password = request.password();
        if (password != null && !password.isBlank()) {
            return password;
        }

        if (isStudent) {
            return normalizedItNumber + "@Stu";
        }

        throw new AuthException("Password is required for this role");
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllUsersForAdmin() {
        return userAccountRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AdminUserDto::fromEntity)
                .toList();
    }

    @Transactional
    public AdminUserDto updateUserByAdmin(Long userId, AdminUpdateUserRequest request) {
        UserAccount existingUser = userAccountRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));

        String normalizedEmail = normalizeEmail(request.email());
        String normalizedItNumber = normalizeItNumber(request.itNumber());
        String normalizedRole = request.role().trim().toUpperCase(Locale.ROOT);

        if (userAccountRepository.existsByEmailIgnoreCaseAndIdNot(normalizedEmail, userId)) {
            throw new AuthException("An account with this email already exists");
        }

        if (userAccountRepository.existsByItNumberIgnoreCaseAndIdNot(normalizedItNumber, userId)) {
            throw new AuthException("An account with this IT number already exists");
        }

        existingUser.setFullName(request.fullName().trim());
        existingUser.setEmail(normalizedEmail);
        existingUser.setItNumber(normalizedItNumber);
        existingUser.setRole(normalizedRole);

        UserAccount saved = userAccountRepository.save(existingUser);
        return AdminUserDto.fromEntity(saved);
    }

    @Transactional
    public void deleteUserByAdmin(Long userId) {
        UserAccount existingUser = userAccountRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));
        userAccountRepository.delete(existingUser);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeItNumber(String itNumber) {
        return itNumber.trim().toUpperCase(Locale.ROOT);
    }
}
