package com.mdindia.enrollment.master.repository;

import com.mdindia.enrollment.master.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    List<UserEntity> findByGroupName(String groupName);
}
