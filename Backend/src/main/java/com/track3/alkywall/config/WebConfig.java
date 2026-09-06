package com.track3.alkywall.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Sirve los archivos estáticos de la carpeta Frontend en el puerto 8080
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path frontendPath = Paths.get("Frontend");
        if (!Files.exists(frontendPath)) {
            frontendPath = Paths.get("..", "Frontend");
        }
        
        registry.addResourceHandler("/Frontend/**")
                .addResourceLocations(frontendPath.toAbsolutePath().normalize().toUri().toString() + "/");
    }
}
