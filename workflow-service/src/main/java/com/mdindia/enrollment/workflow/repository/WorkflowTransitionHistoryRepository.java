package com.mdindia.enrollment.workflow.repository;

import com.mdindia.enrollment.workflow.entity.WorkflowTransitionHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowTransitionHistoryRepository extends JpaRepository<WorkflowTransitionHistoryEntity, String> {
    List<WorkflowTransitionHistoryEntity> findByWorkflowInstanceId(String workflowInstanceId);
}
