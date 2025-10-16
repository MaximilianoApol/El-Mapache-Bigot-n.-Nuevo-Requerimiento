package com.elmapachebigoton.barberia_api.controller;

import com.elmapachebigoton.barberia_api.model.Sucursal;
import com.elmapachebigoton.barberia_api.repository.SucursalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {

    @Autowired
    private SucursalRepository sucursalRepository;

    @GetMapping
    public ResponseEntity<Iterable<Sucursal>> findAll() {
        return ResponseEntity.ok(sucursalRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sucursal> findById(@PathVariable Integer id) {
        Optional<Sucursal> sucursal = sucursalRepository.findById(id);
        return sucursal.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Sucursal> create(@RequestBody Sucursal sucursal, UriComponentsBuilder uriBuilder) {
        // Validación: dirección requerida y mínimo 5 caracteres
        if (sucursal.getDireccion() == null || sucursal.getDireccion().trim().length() < 5) {
            return ResponseEntity.badRequest().build();
        }
        
        Sucursal created = sucursalRepository.save(sucursal);
        URI uri = uriBuilder.path("api/sucursales/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Integer id, @RequestBody Sucursal sucursal) {
        if (!sucursalRepository.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        // Validación: dirección requerida y mínimo 5 caracteres
        if (sucursal.getDireccion() == null || sucursal.getDireccion().trim().length() < 5) {
            return ResponseEntity.badRequest().build();
        }
        
        sucursal.setId(id);
        sucursalRepository.save(sucursal);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!sucursalRepository.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        sucursalRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}