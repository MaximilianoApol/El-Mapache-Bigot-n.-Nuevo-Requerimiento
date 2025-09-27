package com.elmapachebigoton.barberia_api.controller;

import com.elmapachebigoton.barberia_api.model.Servicio;
import com.elmapachebigoton.barberia_api.repository.ServicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    @Autowired
    private ServicioRepository servicioRepository;

    @GetMapping
    public ResponseEntity<Iterable<Servicio>> findAll() {
        return ResponseEntity.ok(servicioRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servicio> findById(@PathVariable Integer id) {
        Optional<Servicio> servicio = servicioRepository.findById(id);
        return servicio.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Servicio> create(@RequestBody Servicio servicio, UriComponentsBuilder uriBuilder) {
        Servicio created = servicioRepository.save(servicio);
        URI uri = uriBuilder.path("/servicios/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Integer id, @RequestBody Servicio servicio) {
        if (!servicioRepository.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        servicio.setId(id);
        servicioRepository.save(servicio);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!servicioRepository.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        servicioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
