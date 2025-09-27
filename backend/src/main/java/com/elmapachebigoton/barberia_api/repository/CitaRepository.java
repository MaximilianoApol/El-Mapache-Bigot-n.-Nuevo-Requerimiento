package com.elmapachebigoton.barberia_api.repository;

import com.elmapachebigoton.barberia_api.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Integer> {
}
