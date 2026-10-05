package com.mdindia.enrollment.master.repository;

import com.mdindia.enrollment.master.entity.UserGroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserGroupRepository extends JpaRepository<UserGroupEntity, String> {
}
