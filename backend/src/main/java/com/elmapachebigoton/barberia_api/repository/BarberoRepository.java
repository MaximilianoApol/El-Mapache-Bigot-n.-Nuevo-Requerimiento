package com.elmapachebigoton.barberia_api.repository;

import com.elmapachebigoton.barberia_api.model.Barbero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarberoRepository extends JpaRepository<Barbero, Integer> {
}
