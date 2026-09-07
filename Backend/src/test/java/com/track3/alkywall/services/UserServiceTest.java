package com.track3.alkywall.services;

import com.track3.alkywall.config.exceptions.NotFoundException;
import com.track3.alkywall.models.Role;
import com.track3.alkywall.models.User;
import com.track3.alkywall.repositories.RoleRepository;
import com.track3.alkywall.repositories.UserRepository;
import com.track3.alkywall.services.models.DomainUser;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @InjectMocks private UserService userService;

    @Test
    void shouldGetAllUsers(){
        User user1 = new User("", "", "email1@gmail.com", "", "", new Role("USER"));
        User user2 = new User("", "", "email2@gmail.com", "", "", new Role("ADMIN"));
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        List<DomainUser> domainUsers = userService.getAllUsers();

        assertEquals(2, domainUsers.size());
        assertEquals(user1.getEmail(), domainUsers.get(0).email());
        assertEquals(user2.getEmail(), domainUsers.get(1).email());
        verify(userRepository).findAll();
    }

    @Test
    void shouldGetUserById(){
        User user1 = new User("", "", "email@gmail.com", "", "", new Role("USER"));
        user1.setId(1L);
        when(userRepository.findById(user1.getId())).thenReturn(Optional.of(user1));

        DomainUser domainUser = userService.getUserById(user1.getId());

        assertNotNull(domainUser);
        assertEquals(user1.getId(), domainUser.id());
        verify(userRepository).findById(user1.getId());
    }

    @Test
    void shouldNotGetUserById(){
        when(userRepository.findById(1L)).thenThrow(NotFoundException.class);

        assertThrows(NotFoundException.class, () -> userService.getUserById(1L));
        verify(userRepository).findById(1L);
    }

    @Test
    void shouldUpdateUser(){ // Actualiza rol, email y dni
        User user = new User("", "", "old@gmail.com", "password", "oldDni", new Role("USER"));
        user.setId(1L);
        DomainUser newUser = new DomainUser(user.getId(), "firstName", "lastName", "new@gmail.com", "newDni", new Role("ADMIN"), false, user.getCreatedAt(), null);

        when(userRepository.findById(newUser.id())).thenReturn(Optional.of(user));
        when(roleRepository.findByName(newUser.role().getName())).thenReturn(Optional.of(new Role("ADMIN")));
        when(userRepository.existsByEmail(newUser.email())).thenReturn(false);
        when(userRepository.existsByDni(newUser.dni())).thenReturn(false);

        userService.update(newUser);

        assertEquals(newUser.role().getName(), user.getRole().getName());
        assertEquals(newUser.email(), user.getEmail());
        assertEquals(newUser.dni(), user.getDni());
        assertEquals(newUser.firstName(), user.getFirstName());
        assertEquals(newUser.lastName(), user.getLastName());
        assertEquals(newUser.isActive(), user.getIsActive());
        verify(userRepository).findById(newUser.id());
        verify(roleRepository).findByName(newUser.role().getName());
        verify(userRepository).existsByEmail(newUser.email());
        verify(userRepository).existsByDni(newUser.dni());
    }

    @Test
    void shouldNotUpdateUserNotFound(){
        DomainUser newUser = new DomainUser(1L, "", "", "", "", new Role("ADMIN"), true, LocalDateTime.now(), null);
        when(userRepository.findById(newUser.id())).thenThrow(NotFoundException.class);

        assertThrows(NotFoundException.class, () -> userService.update(newUser));
        verify(userRepository).findById(newUser.id());
    }

    @Test
    void shouldDeleteUser(){
        User user = new User("", "", "email@gmail.com", "", "", new Role("USER"));
        user.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        userService.delete(1L);

        verify(userRepository).findById(1L);
        verify(userRepository).delete(user);
    }
}
