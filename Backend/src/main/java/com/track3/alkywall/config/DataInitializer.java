package com.track3.alkywall.config;

import com.track3.alkywall.models.Category;
import com.track3.alkywall.models.PaymentMethod;
import com.track3.alkywall.models.Role;
import com.track3.alkywall.models.User;
import com.track3.alkywall.repositories.CategoryRepository;
import com.track3.alkywall.repositories.PaymentMethodRepository;
import com.track3.alkywall.repositories.RoleRepository;
import com.track3.alkywall.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    public CommandLineRunner initRolesAndCategories(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            CategoryRepository categoryRepository,
            PaymentMethodRepository paymentMethodRepository,
            JdbcTemplate jdbcTemplate
    ) {
        return args -> {
            // Ajusta columnas en las tablas si faltan
            try {
                jdbcTemplate.execute("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS account_id BIGINT;");
                jdbcTemplate.execute("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS category_id BIGINT;");
                jdbcTemplate.execute("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS status VARCHAR(255);");
                jdbcTemplate.execute("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS type VARCHAR(255);");
                jdbcTemplate.execute("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;");
                jdbcTemplate.execute("ALTER TABLE transaction ADD COLUMN IF NOT EXISTS amount NUMERIC(38,2);");
                jdbcTemplate.execute("ALTER TABLE transfers ADD COLUMN IF NOT EXISTS related_account_id BIGINT;");
                jdbcTemplate.execute("ALTER TABLE transfers ADD COLUMN IF NOT EXISTS description VARCHAR(255);");
                jdbcTemplate.execute("ALTER TABLE payments ADD COLUMN IF NOT EXISTS category VARCHAR(50);");
            } catch (Exception ignored) {}

            if(roleRepository.count() == 0){
                roleRepository.save(new Role("ADMIN"));
                roleRepository.save(new Role("USER"));
            }

            // Creación de usuario admin
            if(userRepository.findByEmail("admin@alkywall.com").isEmpty()){
                userRepository.save(new User(
                        "admin",
                        "",
                        "admin@alkywall.com",
                        passwordEncoder.encode("adminpassword"),
                        "",
                        roleRepository.findByName("ADMIN").get()
                ));
            }

            if (categoryRepository.findByName("DEPOSIT").isEmpty()) {
                categoryRepository.save(new Category("DEPOSIT"));
            }
            if (categoryRepository.findByName("TRANSFER").isEmpty()) {
                categoryRepository.save(new Category("TRANSFER"));
            }
            if (categoryRepository.findByName("PAYMENT").isEmpty()) {
                categoryRepository.save(new Category("PAYMENT"));
            }

            // Precarga del método de pago QR
            if (paymentMethodRepository.findByName("QR").isEmpty()) {
                paymentMethodRepository.save(new PaymentMethod("QR"));
            }
        };
    }
}