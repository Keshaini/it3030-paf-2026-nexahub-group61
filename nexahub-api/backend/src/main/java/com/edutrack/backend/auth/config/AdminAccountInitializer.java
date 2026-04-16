package com.edutrack.backend.auth.config;

import com.edutrack.backend.auth.entity.UserAccount;
import com.edutrack.backend.auth.repository.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

import static com.edutrack.backend.auth.config.RoleNames.ADMIN;
import static com.edutrack.backend.auth.config.RoleNames.MANAGER;
import static com.edutrack.backend.auth.config.RoleNames.TECHNICIAN;

@Component
public class AdminAccountInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@smartcampus.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.admin.full-name:System Admin}")
    private String adminFullName;

    @Value("${app.admin.it-number:ITADMIN01}")
    private String adminItNumber;

    @Value("${app.manager.email:manager@smartcampus.com}")
    private String managerEmail;

    @Value("${app.manager.password:Manager@123}")
    private String managerPassword;

    @Value("${app.manager.full-name:Campus Manager}")
    private String managerFullName;

    @Value("${app.manager.it-number:ITMANAGER1}")
    private String managerItNumber;

    @Value("${app.technician.email:technician@smartcampus.com}")
    private String technicianEmail;

    @Value("${app.technician.password:Tech@123}")
    private String technicianPassword;

    @Value("${app.technician.full-name:Maintenance Technician}")
    private String technicianFullName;

    @Value("${app.technician.it-number:ITTECH001}")
    private String technicianItNumber;

    public AdminAccountInitializer(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedAccount(adminEmail, adminPassword, adminFullName, adminItNumber, ADMIN);
        seedAccount(managerEmail, managerPassword, managerFullName, managerItNumber, MANAGER);
        seedAccount(technicianEmail, technicianPassword, technicianFullName, technicianItNumber, TECHNICIAN);
    }

    private void seedAccount(String email, String password, String fullName, String itNumber, String role) {
        String normalizedEmail = normalizeEmail(email);

        if (userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            logger.info("{} account already exists for email: {}", role, normalizedEmail);
            return;
        }

        UserAccount account = new UserAccount();
        account.setFullName(fullName.trim());
        account.setItNumber(normalizeItNumber(itNumber));
        account.setEmail(normalizedEmail);
        account.setPasswordHash(passwordEncoder.encode(password));
        account.setRole(role);

        userAccountRepository.save(account);
        logger.info("Default {} account created for email: {}", role, normalizedEmail);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeItNumber(String itNumber) {
        return itNumber.trim().toUpperCase(Locale.ROOT);
    }
}