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
            // Asegura que la columna category exista en la tabla payments
            try {
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

            if(categoryRepository.count() == 0){
                categoryRepository.save(new Category("DEPOSIT"));
                categoryRepository.save(new Category("TRANSFER"));
                categoryRepository.save(new Category("PAYMENT"));
            }

            // Precarga del método de pago QR
            if(paymentMethodRepository.count() == 0){
                paymentMethodRepository.save(new PaymentMethod("QR"));
            }
        };
    }
}