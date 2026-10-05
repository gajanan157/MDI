package com.mdindia.enrollment.master.repository;

import com.mdindia.enrollment.master.entity.AgentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgentRepository extends JpaRepository<AgentEntity, String> {
}
