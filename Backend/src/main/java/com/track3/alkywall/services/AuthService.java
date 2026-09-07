package com.track3.alkywall.services;

import com.track3.alkywall.config.exceptions.LoginFailedException;
import com.track3.alkywall.config.exceptions.NotFoundException;
import com.track3.alkywall.config.exceptions.AlreadyExistsException;
import com.track3.alkywall.models.User;
import com.track3.alkywall.repositories.RoleRepository;
import com.track3.alkywall.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final AccountService accountService;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository, AccountService accountService, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.accountService = accountService;
        this.notificationService = notificationService;
    }

    @Transactional
    public void registerUser(String firstName, String lastName, String email, String password, String dni){
        if(userRepository.existsByEmailOrDni(email, dni)) throw new AlreadyExistsException("El usuario ya existe");

        User user = userRepository.save(new User(
                firstName,
                lastName,
                email,
                passwordEncoder.encode(password),
                dni,
                roleRepository.findByName("USER").orElseThrow(() -> new NotFoundException("El rol no existe"))
        ));

        accountService.createAccount(user, "ARS");

        // Notificación de bienvenida
        notificationService.createNotification(
                user,
                "¡Bienvenido a Alkywall!",
                "Tu cuenta ha sido creada exitosamente. Ya podés comenzar a operar.",
                "WELCOME"
        );
    }

    // Valida credenciales y retorna el usuario autenticado
    public User loginUser(String email, String loginPassword){
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new LoginFailedException("Email o contraseña incorrectos")
        );

        if(!passwordEncoder.matches(loginPassword, user.getPassword())){
            throw new LoginFailedException("Email o contraseña incorrectos");
        }

        // Si el usuario está suspendido por el admin, no lo dejamos ingresar
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new LoginFailedException("Tu cuenta se encuentra suspendida. Contactá al soporte.");
        }

        return user;
    }
}
