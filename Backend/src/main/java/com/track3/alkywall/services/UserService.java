package com.track3.alkywall.services;

import com.track3.alkywall.config.exceptions.AlreadyExistsException;
import com.track3.alkywall.config.exceptions.NotFoundException;
import com.track3.alkywall.models.Account;
import com.track3.alkywall.models.Role;
import com.track3.alkywall.models.User;
import com.track3.alkywall.repositories.AccountRepository;
import com.track3.alkywall.repositories.RoleRepository;
import com.track3.alkywall.repositories.UserRepository;
import com.track3.alkywall.services.models.DomainUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AccountRepository accountRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, AccountRepository accountRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.accountRepository = accountRepository;
    }

    public List<DomainUser> getAllUsers(){
        return userRepository.findAll().stream().map(DomainUser::from).toList();
    }

    public DomainUser getUserById(Long id){
        User user = userRepository.findById(id).orElseThrow(
                () -> new NotFoundException("El usuario no existe")
        );

        return DomainUser.from(user);
    }

    public DomainUser getUserByEmail(String email){
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new NotFoundException("El usuario no existe")
        );

        return DomainUser.from(user);
    }

    @Transactional
    public void update(DomainUser newUser){
        User user = userRepository.findById(newUser.id()).orElseThrow(
                () -> new NotFoundException("El usuario no existe")
        );

        if(!user.getRole().getName().equals(newUser.role().getName())){
            Role role = roleRepository.findByName(newUser.role().getName()).orElseThrow(
                    () -> new NotFoundException("El rol no existe")
            );
            user.setRole(role);
        }

        if(!newUser.email().equals(user.getEmail())){
            if(userRepository.existsByEmail(newUser.email())) {
                throw new AlreadyExistsException("Ya existe un usuario con ese email");
            }
            user.setEmail(newUser.email());
        }

        if(!newUser.dni().equals(user.getDni())){
            if(userRepository.existsByDni(newUser.dni())){
                throw new AlreadyExistsException("Ya existe un usuario con ese DNI");
            }
            user.setDni(newUser.dni());
        }

        user.setFirstName(newUser.firstName());
        user.setLastName(newUser.lastName());
        user.setIsActive(newUser.isActive());
    }

    @Transactional
    public void toggleIsActive(Long id){
        userRepository.toggleIsActiveById(id);
    }

    @Transactional
    public void delete(Long id){
        User user = userRepository.findById(id).orElseThrow(
                () -> new NotFoundException("El usuario no existe")
        );

        // Si el usuario tiene cuenta asociada, la eliminamos primero
        if (user.getAccount() != null) {
            Account account = user.getAccount();
            user.setAccount(null);
            accountRepository.delete(account);
        }

        userRepository.delete(user);
    }

    @Transactional
    public DomainUser getUserByIdentifier(String accountIdentifier){
        return DomainUser.from(
                accountRepository.findByAccountNumberOrAlias(accountIdentifier).
                orElseThrow(
                        () -> new NotFoundException("No se encontraron cuentas con ese alias o cvu")
                ).getUser());
    }
}
