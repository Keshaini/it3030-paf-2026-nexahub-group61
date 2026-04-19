package com.nexahub.nexahub_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.nexahub.nexahub_api", "com.edutrack.backend"})
@EnableJpaRepositories(basePackages = {"com.nexahub.nexahub_api", "com.edutrack.backend"})
@EntityScan(basePackages = {"com.nexahub.nexahub_api", "com.edutrack.backend"})
public class NexahubApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(NexahubApiApplication.class, args);
	}

}
