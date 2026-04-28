package com.nexahub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
    "com.nexahub",
    "com.edutrack.backend"
})
public class NexahubApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexahubApiApplication.class, args);
    }
}