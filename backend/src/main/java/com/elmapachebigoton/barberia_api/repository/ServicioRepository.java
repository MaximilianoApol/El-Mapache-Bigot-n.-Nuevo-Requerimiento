package com.elmapachebigoton.barberia_api.repository;

import com.elmapachebigoton.barberia_api.model.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServicioRepository extends JpaRepository<Servicio, Integer> {
}
