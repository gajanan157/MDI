package com.mdindia.enrollment.master.repository;

import com.mdindia.enrollment.master.entity.BrokerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrokerRepository extends JpaRepository<BrokerEntity, String> {
}
