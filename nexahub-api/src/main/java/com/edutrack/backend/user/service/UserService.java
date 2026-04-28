package com.edutrack.backend.user.service;

import com.edutrack.backend.user.entity.User;

import java.util.List;

public interface UserService {

    User createUser(User user);

    List<User> getAllUsers();

    User getUserById(Long id);

    User updateUser(Long id, User updatedUser);

    void deleteUser(Long id);
}
