package com.elmapachebigoton.barberia_api.controller;

import com.elmapachebigoton.barberia_api.model.Barbero;
import com.elmapachebigoton.barberia_api.repository.BarberoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/barberos")
public class BarberoController {

    @Autowired
    private BarberoRepository barberoRepository;

    @GetMapping
    public ResponseEntity<Iterable<Barbero>> findAll() {
        return ResponseEntity.ok(barberoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Barbero> findById(@PathVariable Integer id) {
        Optional<Barbero> barbero = barberoRepository.findById(id);
        return barbero.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Barbero> create(@RequestBody Barbero barbero, UriComponentsBuilder uriBuilder) {
        Barbero created = barberoRepository.save(barbero);
        URI uri = uriBuilder.path("/barberos/{id}").buildAndExpand(created.getId()).toUri();
        return ResponseEntity.created(uri).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Integer id, @RequestBody Barbero barbero) {
        if (!barberoRepository.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        barbero.setId(id);
        barberoRepository.save(barbero);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!barberoRepository.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        barberoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

