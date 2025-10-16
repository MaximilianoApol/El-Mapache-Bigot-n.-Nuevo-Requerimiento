
package com.elmapachebigoton.barberia_api.repository;

import com.elmapachebigoton.barberia_api.model.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SucursalRepository extends JpaRepository<Sucursal, Integer> {
}