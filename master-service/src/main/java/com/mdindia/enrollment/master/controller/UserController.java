package com.mdindia.enrollment.master.controller;

import com.mdindia.enrollment.common.dto.ApiResponse;
import com.mdindia.enrollment.master.entity.UserEntity;
import com.mdindia.enrollment.master.entity.UserGroupEntity;
import com.mdindia.enrollment.master.repository.UserGroupRepository;
import com.mdindia.enrollment.master.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserGroupRepository groupRepository;
    private final UserRepository userRepository;

    public UserController(UserGroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/groups")
    public ApiResponse<List<UserGroupEntity>> getGroups() {
        return ApiResponse.ofList(groupRepository.findAll());
    }

    @GetMapping("/groups/{name}/members")
    public ApiResponse<List<UserEntity>> getGroupMembers(@PathVariable String name) {
        return ApiResponse.ofList(userRepository.findByGroupName(name));
    }

    @GetMapping("/users")
    public ApiResponse<List<UserEntity>> getAllUsers() {
        return ApiResponse.ofList(userRepository.findAll());
    }
}
